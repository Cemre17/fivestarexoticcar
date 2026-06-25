
@echo off
chcp 65001 >nul
cd /d "%~dp0"
title Five Star Exotic Cars - Yerel Sunucu

set "NODE=C:\Program Files\nodejs\node.exe"
if not exist "%NODE%" set "NODE=node"

rem --- Sunucu zaten calisiyor mu? ---
netstat -ano | findstr ":8080" | findstr LISTENING >nul
if %errorlevel%==0 (
  echo Sunucu zaten calisiyor. Tarayici aciliyor...
  start "" "http://localhost:8080/"
  exit /b
)

rem --- Sunucuyu kendi penceresinde baslat ---
start "Five Star Sunucu (KAPATMA)" cmd /k ""%NODE%" server.js"

rem --- Sunucu hazir olana kadar bekle, sonra tarayiciyi ac ---
echo Sunucu baslatiliyor, lutfen bekleyin...
timeout /t 2 /nobreak >nul
start "" "http://localhost:8080/"
exit /b
