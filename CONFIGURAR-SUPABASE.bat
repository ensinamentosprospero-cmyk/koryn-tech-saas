@echo off
cd /d "%~dp0"
title Koryn Tech - Configurar Supabase

echo ========================================
echo   Supabase / Postgres
echo ========================================
echo.
echo 1) Crie um projeto em https://supabase.com
echo 2) Settings ^> Database ^> Connection string (URI)
echo 3) Cole a URL abaixo quando solicitado
echo.

set /p DATABASE_URL="DATABASE_URL: "
if "%DATABASE_URL%"=="" (
  echo URL obrigatoria.
  pause
  exit /b 1
)

echo.
echo Aplicando schema Postgres...
set DATABASE_URL=%DATABASE_URL%
call npm run db:migrate:postgres
if errorlevel 1 (
  echo Falha ao aplicar schema.
  pause
  exit /b 1
)

if exist "server\data\store.db" (
  echo.
  set /p MIGRATE=Encontrado SQLite local. Migrar dados? (S/N):
  if /i "%MIGRATE%"=="S" (
    call npm run db:migrate:sqlite-to-postgres
    if errorlevel 1 (
      echo Falha na migracao de dados.
      pause
      exit /b 1
    )
  )
)

echo.
echo Salve no .env local e no Railway:
echo   DATABASE_URL=%DATABASE_URL%
echo.
echo Railway CLI (opcional):
echo   railway variable set DATABASE_URL="%DATABASE_URL%" --service web
echo.
echo Health deve retornar databaseDriver=postgres:
echo   /api/health
echo.
pause
