@echo off
cd /d "%~dp0"
title Koryn Tech - Configurar dominio customizado

set "RAILWAY=railway"
set "DOMINIO=koryntech.com"
set "RAILWAY_HOST=web-production-b5f0a.up.railway.app"

where railway >nul 2>&1
if errorlevel 1 (
  echo Instale o Railway CLI: npm i -g @railway/cli
  pause
  exit /b 1
)

echo ========================================
echo   Dominio customizado: %DOMINIO%
echo ========================================
echo.
echo 1) No Railway (servico web ^> Settings ^> Networking):
echo    - Add Custom Domain: %DOMINIO%
echo    - Add Custom Domain: *.%DOMINIO%
echo    - Copie os registros DNS que o Railway mostrar
echo.
echo 2) No seu provedor DNS (Cloudflare recomendado):
echo    - CNAME  @  -^>  %RAILWAY_HOST%
echo    - CNAME  *  -^>  %RAILWAY_HOST%
echo    - TXT e _acme-challenge conforme Railway pedir
echo    - Desative proxy laranja no _acme-challenge (Cloudflare)
echo.
echo 3) Apos adicionar os dominios no Railway, pressione uma tecla
echo    para atualizar variaveis e rebuild automatico.
pause

"%RAILWAY%" whoami >nul 2>&1
if errorlevel 1 (
  echo Faca login: railway login
  pause
  exit /b 1
)

"%RAILWAY%" service web >nul 2>&1

echo Atualizando variaveis de producao...
"%RAILWAY%" variable set APP_BASE_URL="https://%DOMINIO%" --service web
"%RAILWAY%" variable set CORS_ORIGIN="https://%DOMINIO%" --service web
"%RAILWAY%" variable set VITE_TENANT_BASE_DOMAINS="%DOMINIO%,%RAILWAY_HOST%" --service web

echo.
echo Variaveis atualizadas. Aguarde o redeploy no Railway.
echo.
echo URLs finais:
echo   Loja: https://%DOMINIO%
echo   Demo: https://demo.%DOMINIO%
echo   Plataforma: https://%DOMINIO%/platform
echo   Health: https://%DOMINIO%/api/health
echo.
echo Abrindo painel Railway...
start "" "https://railway.com/project/6f9ceddb-11b7-4952-b9cf-a558cea4068f/service/d71a51c0-e694-4b35-ab65-de709ef24992/settings#networking"
pause
