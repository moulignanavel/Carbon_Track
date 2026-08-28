# 🚀 CarbonTrack Live Production Deployment Guide

CarbonTrack is deployed live on the web with full real-time database, AI Gemini integration, JWT authentication, and SSL security.

---

## 🌐 Live Active Environments

- **Frontend (Vercel)**: [https://carbon-track-bduc68xfe-mowleeswaran-gs-projects.vercel.app](https://carbon-track-bduc68xfe-mowleeswaran-gs-projects.vercel.app)
- **Backend (Render)**: [https://carbontrack-backend-pdg4.onrender.com](https://carbontrack-backend-pdg4.onrender.com)

---

## 🌟 Cloud Deployment Overview

### Backend Service (Render.com)
- **Runtime**: Docker (Multi-stage build with `maven:3.9.6-eclipse-temurin-17` and JRE 17)
- **Root Directory**: `.`
- **Environment Variables**:
  - `SPRING_PROFILES_ACTIVE` = `prod`
  - `JWT_SECRET` = `carbontrackProductionSecretKeyForJwtSigningMustBeAtLeast256BitsLongForHMACSHA256`

### Frontend Service (Vercel.com)
- **Framework Preset**: `Vite`
- **Root Directory**: `frontend`
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Environment Variables**:
  - `VITE_API_BASE_URL` = `https://carbontrack-backend-pdg4.onrender.com`

---

## 🔒 Post-Deployment Checklist
- [x] Spring Boot Production profile created (`application-prod.properties`)
- [x] Dockerfile & NGINX reverse proxy configured
- [x] Backend deployed on Render (`https://carbontrack-backend-pdg4.onrender.com`)
- [x] Frontend deployed on Vercel (`https://carbon-track-bduc68xfe-mowleeswaran-gs-projects.vercel.app`)
- [x] Google Cloud Console OAuth Authorized JavaScript Origins:
  `https://carbon-track-bduc68xfe-mowleeswaran-gs-projects.vercel.app`
- [x] Google Cloud Console OAuth Authorized Redirect URIs:
  `https://carbontrack-backend-pdg4.onrender.com/login/oauth2/code/google`

