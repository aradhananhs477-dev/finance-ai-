@echo off
echo ========================================================
echo   Starting FinWise AI - Intelligent Personal Finance
echo ========================================================
echo.
echo Starting Backend API Server on http://localhost:5000 ...
start "FinWise Server" cmd /k "cd server && npm run dev"

timeout /t 2 >nul

echo Starting Frontend Client on http://localhost:5173 ...
start "FinWise Client" cmd /k "cd client && npm run dev"

echo.
echo ========================================================
echo   FinWise AI is launching!
echo   Open your browser at: http://localhost:5173
echo ========================================================
