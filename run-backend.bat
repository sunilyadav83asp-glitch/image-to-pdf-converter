@echo off
set "PATH=C:\Program Files\nodejs;%PATH%"
cd /d "%~dp0server"
echo Starting Image to PDF Backend Server (Express)...
node server.js
pause

