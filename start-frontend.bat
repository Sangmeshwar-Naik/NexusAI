@echo off
title NexusAI Frontend Server
echo Starting NexusAI Next.js Frontend on http://localhost:3000...
cd /d "%~dp0frontend"
npm run dev
