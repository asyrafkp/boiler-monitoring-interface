# Test OneDrive Download
$oneDriveLink = "https://1drv.ms/x/c/B6A282DAF4E2A35F/IQCEQ8XPs7EnQZQONh7zYtWzASqM_JrM94DtGUYl_Px9ygA?e=EEiekq"

Write-Host "🔍 Testing OneDrive download..." -ForegroundColor Cyan
Write-Host "Link: $oneDriveLink" -ForegroundColor Gray

# Try with download=1 parameter
$urlWithDownload = $oneDriveLink + "&download=1"
Write-Host "`n📥 Attempting download..." -ForegroundColor Yellow

try {
    $headers = @{
        'User-Agent' = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
    }
    
    $response = Invoke-WebRequest -Uri $urlWithDownload -Headers $headers -MaximumRedirection 10
    
    Write-Host "✅ Status: $($response.StatusCode)" -ForegroundColor Green
    Write-Host "Content-Type: $($response.Headers['Content-Type'])" -ForegroundColor Gray
    Write-Host "Content Length: $($response.RawContentLength) bytes" -ForegroundColor Gray
    
    # Check if it's HTML
    if ($response.Content -like "*<!DOCTYPE*" -or $response.Content -like "*<html*") {
        Write-Host "❌ ERROR: Response is HTML, not Excel!" -ForegroundColor Red
        Write-Host "First 200 chars: $($response.Content.Substring(0, [Math]::Min(200, $response.Content.Length)))" -ForegroundColor Red
    }
    # Check if it's Excel
    elseif ($response.Content.StartsWith("PK") -or $response.Headers['Content-Type'] -like "*excel*") {
        Write-Host "✅ SUCCESS: Response looks like Excel file!" -ForegroundColor Green
    }
    else {
        Write-Host "⚠️ WARNING: Response format unknown" -ForegroundColor Yellow
        Write-Host "First 100 bytes (hex): $([BitConverter]::ToString($response.Content[0..50]))" -ForegroundColor Yellow
    }
    
} catch {
    Write-Host "❌ Download failed: $_" -ForegroundColor Red
}
