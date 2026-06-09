@echo off
cd /d "%~dp0"
title Koryn Tech - Conectar Supabase

echo ========================================
echo   Conectar Supabase
echo ========================================
echo.
echo Projeto: qjynmumyoypzvqdaznnn
echo API keys ja estao no .env.
echo.
echo Cole a SENHA do banco (nao a connection string inteira).
echo Se nao lembrar: Supabase ^> Settings ^> Database ^> Reset password
echo.

set /p SUPABASE_DB_PASSWORD="Database password: "
if "%SUPABASE_DB_PASSWORD%"=="" (
  echo Senha obrigatoria.
  pause
  exit /b 1
)

set SUPABASE_DB_PASSWORD=%SUPABASE_DB_PASSWORD%
call npm run db:connect:supabase
pause
