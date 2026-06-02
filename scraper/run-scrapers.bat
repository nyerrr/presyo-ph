@echo off
cd /d "%USERPROFILE%\Documents\presyo-ph\scraper"
node psa-scraper.js
node doe-scraper.js
echo Done! >> scraper-log.txt
date /t >> scraper-log.txt