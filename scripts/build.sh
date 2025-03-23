#!/bin/bash

# Create and activate virtual environment
python3 -m venv venv
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Build the executable
cd app/runtime
pyinstaller --onefile --noconsole \
    --add-data "core:core" \
    --add-data "ui/resources:ui/resources" \
    --name paperless \
    main.py

# Move the executable to resources
mv dist/paperless ../ui/resources/
cd ../..

# Cleanup
rm -rf app/runtime/build app/runtime/dist app/runtime/*.spec

echo "Build complete! Executable has been moved to app/ui/resources/"