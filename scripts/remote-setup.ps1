# Remote Setup Script - Run this from your current PC to configure the remote PC
# This will copy the watcher script and set it up to run automatically

$remotePCIP = "100.111.83.23"
$shareName = "Desktop PC CCR"
$remoteShare = "\\$remotePCIP\$shareName"

Write-Host "========================================="
Write-Host "Remote Boiler Data Sync Setup"
Write-Host "========================================="
Write-Host ""

# Step 1: Copy the watcher script to remote PC
Write-Host "Step 1: Copying watcher script to remote PC..."
$scriptSource = ".\scripts\windows-file-watcher.ps1"
$scriptDest = "$remoteShare\windows-file-watcher.ps1"

try {
    Copy-Item -Path $scriptSource -Destination $scriptDest -Force
    Write-Host "✅ Script copied successfully!" -ForegroundColor Green
} catch {
    Write-Host "❌ Failed to copy script: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# Step 2: Create a batch file to run the PowerShell script (easier to schedule)
Write-Host ""
Write-Host "Step 2: Creating startup batch file..."
$batchContent = @"
@echo off
cd /d "%~dp0"
powershell.exe -ExecutionPolicy Bypass -WindowStyle Hidden -File "%~dp0windows-file-watcher.ps1"
"@

$batchDest = "$remoteShare\start-boiler-sync.bat"
try {
    $batchContent | Out-File -FilePath $batchDest -Encoding ASCII -Force
    Write-Host "✅ Batch file created!" -ForegroundColor Green
} catch {
    Write-Host "❌ Failed to create batch file: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# Step 3: Create a VBScript to run silently (no window)
Write-Host ""
Write-Host "Step 3: Creating silent launcher..."
$vbsContent = @"
Set WshShell = CreateObject("WScript.Shell")
WshShell.Run "cmd /c \\$remotePCIP\$shareName\start-boiler-sync.bat", 0, False
Set WshShell = Nothing
"@

$vbsDest = "$remoteShare\start-boiler-sync.vbs"
try {
    $vbsContent | Out-File -FilePath $vbsDest -Encoding ASCII -Force
    Write-Host "✅ Silent launcher created!" -ForegroundColor Green
} catch {
    Write-Host "❌ Failed to create launcher: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# Step 4: Instructions for setting up auto-start
Write-Host ""
Write-Host "========================================="
Write-Host "✅ Files deployed successfully!"
Write-Host "========================================="
Write-Host ""
Write-Host "NEXT STEPS - Choose ONE option:"
Write-Host ""
Write-Host "OPTION A: Auto-start via Startup Folder (EASIEST)"
Write-Host "  On the remote PC, copy this file:"
Write-Host "  FROM: \\$remotePCIP\$shareName\start-boiler-sync.vbs"
Write-Host "  TO: C:\Users\CCR\AppData\Roaming\Microsoft\Windows\Start Menu\Programs\Startup\"
Write-Host ""
Write-Host "OPTION B: Task Scheduler (via remote registry/scheduled tasks)"
Write-Host "  Run this PowerShell command:"
Write-Host "  `$cred = Get-Credential CCR"
Write-Host "  `$session = New-PSSession -ComputerName $remotePCIP -Credential `$cred"
Write-Host "  Invoke-Command -Session `$session -ScriptBlock {"
Write-Host "    `$action = New-ScheduledTaskAction -Execute 'wscript.exe' -Argument '\\$remotePCIP\$shareName\start-boiler-sync.vbs'"
Write-Host "    `$trigger = New-ScheduledTaskTrigger -AtStartup"
Write-Host "    Register-ScheduledTask -TaskName 'BoilerDataSync' -Action `$action -Trigger `$trigger -RunLevel Highest"
Write-Host "  }"
Write-Host ""
Write-Host "OPTION C: Start now (one-time test)"
Write-Host "  wscript.exe \\$remotePCIP\$shareName\start-boiler-sync.vbs"
Write-Host ""

# Offer to start now
Write-Host ""
$response = Read-Host "Would you like to start the sync script now? (Y/N)"
if ($response -eq "Y" -or $response -eq "y") {
    Write-Host ""
    Write-Host "Starting boiler data sync on remote PC..."
    try {
        Start-Process "wscript.exe" -ArgumentList "$vbsDest" -WindowStyle Hidden
        Write-Host "✅ Script started!" -ForegroundColor Green
        Write-Host ""
        Write-Host "The script is now running on the remote PC and will:"
        Write-Host "  - Copy the Excel file every 5 minutes"
        Write-Host "  - Create 'boiler_data_sync.xlsx' in the share"
        Write-Host "  - Handle locked files automatically"
        Write-Host ""
        Write-Host "Check the share in a few minutes:"
        Write-Host "  \\$remotePCIP\$shareName\boiler_data_sync.xlsx"
    } catch {
        Write-Host "❌ Failed to start: $($_.Exception.Message)" -ForegroundColor Red
        Write-Host ""
        Write-Host "Try manually: wscript.exe `"$vbsDest`""
    }
}

Write-Host ""
Write-Host "========================================="
Write-Host "Setup complete!"
Write-Host "========================================="
