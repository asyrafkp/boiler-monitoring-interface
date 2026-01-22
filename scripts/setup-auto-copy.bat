@echo off
REM ========================================
REM Auto-Copy Setup for Boiler Excel File
REM Run this ONCE on the PC to enable automatic copying
REM ========================================

echo.
echo ========================================
echo Boiler Data Auto-Copy Setup
echo ========================================
echo.
echo This will:
echo 1. Create a file watcher that monitors Excel changes
echo 2. Auto-copy to boiler_data_copy.xlsx when file is saved
echo 3. Set up auto-start on Windows restart
echo 4. Hide the copy file from Explorer
echo.

REM Get the Desktop path
set "DESKTOP=%USERPROFILE%\Desktop"
set "SHARE_FOLDER=%DESKTOP%\Desktop PC CCR"
set "SOURCE_FILE=%DESKTOP%\Production latest\2026\01 JANUARY 2026\REPORT DAILY BULAN 2026 - 01 JANUARI.xlsx"
set "COPY_FILE=%SHARE_FOLDER%\boiler_data_copy.xlsx"
set "WATCHER_SCRIPT=%SHARE_FOLDER%\_excel_watcher.ps1"

echo Creating PowerShell file watcher script...
echo.

REM Create PowerShell watcher script
(
echo # Excel File Watcher - Auto-copy when file is modified
echo # This script monitors the Excel file and copies it when saved
echo.
echo $sourceFile = "%SOURCE_FILE%"
echo $copyFile = "%COPY_FILE%"
echo $logFile = "$env:TEMP\boiler_watcher.log"
echo.
echo function Write-Log {
echo     param^($Message^)
echo     $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
echo     "$timestamp - $Message" ^| Out-File -Append $logFile
echo }
echo.
echo Write-Log "Watcher started"
echo.
echo # Initial copy
echo try {
echo     Copy-Item -Path $sourceFile -Destination $copyFile -Force
echo     attrib +h "$copyFile"
echo     Write-Log "Initial copy completed"
echo } catch {
echo     Write-Log "Initial copy failed: $_"
echo }
echo.
echo # Create file system watcher
echo $watcher = New-Object System.IO.FileSystemWatcher
echo $watcher.Path = Split-Path $sourceFile
echo $watcher.Filter = Split-Path $sourceFile -Leaf
echo $watcher.EnableRaisingEvents = $true
echo $watcher.NotifyFilter = [System.IO.NotifyFilters]::LastWrite
echo.
echo # Define the action when file changes
echo $action = {
echo     Start-Sleep -Seconds 2  # Wait for Excel to finish saving
echo     try {
echo         Copy-Item -Path $sourceFile -Destination $copyFile -Force
echo         attrib +h "$copyFile"
echo         Write-Log "File copied after modification"
echo     } catch {
echo         Write-Log "Copy failed: $_"
echo     }
echo }
echo.
echo # Register the event
echo Register-ObjectEvent -InputObject $watcher -EventName "Changed" -Action $action ^| Out-Null
echo.
echo Write-Log "Monitoring file changes..."
echo.
echo # Keep script running
echo while ^($true^) {
echo     Start-Sleep -Seconds 60
echo }
) > "%WATCHER_SCRIPT%"

echo ✓ Watcher script created
echo.

REM Hide the watcher script
attrib +h "%WATCHER_SCRIPT%"

echo Creating scheduled task for auto-start...
echo.

REM Create scheduled task to run on startup
schtasks /create /tn "BoilerDataWatcher" /tr "powershell.exe -WindowStyle Hidden -ExecutionPolicy Bypass -File \"%WATCHER_SCRIPT%\"" /sc onstart /ru "%USERNAME%" /rl highest /f

if %ERRORLEVEL% EQU 0 (
    echo ✓ Scheduled task created successfully
    echo.
) else (
    echo ✗ Failed to create scheduled task
    echo   Try running this as Administrator
    pause
    exit /b 1
)

echo Starting the watcher now...
echo.

REM Start the watcher immediately
start /b powershell.exe -WindowStyle Hidden -ExecutionPolicy Bypass -File "%WATCHER_SCRIPT%"

echo.
echo ========================================
echo ✓ Setup Complete!
echo ========================================
echo.
echo The file watcher is now running and will:
echo - Auto-copy Excel file when it's saved
echo - Start automatically when Windows restarts
echo - Keep boiler_data_copy.xlsx hidden
echo.
echo The copy file is hidden. To see it:
echo 1. Open folder: %SHARE_FOLDER%
echo 2. View ^> Show ^> Hidden items
echo.
echo Log file: %TEMP%\boiler_watcher.log
echo.
echo You can close this window now.
echo.
pause
