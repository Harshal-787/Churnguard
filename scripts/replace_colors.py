import os
import glob

replacements = {
    '#00F0FF': '#2563EB',
    '#00A3CC': '#1D4ED8',
    '#7000FF': '#FF2E63',
    '#A366FF': '#FF4C79',
    'rgba(0, 240, 255': 'rgba(37, 99, 235',
    'rgba(0,240,255': 'rgba(37,99,235',
    'rgba(112, 0, 255': 'rgba(255, 46, 99',
    'rgba(112,0,255': 'rgba(255,46,99'
}

files = glob.glob('frontend/src/pages/*.jsx')

for file_path in files:
    with open(file_path, 'r') as f:
        content = f.read()
    
    modified = False
    for old, new in replacements.items():
        if old in content:
            content = content.replace(old, new)
            modified = True
            
    if modified:
        with open(file_path, 'w') as f:
            f.write(content)
        print(f"Updated {file_path}")
