import random
import time
import requests
import base64
import sys
import curses


def fetch_random_github_code():
    """Fetch random code from a variety of GitHub repos."""
    random_repos = [
        "https://api.github.com/repos/python/cpython/contents/Lib",      # Python (CPython)
        "https://api.github.com/repos/expressjs/express/contents/lib",   # JavaScript (Express)
        "https://api.github.com/repos/tensorflow/tensorflow/contents/tensorflow",  # C++ (TensorFlow)
        "https://api.github.com/repos/nodejs/node/contents/lib",        # JavaScript (Node.js)
        "https://api.github.com/repos/django/django/contents/django",   # Python (Django)
        "https://api.github.com/repos/pytorch/pytorch/contents/torch",  # Python (PyTorch)
        "https://api.github.com/repos/keras-team/keras/contents/keras",  # Python (Keras)
        "https://api.github.com/repos/rust-lang/rust/contents/src",     # Rust
        "https://api.github.com/repos/angular/angular/contents/packages",  # TypeScript (Angular)
        "https://api.github.com/repos/opencv/opencv/contents/modules",  # C++ (OpenCV)
    ]
    repo_url = random.choice(random_repos)
    response = requests.get(repo_url)
    if response.status_code != 200:
        print("Error fetching repository contents!")
        sys.exit(1)

    repo_data = response.json()
    code_files = [file for file in repo_data if file['name'].endswith(('.py', '.js', '.cpp', '.ts'))]

    if not code_files:
        print("No code files found in this repository!")
        sys.exit(1)

    selected_file = random.choice(code_files)
    file_url = selected_file['url']
    file_response = requests.get(file_url)
    if file_response.status_code != 200:
        print("Error fetching file content!")
        sys.exit(1)

    file_data = file_response.json()
    content = file_data['content']
    decoded_content = base64.b64decode(content).decode('utf-8')

    return decoded_content


def typing_test(stdscr, code_snippet):
    """Handles the typing test, including error detection and scroll."""
    curses.curs_set(1)  # Show the cursor
    stdscr.clear()

    # Initialize color pairs for correct/incorrect text
    curses.start_color()
    curses.init_pair(1, curses.COLOR_GREEN, curses.COLOR_BLACK)  # Correct input
    curses.init_pair(2, curses.COLOR_RED, curses.COLOR_BLACK)    # Incorrect input
    curses.init_pair(3, curses.COLOR_WHITE, curses.COLOR_BLACK)  # Code to type

    max_y, max_x = stdscr.getmaxyx()
    line_height = max_y - 2  # Leave space for instructions and results

    stdscr.addstr(0, 0, "Type the code below. Errors will be highlighted in red.\n")
    stdscr.addstr(1, 0, "Press Enter to start typing...")
    stdscr.refresh()
    stdscr.getch()  # Wait for Enter to start

    # Split the code into lines
    code_lines = code_snippet.split('\n')
    total_lines = len(code_lines)
    typed_lines = ['' for _ in range(line_height)]  # Store the typed lines

    current_line = 0
    start_time = time.time()

    while current_line < total_lines:
        stdscr.clear()
        # Show the code snippet and typed lines with real-time error highlighting
        for i in range(min(line_height, total_lines - current_line)):
            line = code_lines[current_line + i]
            typed_line = typed_lines[i]
            y = i + 2  # Adjust y-coordinate for typing area

            # Highlight correctly typed characters in green, incorrect ones in red
            for x in range(min(len(line), len(typed_line))):
                if line[x] == typed_line[x]:
                    stdscr.addstr(y, x, typed_line[x], curses.color_pair(1))  # Correct
                else:
                    stdscr.addstr(y, x, typed_line[x], curses.color_pair(2))  # Incorrect

            # Display remaining code
            if len(typed_line) < len(line):
                stdscr.addstr(y, len(typed_line), line[len(typed_line):], curses.color_pair(3))

        stdscr.refresh()

        # Wait for the user to type one character at a time
        char = stdscr.getch()

        if char == 10:  # Enter key - go to the next line
            if typed_lines[current_line] == code_lines[current_line]:  # Check if line is correct
                current_line += 1
                if current_line < total_lines:
                    typed_lines.append('')  # Add a new line for typing
            else:
                # Don't proceed to the next line if there's an error
                stdscr.addstr(max_y - 1, 0, "Fix your mistake first!", curses.color_pair(2))
                stdscr.refresh()
                time.sleep(1)
                continue

        elif char == 27:  # Exit if ESC is pressed
            break

        elif char == 127:  # Backspace key (ASCII 127)
            if typed_lines[current_line]:
                typed_lines[current_line] = typed_lines[current_line][:-1]  # Remove last char

        elif 32 <= char <= 126:  # Printable characters only
            typed_lines[current_line] += chr(char)

    end_time = time.time()
    total_time = end_time - start_time

    # Show the final results
    stdscr.clear()
    stdscr.addstr(0, 0, f"Time Taken: {total_time:.2f} seconds\n")
    stdscr.refresh()
    stdscr.getch()


def main(stdscr):
    stdscr.clear()
    stdscr.refresh()
    print("Fetching a random code snippet from GitHub...\n")
    code_snippet = fetch_random_github_code()
    typing_test(stdscr, code_snippet)


if __name__ == "__main__":
    curses.wrapper(main)




