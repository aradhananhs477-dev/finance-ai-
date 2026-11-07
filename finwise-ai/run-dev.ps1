Write-Host "========================================================" -ForegroundColor Cyan
Write-Host "   Starting FinWise AI - Intelligent Personal Finance" -ForegroundColor Cyan
Write-Host "========================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Starting Backend API Server on http://localhost:5000..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd server; npm.cmd run dev"

Start-Sleep -Seconds 2

Write-Host "Starting Frontend Client on http://localhost:5173..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd client; npm.cmd run dev"

Write-Host ""
Write-Host "========================================================" -ForegroundColor Yellow
Write-Host "   FinWise AI is running!" -ForegroundColor Yellow
Write-Host "   Open your browser at: http://localhost:5173" -ForegroundColor Yellow
Write-Host "========================================================" -ForegroundColor Yellow
