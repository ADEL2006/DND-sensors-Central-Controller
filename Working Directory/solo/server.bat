@echo off
chcp 65001

cd /d "C:\Users\DNET-shin\Desktop\server projects\DNS-radar-Server"

REM 서버 시작 시간
set START_TIME=%DATE:~0,4%%DATE:~5,2%%DATE:~8,2%_%TIME:~0,2%-%TIME:~3,2%-%TIME:~6,2%

REM Gradle 빌드
call gradlew.bat clean build

REM JAR 파일 경로
set JAR_NAME="C:\Users\DNET-shin\Desktop\server projects\DNS-radar-Server\build\libs\radar-0.0.1-SNAPSHOT.jar"

echo.
echo ============================
echo Running Spring Boot server...
echo ============================

REM 서버 실행 (UTF-8 + START_TIME 전달)
java -Dfile.encoding=UTF-8 -DSTART_TIME=%START_TIME% -jar %JAR_NAME% --server.port=4000 --spring.profiles.active=prod

pause
