# PRICOVA - Smart Product Price Comparison Platform
# Start script for Windows PowerShell

Write-Host "============================================================" -ForegroundColor Cyan
Write-Host "  PRICOVA - Smart Product Price Comparison Platform" -ForegroundColor White
Write-Host "  Compare. Choose. Save." -ForegroundColor Yellow
Write-Host "============================================================" -ForegroundColor Cyan

$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $ScriptDir

Write-Host "`n[1/3] Starting Backend API Server (Port 5000)..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location '$ScriptDir\backend'; npm run dev"

Start-Sleep -Seconds 3

Write-Host "[2/3] Starting Frontend Client (Port 3000)..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location '$ScriptDir\frontend'; npm run dev"

Start-Sleep -Seconds 2

Write-Host "[3/3] Opening Browser..." -ForegroundColor Green
Start-Process "http://localhost:3000"

Write-Host "`nPRICOVA is now live!" -ForegroundColor Cyan
Write-Host "Frontend: http://localhost:3000" -ForegroundColor White
Write-Host "Backend:  http://localhost:5000/api" -ForegroundColor White
Write-Host "`nCredentials for testing:" -ForegroundColor Yellow
Write-Host "Admin: admin@pricova.com / Admin@123"
Write-Host "User:  user@pricova.com  / User@123`n"
