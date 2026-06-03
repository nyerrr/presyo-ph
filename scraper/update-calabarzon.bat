@echo off
cd /d "%USERPROFILE%\Documents\presyo-ph\scraper"

echo ============================================
echo   DA CALABARZON Price Updater
echo ============================================
echo.
echo 1. Go to: calabarzon.da.gov.ph/da-calabarzon-bantay-presyo
echo 2. Click the latest PDF
echo 3. Copy the Google Drive URL
echo.
set /p PDF_URL="Paste the Google Drive URL here: "

echo.
echo Updating .env file...

powershell -Command "(Get-Content .env) -replace 'DA_PDF_URL=.*', 'DA_PDF_URL=%PDF_URL%' | Set-Content .env"

echo Running DA CALABARZON scraper...
node da-calabarzon-scraper.mjs

echo.
echo Done! Press any key to close.
pause