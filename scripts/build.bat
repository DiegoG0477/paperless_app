@echo off

REM Create and activate virtual environment
python -m venv venv
call venv\Scripts\activate.bat

REM Install dependencies
pip install -r requirements.txt

REM Build the executable
cd app\runtime
pyinstaller --onefile --noconsole ^
    --add-data "core;core" ^
    --add-data "ui\resources;ui\resources" ^
    --name paperless ^
    main.py

REM Move the executable to resources
move dist\paperless.exe ..\ui\resources\

REM Cleanup
rmdir /s /q build
rmdir /s /q dist
del paperless.spec

cd ..\..

echo Build complete! Executable has been moved to app\ui\resources\