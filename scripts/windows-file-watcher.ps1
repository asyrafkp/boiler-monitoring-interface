# Auto-copy Excel file when modified (handles locked files)
# Run this script on your Windows PC - it will monitor and copy the file automatically

$sourcePath = "C:\Users\CCR\Desktop\Production latest\2026\01 JANUARY 2026\REPORT DAILY BULAN 2026 - 01 JANUARI.xlsx"
$destPath = "C:\Users\CCR\Desktop\Production latest\boiler_data_sync.xlsx"
$shareDestPath = "C:\Users\CCR\Desktop\Desktop PC CCR\boiler_data_sync.xlsx"  # Accessible via SMB

Write-Host "==================================="
Write-Host "Boiler Data File Monitor - Starting"
Write-Host "==================================="
Write-Host "Source: $sourcePath"
Write-Host "Destination: $destPath"
Write-Host "Share path: $shareDestPath"
Write-Host ""
Write-Host "This script will copy the file every 5 minutes"
Write-Host "Press Ctrl+C to stop"
Write-Host ""

$lastCopyTime = [DateTime]::MinValue

while ($true) {
    try {
        $sourceFile = Get-Item $sourcePath -ErrorAction Stop
        $currentTime = Get-Date
        
        # Check if file was modified or if it's been more than 5 minutes
        $timeSinceLastCopy = ($currentTime - $lastCopyTime).TotalMinutes
        
        if ($timeSinceLastCopy -ge 5) {
            Write-Host "[$($currentTime.ToString('yyyy-MM-dd HH:mm:ss'))] Copying file..."
            
            # Method 1: Try direct copy (works even if file is open in Excel with AutoSave)
            try {
                Copy-Item -Path $sourcePath -Destination $destPath -Force
                Copy-Item -Path $destPath -Destination $shareDestPath -Force
                Write-Host "  ✅ Copy successful!"
                Write-Host "  File size: $([math]::Round($sourceFile.Length/1KB, 2)) KB"
                Write-Host "  Last modified: $($sourceFile.LastWriteTime)"
                $lastCopyTime = $currentTime
            }
            catch {
                # Method 2: If direct copy fails, use COM to save a copy via Excel
                Write-Host "  ⚠️  Direct copy failed, trying Excel COM..."
                try {
                    $excel = New-Object -ComObject Excel.Application
                    $excel.Visible = $false
                    $excel.DisplayAlerts = $false
                    
                    $workbook = $excel.Workbooks.Open($sourcePath, [Type]::Missing, $true) # ReadOnly = true
                    $workbook.SaveCopyAs($destPath)
                    $workbook.Close($false)
                    $excel.Quit()
                    [System.Runtime.Interopservices.Marshal]::ReleaseComObject($excel) | Out-Null
                    
                    Copy-Item -Path $destPath -Destination $shareDestPath -Force
                    Write-Host "  ✅ Excel COM copy successful!"
                    $lastCopyTime = $currentTime
                }
                catch {
                    Write-Host "  ❌ Both methods failed: $($_.Exception.Message)"
                }
            }
            Write-Host ""
        }
        
        # Wait 60 seconds before next check
        Start-Sleep -Seconds 60
    }
    catch {
        Write-Host "❌ Error: $($_.Exception.Message)"
        Start-Sleep -Seconds 60
    }
}
