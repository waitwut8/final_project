#!/usr/bin/env python3
import curses
import random
import requests
import time

def get_random_compound_name():
    """
    Try random PubChem CIDs until one returns an IUPACName.
    """
    while True:
        # Pick a random CID; note that PubChem’s range is very sparse,
        # so we try until we find one with a proper IUPACName.
        cid = random.randint(1, 100000)
        url = f"https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/cid/{cid}/property/IUPACName/JSON"
        try:
            response = requests.get(url, timeout=5)
            if response.status_code != 200:
                continue
            data = response.json()
            properties = data.get("PropertyTable", {}).get("Properties", [])
            if not properties:
                continue
            name = properties[0].get("IUPACName")
            if not name:
                continue
            return name
        except Exception:
            continue

def typing_test(stdscr):
    # Configure the curses screen:
    curses.curs_set(1)
    stdscr.clear()
    stdscr.nodelay(False)  # make get_wch blocking

    # Fetch a list of 30 random chemical names from PubChem
    stdscr.addstr(0, 0, "Fetching 30 chemical names from PubChem ...")
    stdscr.refresh()
    words = [get_random_compound_name() for _ in range(5)]

    # Setup instructions and display the first target word.
    stdscr.clear()
    stdscr.addstr(0, 0, "Typing Test: Type each of the following chemical names.")
    stdscr.addstr(1, 0, "If you type an incorrect character, it will be shown in red.")
    stdscr.addstr(2, 0, "You must backspace to correct mistakes before proceeding.")
    stdscr.refresh()

    for idx, target in enumerate(words):
        stdscr.clear()
        stdscr.addstr(4, 0, f"Word {idx + 1}:")
        stdscr.addstr(5, 0, target)
        stdscr.addstr(7, 0, "Your input: ")
        stdscr.refresh()

        input_y = 7
        input_x = len("Your input: ")

        typed = ""
        while True:
            stdscr.move(input_y, input_x + len(typed))
            try:
                key = stdscr.get_wch()  # get a wide char input
            except curses.error:
                continue

            # Handle backspace (different terminals send different codes)
            if key in ("\b", "\x7f", "\x08") or key == curses.KEY_BACKSPACE:
                if typed:
                    typed = typed[:-1]
                    # Clear the input area and re-display the typed text.
                    stdscr.move(input_y, input_x)
                    stdscr.clrtoeol()
                    # Display correctly typed text normally.
                    stdscr.addstr(input_y, input_x, typed)
                    stdscr.refresh()
                continue

            # Ignore Enter key
            if key == "\n":
                continue

            # If there is already an error in the typed text, only accept backspace.
            # (That is: if the current typed string is not an exact prefix of target.)
            if typed != target[:len(typed)]:
                # Do not allow additional characters until the error is fixed.
                continue

            # Now, if no error exists so far, check the new character:
            if len(typed) < len(target) and key == target[len(typed)]:
                # Correct character typed
                typed += key
                stdscr.addstr(input_y, input_x, typed)
                stdscr.refresh()
            else:
                # Wrong character typed – add it so that it shows, but in red.
                typed += key
                # Determine the portion that is still correct.
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

            # If the user has correctly typed the whole string, finish the word.
            if typed == target:
                break

    stdscr.addstr(9, 0, "Test complete! Press any key to exit.")
    stdscr.getch()

def main(stdscr):
    # Initialize colors: pair 1 is red text on black.
    curses.start_color()
    curses.init_pair(1, curses.COLOR_RED, curses.COLOR_BLACK)
    typing_test(stdscr)

if __name__ == "__main__":
    curses.wrapper(main)
