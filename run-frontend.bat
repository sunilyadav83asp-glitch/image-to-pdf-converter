@echo off
set "PATH=C:\Program Files\nodejs;%PATH%"
cd /d "%~dp0client"
echo Starting Image to PDF Frontend (React + Vite)...
npm.cmd run dev
pause

