@echo off
echo ============================================================
echo   PRICOVA - Smart Product Price Comparison Platform
echo   Compare. Choose. Save.
echo ============================================================
echo.

cd /d "%~dp0"

echo [1/3] Starting Backend API Server (Port 5000)...
start "PRICOVA Backend" cmd /k "cd backend && npm run dev"

timeout /t 3 /nobreak >nul

echo [2/3] Starting Frontend Client (Port 5173)...
start "PRICOVA Frontend" cmd /k "cd frontend && npm run dev"

timeout /t 2 /nobreak >nul

echo [3/3] Opening PRICOVA in your browser...
start http://localhost:5173

echo.
echo ============================================================
echo   PRICOVA is running!
echo   Frontend:  http://localhost:5173
echo   Backend:   http://localhost:5000/api
echo.
echo   Demo Admin Login: admin@pricova.com / Admin@123
echo   Demo User Login:  user@pricova.com  / User@123
echo ============================================================
pause
