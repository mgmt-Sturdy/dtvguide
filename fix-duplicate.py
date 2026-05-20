#!/usr/bin/env python3
"""
Fix the corrupted JavaScript - remove duplicate calculateFinalResult
"""

with open('index.html', 'r') as f:
    content = f.read()

# Find where the function starts and remove the corrupted version
# Pattern: Look for the start of calculateFinalResult and remove until the next function

import re

# The corrupted section has duplicate code. Let's find and remove the duplicate
# Keep only the first occurrence of calculateFinalResult

pattern = r'(function calculateFinalResult\(\) \{[^}]+\}[^}]+\}[^}]+\}[^}]+\}[^}]+\}[^}]+\})'
matches = list(re.finditer(pattern, content, re.DOTALL))

print(f"Found {len(matches)} occurrences of calculateFinalResult")

if len(matches) > 1:
    # Keep only the first one, remove the rest
    first_end = matches[0].end()
    second_start = matches[1].start()
    
    # Remove content between first end and second start
    content = content[:first_end] + content[second_start:]
    print("Removed duplicate function")
else:
    print("Only one occurrence found, checking for other issues...")

# Write the fixed file
with open('index.html', 'w') as f:
    f.write(content)

print("Done")
