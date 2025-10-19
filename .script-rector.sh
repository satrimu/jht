#!/bin/bash

# .script-rector.sh
# Script to run Rector for automated PHP code refactoring
# WARNING: This will modify your PHP files!
# Use with caution and ensure you have committed your changes

set -e  # Exit on any error

echo "WARNING: Rector will modify your PHP files!"
echo "This script performs automated code refactoring."
echo ""
echo "Recommended workflow:"
echo "1. Commit your current changes"
echo "2. Run this script"
echo "3. Review the changes with git diff"
echo "4. Test your application"
echo "5. Commit the refactoring changes"
echo ""
read -p "Are you sure you want to continue? (y/N): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Operation cancelled."
    exit 0
fi

echo "Starting Rector code refactoring..."

# Check if rector is available
if ! command -v ./vendor/bin/rector &> /dev/null; then
    echo "Error: Rector is not installed. Run 'composer require --dev rector/rector' first."
    exit 1
fi

# Check if rector.php config exists
if [ ! -f "rector.php" ]; then
    echo "Error: rector.php configuration file not found."
    exit 1
fi

# Check git status - warn if there are uncommitted changes
if ! git diff --quiet || ! git diff --staged --quiet; then
    echo "WARNING: You have uncommitted changes."
    echo "It's recommended to commit them before running Rector."
    read -p "Continue anyway? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "Operation cancelled."
        exit 0
    fi
fi

# Run Rector
echo "Running Rector code refactoring..."
./vendor/bin/rector process

echo "Rector refactoring completed!"
echo "Please review the changes with: git diff"
echo "Test your application thoroughly before committing."