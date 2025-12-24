@echo off
echo ==========================================
echo MentalSpace Companion - Android Build
echo ==========================================

set "JAVA_HOME=C:\Program Files\Microsoft\jdk-17.0.17.10-hotspot"
set "ANDROID_HOME=C:\Users\Jarvis 2.0\AppData\Local\Android\Sdk"
set "PATH=%JAVA_HOME%\bin;%ANDROID_HOME%\platform-tools;%ANDROID_HOME%\tools;%PATH%"

echo.
echo JAVA_HOME: %JAVA_HOME%
echo ANDROID_HOME: %ANDROID_HOME%
echo.

cd /d "C:\Users\Jarvis 2.0\mentalspace-companion-v2\apps\mobile"

echo Installing dependencies...
call npm install

echo.
echo Building Android app...
call npx expo run:android

pause
