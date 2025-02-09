import os
import time
import curses
import random
import requests
import string
import json
from datetime import datetime

def get_random_compound_info(batch_size=5):
    """Fetch multiple random chemical names and molecular weights from PubChem"""
    while True:
        cids = ",".join(str(random.randint(1, 10000000)) for _ in range(batch_size))  # Request multiple at once
        url = f"https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/cid/{cids}/property/IUPACName,MolecularWeight/JSON"
        
        try:
            response = requests.get(url, timeout=1)
            if response.status_code != 200:
                continue
            data = response.json()
            properties = data.get("PropertyTable", {}).get("Properties", [])

            # Return the first valid chemical from the batch
            for prop in properties:
                name = prop.get("IUPACName")
                mol_weight = prop.get("MolecularWeight")
                if name and mol_weight:
                    return name, mol_weight
        except Exception:
            continue  # If the request fails, retry

def get_word_by_difficulty(stdscr, target_difficulty, tolerance=2.0, batch_size=5):
    """Fetch multiple random compounds, display them, and pick the best match in one step."""
    attempt = 1
    
    while True:
        candidates = []  # Store (name, weight, difficulty)
        stdscr.clear()
        stdscr.addstr(0, 0, f"Attempt {attempt}: Fetching {batch_size} compounds...")

        names_and_weights = [get_random_compound_info() for _ in range(batch_size)]

        for i, (name, mol_weight) in enumerate(names_and_weights):
            difficulty = calculate_difficulty(name, mol_weight)
            candidates.append((name, float(mol_weight), difficulty))
            
            # Display each candidate and its difficulty
            stdscr.addstr(2 + i, 0, f"🔍 {name[:30]}... | MW: {float(mol_weight):.2f} | Diff: {difficulty:.2f}")

        stdscr.refresh()
        time.sleep(0.05)  # Short pause to show candidates

        # Find the best match in the batch
        best_match = min(
            (c for c in candidates if abs(c[2] - target_difficulty) <= tolerance and target_difficulty <= c[2]),
            key=lambda x: abs(x[2] - target_difficulty),
            default=None
        )

        stdscr.addstr(2 + batch_size, 0, f"🔎 Searching for {target_difficulty:.2f} ± {tolerance:.2f}...")
        stdscr.refresh()
        time.sleep(0.15)  # Short pause before proceeding
        attempt += 1
        tolerance *= 1.5  # Gradually expand tolerance

        if best_match:
            name, mol_weight, difficulty = best_match
            stdscr.addstr(4 + batch_size, 0, f"✅ MATCH FOUND: {name} (Diff: {difficulty:.2f})")
            stdscr.refresh()
            time.sleep(0.75)  # Pause before returning
            return name, mol_weight, difficulty



def calculate_difficulty(word, mol_weight):
    """Exponential difficulty scaling based on length, special characters, and molecular weight"""
    length_factor = len(word) * 0.25  # Regular character length contributes half point each
    special_chars = sum(1 for char in word if char not in string.ascii_letters)  # Count non-letters
    special_factor = special_chars * 3  # Special characters are worth 2 points each
    mol_weight_factor = float(mol_weight) / 100  # Scale the difficulty based on molecular weight (assuming it's in grams/mol)
    difficulty = ((length_factor + special_factor) ** 1.5) *mol_weight_factor # Exponential scaling based on length and special chars
    

    return difficulty

def log_results(duration, wpm, total_score, total_errors, mode):
    """Log the results to a file with timestamp"""
    if not os.path.exists("results"):
        os.makedirs("results")

    timestamp = datetime.now().strftime("%Y-%m-%d_%H-%M-%S")
    filename = f"results/{mode}_{timestamp}.txt"
    
    with open(filename, "w") as file:
        file.write(f"Test Mode: {mode}\n")
        file.write(f"Test Duration: {duration:.2f} seconds\n")
        file.write(f"WPM: {wpm:.2f}\n")
        file.write(f"Total Score: {total_score}\n")
        file.write(f"Total Errors: {total_errors}\n")
    
    print(f"Results saved to {filename}")

def typing_test(stdscr, mode="IUPAC"):
    start_time = time.time()
    
    # Configure curses
    curses.curs_set(1)
    stdscr.clear()
    stdscr.nodelay(False)

    stdscr.addstr(0, 0, f"Fetching 30 {mode} names from PubChem ...")
    stdscr.refresh()

    words = []
    difficulties = []
    preset_difficulty = [round(150 * (1.5 ** n), 2) for n in range(10)]

    # Fetch words and molecular weights
    for _ in range(10):
        word, mol_weight, difficulty = get_word_by_difficulty(stdscr, preset_difficulty[_], tolerance = preset_difficulty[_] * 0.25)
        words.append(word)
        
        difficulties.append((difficulty, mol_weight))  # Store both difficulty and molecular weight
        stdscr.addstr(4,0,f"Loaded {len(words)} words ...")

    stdscr.clear()
    stdscr.addstr(0, 0, f"Typing Test ({mode} Mode): Type the chemical names exactly as shown.")
    stdscr.addstr(1, 0, "Errors appear in red. You must correct them to proceed.")
    stdscr.refresh()

    total_chars = 0
    total_errors = 0
    total_score = 0
    dec = 0.95

    for idx, (target, (difficulty, mol_weight)) in enumerate(zip(words, difficulties)):
        stdscr.clear()
        stdscr.addstr(4, 0, f"Word {idx + 1} (Difficulty: {difficulty:.2f})")
        stdscr.addstr(5, 0, target)
        stdscr.addstr(7, 0, "Your input: ")
        stdscr.refresh()

        input_y = 7
        input_x = len("Your input: ")
        typed = ""
        errors = 0
        current_difficulty = difficulty

        while True:
            stdscr.move(input_y, input_x + len(typed))
            key = stdscr.get_wch()

            if key in ("\b", "\x7f", "\x08") or key == curses.KEY_BACKSPACE:
                if typed:
                    typed = typed[:-1]
                    stdscr.move(input_y, input_x)
                    stdscr.clrtoeol()
                    stdscr.addstr(input_y, input_x, typed)
                    stdscr.refresh()
                continue

            if key == "\n":
                continue

            if typed != target[:len(typed)]:
                continue  # Force user to fix errors before proceeding

            if len(typed) < len(target) and key == target[len(typed)]:
                typed += key
                stdscr.addstr(input_y, input_x, typed)
                stdscr.refresh()
            else:
                typed += key
                errors += 1  
                current_difficulty = max(1, current_difficulty * dec)
                dec *= 0.75  # Exponential decay of difficulty

                correct_length = 0
                for i in range(len(typed)):
                    if i < len(target) and typed[i] == target[i]:
                        correct_length += 1
                    else:
                        break

                correct_part = typed[:correct_length]
                error_part = typed[correct_length:]

                stdscr.move(input_y, input_x)
                stdscr.clrtoeol()
                stdscr.addstr(input_y, input_x, correct_part)
                stdscr.attron(curses.color_pair(1))
                stdscr.addstr(error_part)
                stdscr.attroff(curses.color_pair(1))
                stdscr.refresh()

            # **Redraw the difficulty** every time it changes
            stdscr.move(4, 0)
            stdscr.clrtoeol()
            stdscr.addstr(4, 0, f"Word {idx + 1} (Difficulty: {difficulty:.2f}, Mistake Weight: {(1-dec)*100}, Lost points: {difficulty-current_difficulty:.2f})")
            stdscr.refresh()

            if typed == target:
                break

        total_chars += len(target)
        total_errors += errors
        word_score = (current_difficulty * 100) - (errors * current_difficulty*1.1)  # Mistake penalty scales with difficulty
        total_score += max(word_score, 0)  # Don't allow negative score

    end_time = time.time()
    duration = end_time - start_time
    minutes = duration / 60
    wpm = (total_chars / 5) / minutes if minutes > 0 else 0

    # Make sure we are not going beyond the window's height
    print(f"Test Complete! Time: {duration:.2f} seconds")
    print(f"WPM: {wpm:.2f}")
    print(f"Total Score: {total_score}")
    print(f"Total Errors: {total_errors}")


    # Save results to file
    log_results(duration, wpm, total_score, total_errors, mode)


    stdscr.getch()

def main(stdscr):
    curses.start_color()
    curses.init_pair(1, curses.COLOR_RED, curses.COLOR_BLACK)
    mode = "IUPAC"  # Default mode
    typing_test(stdscr, mode)

if __name__ == "__main__":
    curses.wrapper(main)
