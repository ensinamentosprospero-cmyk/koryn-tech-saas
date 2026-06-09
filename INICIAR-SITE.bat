@echo off
cd /d "%~dp0"
title Koryn Tech - Servidor local

echo ========================================
echo   Koryn Tech - Iniciando site local
echo ========================================
echo.

for /f "tokens=5" %%a in ('netstat -ano ^| findstr :5173 ^| findstr LISTENING') do (
  echo Encerrando processo antigo na porta 5173...
  taskkill /PID %%a /F >nul 2>&1
)

for /f "tokens=5" %%a in ('netstat -ano ^| findstr :3001 ^| findstr LISTENING') do (
  echo Encerrando processo antigo na porta 3001...
  taskkill /PID %%a /F >nul 2>&1
)

if not exist node_modules (
  echo Instalando dependencias...
  call npm install
  if errorlevel 1 (
    echo Erro ao instalar dependencias.
    pause
    exit /b 1
  )
)

echo.
echo Abrindo http://localhost:5173
echo API multi-tenant: http://localhost:3001
echo Demo: http://localhost:5173/?loja=demo
echo Pressione Ctrl+C para parar.
echo.

start "Koryn Tech API" cmd /c "cd /d "%~dp0" && node server/index.js"

timeout /t 2 /nobreak >nul

netstat -ano | findstr :5173 | findstr LISTENING >nul 2>&1
if not errorlevel 1 (
  echo Servidor ja esta rodando. Abrindo o navegador...
  start "" "http://localhost:5173"
  pause
  exit /b 0
)

call npm run dev
if errorlevel 1 (
  echo.
  echo Tentando abrir o site mesmo assim...
  start "" "http://localhost:5173"
)
