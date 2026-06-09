@echo off
cd /d "%~dp0"
title Koryn Tech - Producao local

echo ========================================
echo   Koryn Tech - Modo producao (local)
echo ========================================
echo.

if not exist node_modules (
  echo Instalando dependencias...
  call npm install
  if errorlevel 1 (
    echo Erro ao instalar dependencias.
    pause
    exit /b 1
  )
)

if not exist .env (
  echo Copie .env.example para .env e ajuste JWT_SECRET antes de expor publicamente.
  echo.
)

echo Gerando build do frontend...
call npm run build
if errorlevel 1 (
  echo Erro no build.
  pause
  exit /b 1
)

for /f "tokens=5" %%a in ('netstat -ano ^| findstr :3001 ^| findstr LISTENING') do (
  echo Encerrando processo antigo na porta 3001...
  taskkill /PID %%a /F >nul 2>&1
)

echo.
echo Iniciando servidor unificado em http://localhost:3001
echo API + site estatico na mesma porta.
echo Pressione Ctrl+C para parar.
echo.

set NODE_ENV=production
set SERVE_STATIC=true
set PORT=3001

start "" "http://localhost:3001"
node server/index.js
