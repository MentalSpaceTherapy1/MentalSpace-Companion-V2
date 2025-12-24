$env:JAVA_HOME = "C:\Program Files\Microsoft\jdk-17.0.17.10-hotspot"
$env:ANDROID_HOME = "C:\Users\Jarvis 2.0\AppData\Local\Android\Sdk"
$env:PATH = "$env:JAVA_HOME\bin;$env:ANDROID_HOME\platform-tools;$env:PATH"

Write-Host "=========================================="
Write-Host "JAVA_HOME: $env:JAVA_HOME"
Write-Host "ANDROID_HOME: $env:ANDROID_HOME"
Write-Host "=========================================="

Set-Location "C:\Users\Jarvis 2.0\mentalspace-companion-v2\apps\mobile\android"

Write-Host "Starting Gradle build for release APK..."
& .\gradlew.bat assembleRelease --no-daemon 2>&1 | Tee-Object -FilePath "C:\Users\Jarvis 2.0\mentalspace-companion-v2\build-log.txt" -Append

Write-Host ""
Write-Host "=========================================="
Write-Host "BUILD COMPLETE - Checking for APK..."
Write-Host "=========================================="

$apkPath = "C:\Users\Jarvis 2.0\mentalspace-companion-v2\apps\mobile\android\app\build\outputs\apk\release"
if (Test-Path $apkPath) {
    Get-ChildItem -Path $apkPath -Filter "*.apk"
} else {
    Write-Host "APK directory not found. Build may have failed."
    Write-Host "Last 50 lines of build log:"
    Get-Content "C:\Users\Jarvis 2.0\mentalspace-companion-v2\build-log.txt" -Tail 50
}
