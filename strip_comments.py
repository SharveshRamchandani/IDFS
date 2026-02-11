
import os
import re
import sys

def remove_python_comments(source):
    # Group 1: Double quoted string (handles escaped quotes)
    # Group 2: Single quoted string (handles escaped quotes)
    # Group 3: Comment
    pattern = r'(\"(?:\\.|[^\"\\])*\"|\'(?:\\.|[^\'\\])*\')|(#.*)'
    
    def replace(match):
        if match.group(3): # It's a comment
            return ""
        else: # It's a string, keep it
            return match.group(1) or match.group(2)
            
    return re.sub(pattern, replace, source)

def remove_js_comments(source):
    # Group 1: Double quoted string
    # Group 2: Single quoted string
    # Group 3: Backtick string
    # Group 4: Block comment
    # Group 5: Line comment
    pattern = r'(\"(?:\\.|[^\"\\])*\"|\'(?:\\.|[^\'\\])*\'|`(?:\\.|[^`\\])*`)|(/\*[\s\S]*?\*/|//.*)'
    
    def replace(match):
        if match.group(4) or match.group(5):
            return ""
        else:
            return match.group(1) or match.group(2) or match.group(3)
            
    return re.sub(pattern, replace, source)

def clean_file(file_path):
    ext = os.path.splitext(file_path)[1]
    
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
            
        new_content = content
        if ext == '.py':
            new_content = remove_python_comments(content)
        elif ext in ['.ts', '.tsx', '.js', '.jsx', '.css']:
            new_content = remove_js_comments(content)
        
        # Collapse multiple empty lines
        new_content = re.sub(r'\n\s*\n', '\n', new_content)
        # Remove leading/trailing newlines
        new_content = new_content.strip() + '\n'
        
        if new_content != content:
            with open(file_path, 'w', encoding='utf-8') as f:
                f.write(new_content)
            print(f"Cleaned {file_path}")
    except Exception as e:
        print(f"Error cleaning {file_path}: {e}")

def main():
    print("Starting cleanup...")
    exclude_dirs = ['.git', '__pycache__', 'node_modules', '.venv', 'venv']
    root_dirs = ['backend', 'frontend']
    
    for root_dir in root_dirs:
        if not os.path.exists(root_dir):
            print(f"Dir not found: {root_dir}")
            continue
            
        for dirpath, dirnames, filenames in os.walk(root_dir):
            dirnames[:] = [d for d in dirnames if d not in exclude_dirs]
            
            for filename in filenames:
                clean_file(os.path.join(dirpath, filename))
    print("Cleanup finished.")

if __name__ == "__main__":
    main()
