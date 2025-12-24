#!/usr/bin/env python3
"""
Generate file manifest for the website file explorer.
This script scans the project directory and creates a JSON manifest
that the file explorer can use to display files.

Usage:
    python3 generate_file_manifest.py > site/file_manifest.json
"""

import os
import json
from pathlib import Path
from datetime import datetime

def should_include_file(file_path):
    """Determine if a file should be included in the manifest."""
    # Exclude common files/directories
    exclude_patterns = [
        '.git',
        '.DS_Store',
        '__pycache__',
        'node_modules',
        '.cursorignore',
        '.gitignore',
        '*.pyc',
        '*.log',
        '.backup',
        '*.bak'
    ]
    
    file_str = str(file_path)
    for pattern in exclude_patterns:
        if pattern in file_str:
            return False
    
    return True

def build_file_tree(root_path, relative_path='', max_depth=5, current_depth=0):
    """Recursively build file tree structure."""
    if current_depth >= max_depth:
        return None
    
    root = Path(root_path)
    if not root.exists():
        return None
    
    structure = {
        'name': root.name if relative_path else 'MARKOS PROJECT',
        'type': 'folder',
        'children': []
    }
    
    try:
        items = sorted(root.iterdir(), key=lambda x: (x.is_file(), x.name.lower()))
        
        for item in items:
            if not should_include_file(item):
                continue
            
            if item.is_file():
                # Only include certain file types
                if item.suffix in ['.md', '.txt', '.csv', '.json', '.html', '.js', '.css', '.py', '.R', '.r', '.docx', '.pdf', '.png', '.jpg', '.jpeg']:
                    structure['children'].append({
                        'name': item.name,
                        'type': 'file',
                        'path': str(item.relative_to(Path(root_path).parent)) if relative_path else item.name
                    })
            elif item.is_dir():
                child_tree = build_file_tree(item, str(item.relative_to(Path(root_path).parent)), max_depth, current_depth + 1)
                if child_tree and child_tree['children']:
                    structure['children'].append(child_tree)
    
    except PermissionError:
        pass
    
    return structure

def main():
    # Get the project root (parent of site directory)
    script_dir = Path(__file__).parent
    project_root = script_dir.parent
    
    # Build file tree
    file_structure = build_file_tree(project_root)
    
    # Create manifest
    manifest = {
        'version': '1.0',
        'generated': datetime.now().isoformat(),
        'structure': file_structure
    }
    
    # Output JSON
    print(json.dumps(manifest, indent=2))

if __name__ == '__main__':
    main()

