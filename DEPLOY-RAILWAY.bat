@echo off
cd /d "%~dp0"
title Koryn Tech - Railway Deploy

set "RAILWAY=railway"
where railway >nul 2>&1
if errorlevel 1 (
  echo Railway CLI nao encontrado. Instale com: npm i -g @railway/cli
  pause
  exit /b 1
)

echo ========================================
echo   Koryn Tech - Railway
echo ========================================
echo.
echo Projeto: koryn-tech-saas
echo URL: https://web-production-b5f0a.up.railway.app
echo.

"%RAILWAY%" whoami
if errorlevel 1 (
  echo Faca login: railway login
  pause
  exit /b 1
)

echo Abrindo painel Railway...
"%RAILWAY%" open

echo.
echo Comandos uteis:
echo   railway logs
echo   railway service status
echo   railway redeploy
echo.
pause
