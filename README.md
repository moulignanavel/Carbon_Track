# 🌱 CarbonTrack - Environmental Impact Tracking & Sustainability Analytics

[![Live Website](https://img.shields.io/badge/Live%20Website-Vercel-000000?style=for-the-badge&logo=vercel)](https://carbon-track-bduc68xfe-mowleeswaran-gs-projects.vercel.app)
[![Live Backend API](https://img.shields.io/badge/Backend%20API-Render-46E3B7?style=for-the-badge&logo=render)](https://carbontrack-backend-pdg4.onrender.com)
[![Build Status](https://img.shields.io/badge/Status-Live%20%26%20Active-brightgreen?style=for-the-badge)]()

**CarbonTrack** is a full-stack enterprise platform designed for tracking carbon footprints, evaluating sustainability metrics, logging eco-friendly activities, and generating AI-powered recommendations using Google Gemini AI.

---

## 🚀 Live Production Links

- **🌐 Live Web Application (Frontend)**: [https://carbon-track-bduc68xfe-mowleeswaran-gs-projects.vercel.app](https://carbon-track-bduc68xfe-mowleeswaran-gs-projects.vercel.app)
- **⚡ Live Backend REST API**: [https://carbontrack-backend-pdg4.onrender.com](https://carbontrack-backend-pdg4.onrender.com)

---

## ✨ Features

- 📊 **Real-time Sustainability Dashboard**: Monitor individual & organization carbon emissions.
- 🤖 **AI-Powered Insights**: Integrates Google Gemini 2.0 Flash AI for automated eco-tips and sustainability audits.
- 🔐 **Secure Authentication**: Supports JWT-based Auth and Google OAuth 2.0 single sign-on.
- 🏢 **Organization Management**: Track organizational footprints, team performance, and compliance metrics.
- ⚡ **Multi-tier Database Engine**: Embedded H2 for zero-config production deployment, with full MySQL cloud support.

---

## 🛠️ Technology Stack

- **Frontend**: React, Vite, Tailwind CSS, Recharts, Lucide Icons (Hosted on **Vercel**)
- **Backend**: Java 17, Spring Boot 3, Spring Security, Spring Data JPA, JWT (Hosted on **Render**)
- **Database**: H2 Database / MySQL Cloud
- **AI Integration**: Google Gemini API

---

## 📝 Environment Configuration

### Frontend (`frontend/.env`)
```env
VITE_API_BASE_URL=https://carbontrack-backend-pdg4.onrender.com
```

### Backend (`application-prod.properties`)
```properties
server.port=8080
spring.profiles.active=prod
jwt.secret=carbontrackProductionSecretKeyForJwtSigningMustBeAtLeast256BitsLongForHMACSHA256
```

---

## 💻 Local Setup & Installation

### Prerequisites
- Node.js (v18+)
- Java JDK 17+
- Maven 3.9+

### Backend Setup
```bash
cd backend
mvn clean spring-boot:run
```

### Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

---

## 📜 License
Distributed under the MIT License. See `LICENSE` for more information.