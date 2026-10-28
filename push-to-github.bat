@echo off
set "PATH=C:\Users\sunil\AppData\Local\Microsoft\WinGet\Packages\Git.MinGit_Microsoft.Winget.Source_8wekyb3d8bbwe\cmd;%PATH%"
echo ========================================================
echo Pushing Image to PDF Converter to GitHub...
echo Target: https://github.com/sunilyadav83asp-glitch/image-to-pdf-converter.git
echo ========================================================
echo.
git push -u origin main
echo.
if %ERRORLEVEL% EQU 0 (
    echo ========================================================
    echo [SUCCESS] Project successfully published to GitHub!
    echo ========================================================
) else (
    echo [INFO] If prompted, complete the one-time browser login or enter your GitHub token.
)
pause
