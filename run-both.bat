@echo off
set "PATH=C:\Program Files\nodejs;%PATH%"
echo Starting Image to PDF Converter (Full Project)...
start "Image to PDF - Backend Server (Port 5000)" cmd /k "cd /d %~dp0server && node server.js"
start "Image to PDF - Frontend (Port 5173)" cmd /k "cd /d %~dp0client && npm.cmd run dev"
echo Backend and Frontend have been launched in separate windows!

