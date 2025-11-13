#!/usr/bin/env bash

# enforce UTF-8 for Python and the shell
export PYTHONUTF8=1
export PYTHONIOENCODING=utf-8
export LANG=en_US.UTF-8
export LC_ALL=en_US.UTF-8

# set better error handling -> exit on error, undefined variable, or error in pipeline
set -euo pipefail

# find python executable
PY=python
if ! command -v $PY >/dev/null 2>&1; then
  PY=python3
  if ! command -v $PY >/dev/null 2>&1; then
    echo "No python3 or python found in PATH" >&2
    exit 1
  fi
fi

# define python venv directory
VENV_DIR=".venv"

# create python venv if missing
if [ ! -d "$VENV_DIR" ]; then
  "$PY" -m venv "$VENV_DIR"
fi

# activate python venv
if [ -f "$VENV_DIR/bin/activate" ]; then
  source "$VENV_DIR/bin/activate"
elif [ -f "$VENV_DIR/Scripts/activate" ]; then
  source "$VENV_DIR/Scripts/activate"
else
  echo "Python venv activation script not found in $VENV_DIR" >&2
  exit 1
fi

# upgrade pip
pip install --upgrade pip

# install python packages
pip install -r ./backend/requirements.txt

# find npm executable
if ! command -v npm >/dev/null 2>&1; then
  echo "No npm found in PATH" >&2
  exit 1
fi

# install node packages
cd ./frontend
npm install --production=false

# build frontend
npm run build

# go back to root directory
cd ..

# run the server
"$PY" ./backend/app.py
