@echo off
REM ========================================
REM Enable OpenSSH Server on Windows
REM Run this ONCE on the PC as Administrator
REM ========================================

echo.
echo ========================================
echo OpenSSH Server Setup for Windows
echo ========================================
echo.
echo This will:
echo 1. Install OpenSSH Server
echo 2. Start the SSH service
echo 3. Enable auto-start on boot
echo 4. Configure Windows Firewall
echo.

REM Check if running as Administrator
net session >nul 2>&1
if %errorLevel% neq 0 (
    echo ❌ ERROR: This script must be run as Administrator
    echo.
    echo Right-click this file and select "Run as administrator"
    echo.
    pause
    exit /b 1
)

echo Installing OpenSSH Server...
powershell -Command "Add-WindowsCapability -Online -Name OpenSSH.Server~~~~0.0.1.0"

if %errorLevel% equ 0 (
    echo ✓ OpenSSH Server installed
) else (
    echo ❌ Failed to install OpenSSH Server
    pause
    exit /b 1
)

echo.
echo Starting SSH service...
powershell -Command "Start-Service sshd"

echo.
echo Setting SSH to start automatically...
powershell -Command "Set-Service -Name sshd -StartupType 'Automatic'"

echo.
echo Configuring Windows Firewall...
powershell -Command "if (!(Get-NetFirewallRule -Name 'OpenSSH-Server-In-TCP' -ErrorAction SilentlyContinue)) { New-NetFirewallRule -Name 'OpenSSH-Server-In-TCP' -DisplayName 'OpenSSH Server (sshd)' -Enabled True -Direction Inbound -Protocol TCP -Action Allow -LocalPort 22 }"

echo.
echo ========================================
echo ✓ Setup Complete!
echo ========================================
echo.
echo SSH Server Status:
powershell -Command "Get-Service sshd | Select-Object Name, Status, StartType"

echo.
echo SSH is now enabled on this PC!
echo.
echo Connection details:
echo   Host: 100.111.83.23 (via Tailscale)
echo   Port: 22
echo   User: CCR (your Windows username)
echo   Auth: Windows password
echo.
echo Test connection from GitHub Actions or another PC:
echo   ssh CCR@100.111.83.23
echo.
pause
