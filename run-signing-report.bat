@echo off
set "JAVA_HOME=C:\Program Files\Microsoft\jdk-17.0.17.10-hotspot"
set "ANDROID_HOME=C:\Users\Jarvis 2.0\AppData\Local\Android\Sdk"
cd /d "C:\Users\Jarvis 2.0\mentalspace-companion-v2\apps\mobile\android"
"C:\Users\Jarvis 2.0\mentalspace-companion-v2\apps\mobile\android\gradlew.bat" signingReport
