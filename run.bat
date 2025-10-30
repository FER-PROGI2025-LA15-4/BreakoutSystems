@echo off
setlocal

rem find python executable
set "PY=python"
where "%PY%" >nul 2>&1
if %errorlevel% neq 0 (
  set "PY=python3"
  where "%PY%" >nul 2>&1
  if %errorlevel% neq 0 (
    echo No python or python3 found in PATH 1>&2
    exit /b 1
  )
)

rem define python venv directory
set "VENV_DIR=.venv"

rem create python venv if missing
if not exist "%VENV_DIR%" (
  call "%PY%" -m venv "%VENV_DIR%"
)

rem activate python venv
if exist "%VENV_DIR%\Scripts\activate.bat" (
  call "%VENV_DIR%\Scripts\activate.bat"
) else (
  echo Python venv activation script not found in %VENV_DIR% 1>&2
  exit /b 1
)

rem upgrade pip
call "%PY%" -m pip install --upgrade pip

rem install python packages
call "%PY%" -m pip install -r backend\requirements.txt

rem find npm executable
where npm >nul 2>&1
if %errorlevel% neq 0 (
  echo No npm found in PATH 1>&2
  exit /b 1
)

rem install node packages and build frontend
pushd frontend || (echo Failed to change to frontend directory 1>&2 & exit /b 1)
call npm install
if %errorlevel% neq 0 (
  echo npm install failed 1>&2
  popd
  exit /b 1
)
call npm run build
if %errorlevel% neq 0 (
  echo npm run build failed 1>&2
  popd
  exit /b 1
)
popd

rem run the server
python backend\app.py

endlocal
