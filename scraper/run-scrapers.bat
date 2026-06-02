@echo off
cd /d "%USERPROFILE%\Documents\presyo-ph\scraper"
echo Running scrapers... >> scraper-log.txt
date /t >> scraper-log.txt
time /t >> scraper-log.txt
node doe-scraper.js >> scraper-log.txt 2>&1
node psa-excel-scraper.js >> scraper-log.txt 2>&1
echo Done. >> scraper-log.txt