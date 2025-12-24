@echo off
echo ==========================================
echo MentalSpace Companion - Build APK
echo ==========================================

set "JAVA_HOME=C:\Program Files\Microsoft\jdk-17.0.17.10-hotspot"
set "ANDROID_HOME=C:\Users\Jarvis 2.0\AppData\Local\Android\Sdk"
set "PATH=%JAVA_HOME%\bin;%ANDROID_HOME%\platform-tools;%PATH%"

echo.
echo JAVA_HOME: %JAVA_HOME%
echo ANDROID_HOME: %ANDROID_HOME%
echo.

cd /d "C:\Users\Jarvis 2.0\mentalspace-companion-v2\apps\mobile"

echo Step 1: Installing dependencies...
call npm install

echo.
echo Step 2: Building Android APK...
cd android
call gradlew.bat assembleRelease

echo.
echo ==========================================
echo Build complete!
echo APK location: android\app\build\outputs\apk\release\app-release.apk
echo ==========================================

pause
