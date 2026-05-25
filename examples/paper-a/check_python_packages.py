#!/usr/bin/env python3
"""
Python Package Checker for Figure Generation Script
Checks if all required packages are installed and provides installation instructions
"""

import sys
import subprocess

required_packages = {
    'pandas': 'pandas',
    'numpy': 'numpy',
    'matplotlib': 'matplotlib',
    'seaborn': 'seaborn',
    'scipy': 'scipy',
    'pyreadr': 'pyreadr'  # For reading RDS files
}

optional_packages = {
    'scikit-learn': 'scikit-learn',  # For GAM if needed
}

def check_package(package_name, import_name=None):
    """Check if a package is installed"""
    if import_name is None:
        import_name = package_name
    try:
        __import__(import_name)
        return True
    except ImportError:
        return False

def install_package(package_name):
    """Install a package using pip"""
    try:
        subprocess.check_call([sys.executable, '-m', 'pip', 'install', package_name])
        return True
    except subprocess.CalledProcessError:
        return False

def main():
    print("=" * 60)
    print("Python Package Checker for Figure Generation")
    print("=" * 60)
    print()
    
    missing_packages = []
    installed_packages = []
    
    print("Checking required packages...")
    print("-" * 60)
    
    for package_name, import_name in required_packages.items():
        if check_package(package_name, import_name):
            print(f"✓ {package_name} is installed")
            installed_packages.append(package_name)
        else:
            print(f"✗ {package_name} is NOT installed")
            missing_packages.append(package_name)
    
    print()
    print("Checking optional packages...")
    print("-" * 60)
    
    for package_name, import_name in optional_packages.items():
        if check_package(package_name, import_name):
            print(f"✓ {package_name} is installed (optional)")
        else:
            print(f"○ {package_name} is not installed (optional)")
    
    print()
    
    if missing_packages:
        print("=" * 60)
        print("MISSING PACKAGES DETECTED")
        print("=" * 60)
        print()
        print("To install missing packages, run:")
        print()
        print("  pip install " + " ".join(missing_packages))
        print()
        print("Or install individually:")
        for pkg in missing_packages:
            print(f"  pip install {pkg}")
        print()
        
        # Ask if user wants to install automatically
        try:
            if sys.stdin.isatty():  # Only ask if running interactively
                response = input("Would you like to install missing packages now? (y/n): ")
                if response.lower() in ['y', 'yes']:
                    print()
                    print("Installing packages...")
                    for pkg in missing_packages:
                        print(f"Installing {pkg}...", end=" ")
                        if install_package(pkg):
                            print("✓ installed successfully")
                        else:
                            print("✗ installation failed")
                    print()
                    
                    # Re-check
                    print("Re-checking packages...")
                    still_missing = []
                    for pkg in missing_packages:
                        import_name = required_packages[pkg]
                        if check_package(pkg, import_name):
                            print(f"✓ {pkg} is now installed")
                        else:
                            print(f"✗ {pkg} installation failed")
                            still_missing.append(pkg)
                    
                    if still_missing:
                        print()
                        print("Some packages failed to install. Please install manually:")
                        print("  pip install " + " ".join(still_missing))
                        return 1
                    else:
                        print()
                        print("All packages are now installed!")
                        return 0
        except (EOFError, KeyboardInterrupt):
            print("\nInstallation cancelled.")
            return 1
        
        return 1
    else:
        print("=" * 60)
        print("✓ ALL REQUIRED PACKAGES ARE INSTALLED")
        print("=" * 60)
        print()
        print("You can now run the figure generation script:")
        print("  python paper_a_analysis/create_figures_markos_python.py")
        print()
        return 0

if __name__ == "__main__":
    import sys
    sys.exit(main())
