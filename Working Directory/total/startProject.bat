@echo off

REM ----------------------------
REM ONVIF 컨트롤러 실행
REM ----------------------------
start "" cmd /k "cd /d C:\Users\DNET-shin\Desktop\web projects\DNS-sensors-Central-Controller\dist && main.exe"

REM ----------------------------
REM Web RTC(영상 변환) 서버 실행 (새 창에서 동시에)
REM ----------------------------
start "" cmd /k "cd /d C:\Users\DNET-shin\Desktop\web projects\DNS-sensors-Central-Controller\src\server && node LiveCQServer.js"

REM ----------------------------
REM 웹 실행 (새 창에서 동시에)
REM ----------------------------
start "" cmd /k "cd /d C:\Users\DNET-shin\Desktop\web projects\DNS-sensors-Central-Controller && npm run host"
@REM start "" cmd /k "cd /d C:\Users\DNET-shin\Desktop\web projects\DNS-sensors-Central-Controller && npm run dev"

REM ----------------------------
REM Spring Boot 빌드 및 실행
REM ----------------------------
echo.
echo ============================
echo Building Spring Boot project...
echo ============================

REM 프로젝트 폴더로 이동
cd /d "C:\Users\DNET-shin\Desktop\server projects\DNS-radar-Server"

REM Gradle 빌드
call gradlew.bat clean build

REM JAR 파일 절대 경로
set JAR_NAME="C:\Users\DNET-shin\Desktop\server projects\DNS-radar-Server\build\libs\radar-0.0.1-SNAPSHOT.jar"

echo.
echo ============================
echo Running Spring Boot server...
echo ============================

REM Spring Boot 실행
java -jar %JAR_NAME% --server.port=4000 --spring.profiles.active=prod

pause