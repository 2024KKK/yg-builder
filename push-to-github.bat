@echo off
setlocal EnableExtensions

cd /d "%~dp0"

git rev-parse --show-toplevel >nul 2>&1
if errorlevel 1 (
  echo [ERROR] 当前目录不是 Git 仓库：%CD%
  pause
  exit /b 1
)

for /f "delims=" %%B in ('git branch --show-current') do set "BRANCH=%%B"
if not defined BRANCH (
  echo [ERROR] 无法确定当前 Git 分支。
  pause
  exit /b 1
)

echo.
echo 当前分支：%BRANCH%
echo 项目目录：%CD%
echo.
echo 待处理的文件：
git status --short
echo.

set "HAS_CHANGES="
for /f "delims=" %%S in ('git status --porcelain') do set "HAS_CHANGES=1"
if not defined HAS_CHANGES (
  echo [INFO] 没有检测到文件改动，无需提交。
  pause
  exit /b 0
)

set "MESSAGE=%~1"
if not defined MESSAGE set /p "MESSAGE=请输入提交说明："
if not defined MESSAGE set "MESSAGE=update project"

echo.
echo 即将执行：git add -A
echo 提交说明：%MESSAGE%
choice /C YN /N /M "确认继续？[Y/N] "
if errorlevel 2 (
  echo [INFO] 已取消。
  pause
  exit /b 0
)

git add -A
if errorlevel 1 goto :git_error

git diff --cached --quiet
if not errorlevel 1 (
  echo [INFO] 暂存区没有可提交的改动。
  pause
  exit /b 0
)

git commit -m "%MESSAGE%"
if errorlevel 1 goto :git_error

git push -u origin "%BRANCH%"
if errorlevel 1 goto :git_error

echo.
echo [OK] 已成功推送到 origin/%BRANCH%。
pause
exit /b 0

:git_error
echo.
echo [ERROR] Git 操作失败，请检查上面的错误信息。
pause
exit /b 1
