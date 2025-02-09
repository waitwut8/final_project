import re
import string
# Scrabble letter scores
SCRABBLE_SCORES = {
    'A': 1, 'B': 3, 'C': 3, 'D': 2, 'E': 1, 'F': 4, 'G': 2, 'H': 4, 'I': 1,
    'J': 8, 'K': 5, 'L': 1, 'M': 3, 'N': 1, 'O': 1, 'P': 3, 'Q': 10, 'R': 1,
    'S': 1, 'T': 1, 'U': 1, 'V': 4, 'W': 4, 'X': 8, 'Y': 4, 'Z': 10
}

def calculate_difficulty(word):
    """Exponential difficulty scaling based on length, special characters, and molecular weight"""
    length_factor = len(word) * 0.25  # Regular character length contributes half point each
    special_chars = sum(1 for char in word if char not in string.ascii_letters)  # Count non-letters
    special_factor = special_chars * 3  # Special characters are worth 2 points each
  # Scale the difficulty based on molecular weight (assuming it's in grams/mol)
    difficulty = ((length_factor + special_factor) ** 1.5) # Exponential scaling based on length and special chars
    

    return difficulty

def process_file(filename):
    """Read words from a file and calculate Scrabble scores."""
    try:
        with open(filename, 'r+', errors='ignore') as file:
            words = file.readlines()
        
        to_calc = ""
        for word in words:
            to_calc += word
        print(calculate_difficulty(to_calc))
    except FileNotFoundError:
        print(f"Error: File '{filename}' not found.")

# Example usage
filename = "words.txt"
process_file(filename)
