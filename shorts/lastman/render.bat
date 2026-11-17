@echo off
title Render this Short
cd /d "%~dp0"
where node >nul 2>nul
if errorlevel 1 (
  echo.
  echo Node.js is not installed yet. Your browser will open the download page.
  echo Install the LTS version, then double-click this file again.
  start https://nodejs.org
  pause
  exit /b
)
echo.
echo  What do you want to render?
echo.
echo    1 = Test: first 5 seconds in 2K
echo    2 = Test preview: first 5 seconds, half size (faster)
echo    3 = Full video in 2K
echo    4 = Full preview, half size
echo.
set /p choice=Type 1, 2, 3 or 4 and press Enter: 
if "%choice%"=="1" node tools\render_local.mjs --frames=0-299
if "%choice%"=="2" node tools\render_local.mjs --preview --frames=0-299
if "%choice%"=="3" node tools\render_local.mjs
if "%choice%"=="4" node tools\render_local.mjs --preview
echo.
echo Finished. The video is in the "out" folder, which opens now.
echo If you see an error above, take a screenshot and send it to Claude.
if exist out start "" out
pause
