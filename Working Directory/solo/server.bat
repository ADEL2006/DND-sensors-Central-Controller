@echo off

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