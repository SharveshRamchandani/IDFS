@echo off
REM Quick Start Script for IDFS Data Generation and Simulation

echo ================================================================
echo IDFS - Data Generation and Live Simulation
echo ================================================================
echo.

:menu
echo Please select an option:
echo.
echo 1. Seed Database (Generate 100,000+ records) - Run First!
echo 2. Start Live Simulator (Updates every 10 seconds)
echo 3. Run Both (Seed then Simulate)
echo 4. Exit
echo.
set /p choice="Enter your choice (1-4): "

if "%choice%"=="1" goto seed
if "%choice%"=="2" goto simulate
if "%choice%"=="3" goto both
if "%choice%"=="4" goto end

echo Invalid choice, please try again.
goto menu

:seed
echo.
echo ================================================================
echo SEEDING DATABASE...
echo ================================================================
python seed_data.py
if %ERRORLEVEL% NEQ 0 (
    echo.
    echo ERROR: Seeding failed! Make sure the backend is set up correctly.
    pause
    goto menu
)
echo.
echo ================================================================
echo DATABASE SEEDED SUCCESSFULLY!
echo ================================================================
echo.
pause
goto menu

:simulate
echo.
echo ================================================================
echo STARTING LIVE SIMULATOR...
echo ================================================================
echo Press Ctrl+C to stop the simulation
echo.
python live_simulator.py
goto menu

:both
echo.
echo ================================================================
echo STEP 1: SEEDING DATABASE...
echo ================================================================
python seed_data.py
if %ERRORLEVEL% NEQ 0 (
    echo.
    echo ERROR: Seeding failed! Aborting.
    pause
    goto menu
)
echo.
echo ================================================================
echo STEP 2: STARTING LIVE SIMULATOR...
echo ================================================================
echo Press Ctrl+C to stop the simulation
echo.
python live_simulator.py
goto menu

:end
echo.
echo Exiting...
exit
