@echo off
cd /d "%~dp0"
title Koryn Tech - Publicar no GitHub

set "GH=C:\Program Files\GitHub CLI\gh.exe"
if not exist "%GH%" (
  echo GitHub CLI nao encontrado. Instale com: winget install GitHub.cli
  pause
  exit /b 1
)

echo ========================================
echo   Publicar projeto no GitHub
echo ========================================
echo.

"%GH%" auth status >nul 2>&1
if errorlevel 1 (
  echo Abrindo login do GitHub no navegador...
  "%GH%" auth login -h github.com -p https -w
  if errorlevel 1 (
    echo Falha no login.
    pause
    exit /b 1
  )
)

if not exist .git (
  git init
  git branch -M main
)

git add -A
git diff --cached --quiet
if errorlevel 1 (
  git -c user.email="admin@koryntech.com" -c user.name="Koryn Tech" commit -m "Update: Koryn Tech SaaS"
)

set REPO_NAME=koryn-tech-saas

"%GH%" repo view "%GH_USER%/%REPO_NAME%" >nul 2>&1
if errorlevel 1 (
  echo Criando repositorio %REPO_NAME%...
  "%GH%" repo create %REPO_NAME% --public --source=. --remote=origin --description "SaaS multi-tenant para lojas de eletronicos" --push
) else (
  echo Repositório ja existe. Enviando alteracoes...
  git push -u origin main
)

if errorlevel 1 (
  echo Erro ao publicar.
  pause
  exit /b 1
)

for /f "delims=" %%u in ('"%GH%" repo view --json url -q .url') do set REPO_URL=%%u

echo.
echo ========================================
echo   Publicado: %REPO_URL%
echo ========================================
echo Proximo passo: Railway - Deploy from GitHub
echo.
pause
