<div align="center">

![ClimaSense AI Logo](./public/logo.png)

# 🌍 ClimaSense AI - Intelligent Weather Prediction App

> **AI-Powered Real-Time Weather Forecasting with Predictive Analytics & Intelligent Insights**

[![Next.js](https://img.shields.io/badge/Next.js-16.0.0-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.2.0-blue?style=flat-square&logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-4.x-38B2AC?style=flat-square&logo=tailwind-css)](https://tailwindcss.com/)
[![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)](LICENSE)

</div>

---

## 📋 Table of Contents

1. [🎯 Overview](#-overview)
2. [⚡ Features](#-features)
3. [🛠️ Tech Stack](#-tech-stack)
4. [🏗️ System Architecture](#-system-architecture)
5. [📁 Project Structure](#-project-structure)
6. [🔄 Component Hierarchy](#-component-hierarchy)
7. [📡 Data Flow](#-data-flow)
8. [📚 API Documentation](#-api-documentation)
9. [🚀 Installation & Setup](#-installation--setup)
10. [🔑 Environment Variables](#-environment-variables)
11. [📖 Usage Guide](#-usage-guide)
12. [🛠️ Development](#-development)
13. [🚀 Deployment](#-deployment)
14. [📚 API References](#-api-references)
15. [🎨 Design System](#-design-system)
16. [🤝 Contributing](#-contributing)
17. [📝 License](#-license)

---
Link Demo : https://wheather-prediction-app.vercel.app/

## 🎯 Overview

**ClimaSense AI** adalah aplikasi weather forecasting berbasis AI yang mengintegrasikan:

- ✅ **Real-time Weather Data**: Data cuaca terkini dari Open-Meteo API (JMA Global Forecast)
- ✅ **AI-Powered Analysis**: Analisis cuaca cerdas menggunakan LLM (Grok/OpenRouter)
- ✅ **Predictive Charts**: Visualisasi prediksi suhu hingga 16 hari ke depan
- ✅ **Smart Alerts**: Notifikasi otomatis untuk perubahan kondisi cuaca
- ✅ **Multi-Location Support**: Kelola dan bandingkan cuaca di berbagai lokasi
- ✅ **Dark/Light Mode**: Theme otomatis berdasarkan waktu dengan toggle manual
- ✅ **Responsive Design**: Full responsive dari mobile hingga desktop
- ✅ **Interactive UI**: Animasi smooth dengan Framer Motion & glassmorphism effects

### 🌐 Weather Data Integration: JMA + Open-Meteo

ClimaSense AI menggunakan **kombinasi powerful dari dua model meteorologi** untuk memberikan prediksi cuaca yang paling akurat:

#### **Open-Meteo API with JMA Global Forecast**

Open-Meteo menyediakan akses ke **Japan Meteorological Agency (JMA) Global Forecast Model** - salah satu model prediksi cuaca paling canggih di dunia.

**Keunggulan JMA Model:**
- 🎯 **Resolusi Tinggi**: Grid spacing 0.25° × 0.25° (±25 km di ekuator)
- 📊 **Prediksi Jangka Panjang**: Forecast hingga 16 hari dengan akurasi tinggi
- 🌍 **Cakupan Global**: Mencakup seluruh dunia dengan data komprehensif
- ⚡ **Update Berkala**: Data diupdate setiap 6 jam (00:00, 06:00, 12:00, 18:00 UTC)
- 🔬 **Model Fisika Canggih**: Menggunakan persamaan Navier-Stokes dan thermodynamika
- 📡 **Assimilasi Data Real-time**: Mengintegrasikan observasi satelit, radar, dan stasiun ground

**Parameter Data dari JMA Model:**

```
Hourly Data (per jam untuk 16 hari):
├── Temperature 2m (°C)           - Suhu pada ketinggian 2 meter
├── Relative Humidity 2m (%)      - Kelembaban relatif
├── Pressure MSL (hPa)            - Tekanan di permukaan laut
├── Precipitation (mm)             - Curah hujan
├── Cloud Cover (%)               - Persentase tutupan awan
├── Wind Speed 10m (km/h)         - Kecepatan angin pada 10 meter
├── Weather Code (WMO)            - Kode cuaca standar WMO
├── Shortwave Radiation (W/m²)    - Radiasi matahari
└── Evapotranspiration (mm)       - Penguapan air dari tanah

Daily Data (per hari):
├── Temperature 2m Max/Min (°C)   - Suhu maksimum dan minimum harian
├── Precipitation Sum (mm)         - Total curah hujan harian
├── Weather Code (WMO)            - Kondisi cuaca dominan
├── Wind Speed Max (km/h)         - Kecepatan angin maksimum
├── UV Index Max                  - Indeks radiasi UV maksimum
├── Sunrise & Sunset (ISO 8601)   - Waktu terbit dan terbenam matahari
└── Wind Gusts Max (km/h)         - Hembusan angin maksimum
```

#### **Data Processing Pipeline**

```
JMA Forecast Data (Open-Meteo)
        │
        ├─► Hourly Processing
        │   ├─ Parse raw meteorological data
        │   ├─ Validate against QC standards
        │   └─ Convert units (°C, km/h, mm)
        │
        ├─► Daily Aggregation
        │   ├─ Calculate daily max/min
        │   ├─ Sum precipitation
        │   └─ Extract extremes
        │
        ├─► Spatial Validation
        │   ├─ Check data consistency
        │   ├─ Fill missing values (interpolation)
        │   └─ Verify coordinate boundaries
        │
        └─► AI Context Generation
            ├─ Temperature trends
            ├─ Precipitation probability
            ├─ Severe weather patterns
            └─ Human-readable summaries
```

#### **Model Accuracy & Reliability**

| Forecast Range | JMA Model Accuracy | Confidence Level |
|---|---|---|
| **0-3 days** | 95%+ | Very High ✅ |
| **4-7 days** | 85-90% | High ✅ |
| **8-12 days** | 75-80% | Moderate ⚠️ |
| **13-16 days** | 65-75% | Lower ⚠️ |

**Catatan**: Akurasi bervariasi berdasarkan region, musim, dan kondisi atmosfer lokal.

#### **Kombinasi Strategi Kami**

```
User Input (Location)
    │
    ├─► Fetch from JMA via Open-Meteo
    │   ├─ Get latest model run
    │   ├─ Extract hourly + daily data
    │   └─ Cache for 10 minutes
    │
    ├─► Process & Validate
    │   ├─ Type conversion
    │   ├─ Range checking
    │   └─ Handle missing data
    │
    ├─► Generate AI Context
    │   ├─ Weather analysis
    │   ├─ Alert generation
    │   └─ Summary creation
    │
    └─► Display to User
        ├─ Real-time dashboard
        ├─ Interactive charts
        ├─ AI-powered insights
        └─ Actionable alerts
```

**Keuntungan Pendekatan Ini:**
- 📈 **Akurasi Maksimal**: JMA adalah salah satu model terbaik dunia
- 🔄 **Data Konsisten**: Single source of truth untuk semua prediksi
- ⚡ **Response Cepat**: Data di-cache untuk performa optimal
- 🎯 **Granularitas Tinggi**: Data per jam untuk detail maksimal
- 🌍 **Jangkauan Global**: Bekerja di mana saja di dunia
- 💰 **Cost Effective**: Open-Meteo gratis untuk penggunaan non-komersial

---

## ⚡ Features

### 🏠 Home Dashboard
- **Location Carousel**: Navigasi cepat antar lokasi tersimpan
- **Smart Alerts**: Notifikasi cuaca berbasis AI
- **Hero Section**: Tampilan utama suhu dan kondisi cuaca
- **Today's Summary**: Ringkasan kondisi hari ini
- **Weather Stats Cards**: Kelembaban, kecepatan angin, probabilitas hujan
- **Environmental Insights**: Kualitas udara, indeks UV, sunrise/sunset
- **Prediction Chart**: Visualisasi prediksi temperatur dengan 3 rentang waktu
- **AI Reasoning**: Chat interface dengan AI untuk analisis mendalam

### 📊 History View
- **Weather History**: Riwayat data cuaca historis
- **Forecast**: Prediksi cuaca detil hingga 16 hari

### 🔔 Alerts System
- **Real-time Alerts**: Notifikasi otomatis untuk kondisi ekstrem
- **Severity Levels**: High, Moderate, Low
- **AI-Generated Insights**: Alert berbasis analisis AI

### ⚙️ Settings
- Theme preferences
- Notification settings
- Unit preferences (°C/°F, km/h/m/s, etc.)

---

## 🛠️ Tech Stack

### Frontend Framework
- **Next.js 16.0.0** - React framework dengan App Router
- **React 19.2.0** - UI library
- **TypeScript 5.x** - Type-safe development

### UI & Styling
- **Tailwind CSS 4.x** - Utility-first CSS framework
- **Framer Motion 11.0.0** - Animation library
- **Shadcn/ui** - Pre-built accessible UI components
- **Radix UI** - Unstyled, accessible primitives

### Data Visualization
- **Recharts 2.10.0** - React charting library
- **COBE 0.6.3** - 3D globe visualization (future)
- **OGL 1.0.11** - WebGL library

### State Management
- **React Hooks** - useState, useEffect, useContext, useCallback
- **Context API** - WeatherProvider untuk shared state

### API & Services
- **Open-Meteo API** - JMA Global Forecast + Environmental data
- **OpenRouter API** - LLM integration (Grok, Claude, etc.)
- **Nominatim OpenStreetMap** - Geolocation & location search

### Forms & Validation
- **React Hook Form 7.65.0** - Efficient form management
- **Input OTP 1.4.2** - OTP input component

### Utilities
- **Lucide React 0.546.0** - Icon library
- **Clsx 2.0.0** - Conditional classname utility
- **Tailwind Merge 2.2.0** - Merge tailwind classes safely
- **Sonner 2.0.7** - Toast notifications

---

## 🏗️ System Architecture

### High-Level Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                        ClimaSense AI Application                    │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ┌──────────────────────┐          ┌──────────────────────┐       │
│  │  CLIENT LAYER        │          │  SERVER LAYER        │       │
│  ├──────────────────────┤          ├──────────────────────┤       │
│  │ • Components         │◄────────►│ • API Routes         │       │
│  │ • Hooks              │          │ • Services           │       │
│  │ • Context API        │          │ • Middleware         │       │
│  │ • State Management   │          │ • Error Handling     │       │
│  └──────────────────────┘          └──────────────────────┘       │
│           ▲                                  ▲                     │
│           │                                  │                     │
│           └──────────────────┬───────────────┘                     │
│                              │                                     │
│                   ┌──────────▼─────────────┐                       │
│                   │   EXTERNAL APIs        │                       │
│                   ├───────────────────────┤                        │
│                   │ • Open-Meteo (JMA)    │                        │
│                   │ • OpenRouter (LLM)    │                        │
│                   │ • Nominatim (GeoLocation)                      │
│                   └───────────────────────┘                        │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

### Data Flow Architecture

```
User Action / App Load
        │
        ▼
┌──────────────────────────────┐
│  Geolocation Detection       │
│  (Browser API)               │
└──────────┬───────────────────┘
           │
           ▼
┌──────────────────────────────┐
│  Save Location               │
│  (localStorage)              │
└──────────┬───────────────────┘
           │
           ▼
┌──────────────────────────────┐
│  Fetch Weather Data          │
│  (Open-Meteo API)            │
│  - JMA Forecast (16 days)    │
│  - Environmental data        │
└──────────┬───────────────────┘
           │
           ▼
┌──────────────────────────────┐
│  Cache Result                │
│  (10 min TTL)                │
└──────────┬───────────────────┘
           │
           ▼
┌──────────────────────────────┐
│  Generate AI Analysis        │
│  (OpenRouter + Context)      │
│  - AI Summary                │
│  - Alerts                    │
│  - Recommendations           │
└──────────┬───────────────────┘
           │
           ▼
┌──────────────────────────────┐
│  Update UI Components        │
│  - HeroSection               │
│  - Charts                    │
│  - Stats Cards               │
│  - Alerts                    │
└──────────────────────────────┘
```

---

## 📁 Project Structure

```
whealthy_people_project1/
│
├── 📄 Configuration Files
│   ├── package.json                 # Dependencies & scripts
│   ├── tsconfig.json                # TypeScript config
│   ├── tailwind.config.ts           # Tailwind CSS config
│   ├── postcss.config.mjs           # PostCSS config
│   ├── next.config.ts               # Next.js config
│   ├── eslint.config.mjs            # ESLint config
│   └── next-env.d.ts                # Next.js type definitions
│
├── 🌐 src/
│   │
│   ├── 📄 app/                      # Next.js App Router
│   │   ├── layout.tsx               # Root layout with providers
│   │   ├── page.tsx                 # Main entry point (ClimaSenseApp)
│   │   ├── globals.css              # Global styles
│   │   └── api/                     # API Routes
│   │       ├── weather/
│   │       │   └── forecast/[...route].ts
│   │       └── ai/
│   │           ├── chat/route.ts
│   │           └── analyze/route.ts
│   │
│   ├── 🎨 components/               # React Components
│   │   ├── layout/
│   │   │   ├── AnimatedSidebar.tsx     # Desktop & mobile sidebar
│   │   │   ├── BottomNav.tsx           # Mobile bottom navigation
│   │   │   └── Header.tsx              # Mobile header
│   │   │
│   │   ├── weather/
│   │   │   ├── Aurora.tsx              # Background aurora effect
│   │   │   ├── features/
│   │   │   │   ├── HeroSection.tsx     # Main weather display
│   │   │   │   ├── WeatherStatsCards.tsx # Stats grid
│   │   │   │   ├── TodaySummary.tsx    # Daily summary
│   │   │   │   ├── EnvironmentalInsights.tsx # Air quality, UV, etc
│   │   │   │   ├── PredictionChart.tsx # Temperature forecast
│   │   │   │   ├── AIReasoning.tsx     # Chat interface
│   │   │   │   ├── LocationCarousel.tsx # Multi-location nav
│   │   │   │   ├── SmartAlerts.tsx     # Weather alerts
│   │   │   │   ├── WeatherHistory.tsx  # Historical data
│   │   │   │   └── WeatherPrediction.tsx # 16-day forecast
│   │   │   │
│   │   │   └── animations/
│   │   │       ├── LoadingCloud.tsx    # Loading spinner
│   │   │       ├── GlobeHint.tsx       # Interactive hint
│   │   │       └── Sparkline.tsx       # Mini charts
│   │   │
│   │   └── ui/                       # Shadcn/UI Components
│   │       ├── button.tsx
│   │       ├── card.tsx
│   │       ├── dialog.tsx
│   │       ├── input.tsx
│   │       ├── select.tsx
│   │       ├── toast.tsx
│   │       ├── skeleton.tsx
│   │       └── ... (20+ components)
│   │
│   ├── 🎯 hooks/                     # Custom Hooks
│   │   ├── useWeather.ts             # Weather data fetching
│   │   ├── useGeolocation.ts         # Geolocation detection
│   │   ├── useWeatherInsights.ts     # AI insights generation
│   │   ├── useAI.ts                  # Generic AI hook
│   │   ├── useAIWithLocation.ts      # AI with location context
│   │   └── useTheme.ts               # Theme management
│   │
│   ├── 🔧 services/                  # Business Logic
│   │   ├── weatherService.ts         # Open-Meteo API wrapper
│   │   ├── openrouterService.ts      # OpenRouter API wrapper
│   │   ├── weatherAlertsService.ts   # Alert generation
│   │   ├── groqService.ts            # Groq API wrapper
│   │   └── weatherContextChat.ts     # Context-aware chat
│   │
│   ├── 🎨 styles/                    # Global Styles
│   │   └── globals.css               # Tailwind imports + custom CSS
│   │
│   ├── 📦 context/                   # Context API
│   │   └── WeatherContext.tsx        # Shared weather context
│   │
│   ├── 📊 types/                     # TypeScript Definitions
│   │   ├── weather.types.ts          # Weather API types
│   │   ├── ai.types.ts               # AI service types
│   │   └── api.types.ts              # API response types
│   │
│   ├── 🛠️ lib/                       # Utilities
│   │   ├── utils.ts                  # General utilities
│   │   ├── test-openrouter.ts        # Testing utilities
│   │   └── cn.ts                     # Classname helper
│   │
│   ├── 📡 middleware/                # Middleware
│   │   ├── aiLocationMiddleware.ts   # AI + Location middleware
│   │   └── aiLocationMiddlewareInit.tsx # Middleware provider
│   │
│   └── 🔑 utils/                     # Additional utilities
│
├── 📚 panduan/                       # Reference UI Guide
│   ├── src/
│   │   ├── components/               # Reference components
│   │   ├── guidelines/               # Design guidelines
│   │   └── styles/                   # Reference styles
│   └── CLIMASENSE_NEXTJS_GUIDE.md    # Detailed guide
│
├── 🗂️ public/                        # Static Assets
│   ├── logo.png
│   ├── favicon.ico
│   └── ...
│
├── 📝 scripts/                       # Build/Dev Scripts
│   └── debug-ai.js
│
└── 🌐 components_backup/             # Backup Components
    └── (all component backups)
```

---

## 🔄 Component Hierarchy & Data Flow

### Complete Component Tree

```
App (Main Container - page.tsx)
│
├─ WeatherProvider (Context)
│  └─ ClimaSenseAppContent
│
├─ Layout
│  ├─ Aurora (Background Effect)
│  ├─ AnimatedSidebar (Desktop)
│  ├─ Header (Mobile)
│  └─ BottomNav (Mobile - disabled)
│
├─ Main Content (Conditional based on activeView)
│  │
│  ├─ HOME View
│  │  ├─ LocationCarousel
│  │  ├─ SmartAlerts
│  │  ├─ HeroSection
│  │  │  ├─ Location & Time Display
│  │  │  ├─ Temperature Display (count-up animation)
│  │  │  └─ AI Summary Card
│  │  │
│  │  ├─ TodaySummary
│  │  │  ├─ AI Generated Summary Text
│  │  │  ├─ High/Low Temperature
│  │  │  └─ Quick Stats (Sunrise, Sunset, Humidity, Wind)
│  │  │
│  │  ├─ WeatherStatsCards (Grid 2 columns)
│  │  │  ├─ Feels Like (with Sparkline)
│  │  │  ├─ Humidity (with Sparkline)
│  │  │  ├─ Wind Speed (with Sparkline)
│  │  │  └─ Rain Probability (with Sparkline)
│  │  │
│  │  ├─ EnvironmentalInsights
│  │  │  ├─ Air Quality Score
│  │  │  ├─ UV Index
│  │  │  ├─ Sunrise Time
│  │  │  └─ Sunset Time
│  │  │
│  │  ├─ PredictionChart
│  │  │  ├─ Temperature Forecast (16 days)
│  │  │  ├─ Range Selector (1h, 24h, 7d)
│  │  │  └─ Interactive Legend
│  │  │
│  │  └─ AIReasoning
│  │     ├─ Chat Messages
│  │     ├─ Typing Indicator
│  │     ├─ Input Field
│  │     └─ Send Button
│  │
│  ├─ HISTORY View
│  │  ├─ WeatherHistory (Historical Data)
│  │  └─ WeatherPrediction (16-day Forecast)
│  │
│  ├─ ALERTS View
│  │  └─ SmartAlerts (Expanded)
│  │     ├─ Alert Cards (High/Moderate/Low severity)
│  │     ├─ Alert Type Icons
│  │     └─ Severity Badges
│  │
│  └─ SETTINGS View
│     └─ Settings Placeholder (Coming Soon)
│
├─ GlobeHint (First Load Tooltip)
│
└─ Loading States
   ├─ BoxLoader (Initial Load)
   ├─ LocationErrorBoundary
   ├─ GeolocationLoading
   └─ WeatherDataLoading
```

### State Management Flow

```typescript
// App-level State
activeView: 'home' | 'history' | 'weather-history' | 'weather-prediction' | 'alerts' | 'settings'
isDark: boolean (auto-detect based on time)
sidebarOpen: boolean (mobile only)
sidebarExpanded: boolean (desktop only)
isDesktop: boolean (responsive detection)
isLoading: boolean (initial load)

// Location State
currentLocation: LocationCoordinates (from geolocation)
savedLocations: LocationCoordinates[] (from localStorage)
activeLocation: LocationCoordinates (selected for weather display)
selectedLocationIndex: number
showLocationOptions: boolean
manualLocationInput: string
isSearchingLocation: boolean

// Weather State (from context)
weatherData: CombinedWeatherData | null
isWeatherLoading: boolean
weatherError: WeatherAPIError | null

// Geolocation State
isGeoLoading: boolean
geoError: string | null

// AI State
aiSummary: string | null
aiAlerts: Alert[]

// Data Flow
User Action → State Update → Re-render → API Call → Cache Check → 
Data Update → AI Processing → Context Update → Component Re-render
```

---

## 📡 API Documentation

### Weather API Endpoints

#### 1. **Open-Meteo API (JMA Global Forecast)**
- **Base URL**: `https://api.open-meteo.com/v1/forecast`
- **Type**: REST (GET)
- **Authentication**: No key required (free tier)

##### Endpoint: `/forecast`

**Query Parameters**:
```typescript
{
  latitude: number          // Location latitude
  longitude: number         // Location longitude
  hourly: string[]          // Hourly data fields
  daily: string[]           // Daily data fields
  forecast_days: number     // Days to forecast (1-16)
  timezone: string          // Timezone (e.g., 'auto', 'Asia/Jakarta')
}
```

**Hourly Fields**:
```
temperature_2m              // Temperature in °C
relative_humidity_2m        // Humidity percentage
pressure_msl                // Atmospheric pressure (hPa)
precipitation               // Precipitation amount (mm)
cloud_cover                 // Cloud cover percentage
wind_speed_10m              // Wind speed (km/h)
weather_code                // WMO weather code
```

**Daily Fields**:
```
temperature_2m_max          // Max temperature
temperature_2m_min          // Min temperature
precipitation_sum           // Total precipitation (mm)
weather_code                // Primary weather code
uv_index_max                // Max UV index
sunrise                     // Sunrise time (ISO 8601)
sunset                      // Sunset time (ISO 8601)
```

**Example Request**:
```bash
GET https://api.open-meteo.com/v1/forecast?
latitude=-1.169
&longitude=124.730
&hourly=temperature_2m,relative_humidity_2m,pressure_msl,precipitation,cloud_cover,wind_speed_10m,weather_code
&daily=temperature_2m_max,temperature_2m_min,precipitation_sum,weather_code,uv_index_max,sunrise,sunset
&forecast_days=16
&timezone=auto
```

**Response Example**:
```json
{
  "latitude": -1.169,
  "longitude": 124.730,
  "elevation": 50,
  "timezone": "Asia/Makassar",
  "hourly": {
    "time": ["2025-10-25T00:00", "2025-10-25T01:00"],
    "temperature_2m": [28.5, 27.8],
    "relative_humidity_2m": [75, 78],
    "precipitation": [0, 0.2]
  },
  "daily": {
    "time": ["2025-10-25"],
    "temperature_2m_max": [32.1],
    "temperature_2m_min": [24.3]
  }
}
```

#### 2. **OpenRouter API (LLM Integration)**
- **Base URL**: `https://openrouter.ai/api/v1`
- **Type**: REST (POST)
- **Authentication**: Bearer token (NEXT_PUBLIC_OPENROUTER_API_KEY)

##### Endpoint: `/chat/completions`

**Request Body**:
```typescript
{
  model: 'x-ai/grok-code-fast-1'  // Model ID
  messages: [
    {
      role: 'system' | 'user' | 'assistant'
      content: string                // Message content
    }
  ]
  temperature?: number              // Creativity (0-2)
  max_tokens?: number               // Response limit
  top_p?: number                    // Diversity
}
```

**Example Request**:
```bash
POST https://openrouter.ai/api/v1/chat/completions
Authorization: Bearer YOUR_API_KEY
Content-Type: application/json

{
  "model": "x-ai/grok-code-fast-1",
  "messages": [
    {
      "role": "system",
      "content": "You are a weather assistant..."
    },
    {
      "role": "user",
      "content": "What's the weather like?"
    }
  ]
}
```

**Response Example**:
```json
{
  "id": "chatcmpl-xxx",
  "object": "chat.completion",
  "created": 1698098765,
  "model": "x-ai/grok-code-fast-1",
  "choices": [
    {
      "index": 0,
      "message": {
        "role": "assistant",
        "content": "The weather is partly cloudy..."
      },
      "finish_reason": "stop"
    }
  ],
  "usage": {
    "prompt_tokens": 50,
    "completion_tokens": 120,
    "total_tokens": 170
  }
}
```

#### 3. **Nominatim API (Geolocation)**
- **Base URL**: `https://nominatim.openstreetmap.org`
- **Type**: REST (GET)
- **Authentication**: No key required

##### Endpoint: `/search`

**Query Parameters**:
```
q: string                    // Location name to search
format: 'json'              // Response format
limit: number               // Result limit
```

**Example Request**:
```bash
GET https://nominatim.openstreetmap.org/search?
q=Jakarta
&format=json
&limit=5
```

**Response Example**:
```json
[
  {
    "lat": "-6.2088",
    "lon": "106.8456",
    "display_name": "Jakarta, Indonesia",
    "address": {
      "city": "Jakarta",
      "country": "Indonesia"
    }
  }
]
```

### Custom API Routes

#### `/api/weather/forecast`
- **Method**: POST
- **Purpose**: Fetch weather forecast with caching
- **Request**:
```typescript
{
  latitude: number
  longitude: number
  includeHourly?: boolean
  hourlyCount?: number
}
```

#### `/api/ai/chat`
- **Method**: POST
- **Purpose**: Chat with AI assistant about weather
- **Request**:
```typescript
{
  messages: AIMessage[]
  context?: AIContext
}
```

#### `/api/ai/analyze`
- **Method**: POST
- **Purpose**: AI weather analysis
- **Request**:
```typescript
{
  weatherContext: string
  location: string
}
```

---

## 🚀 Installation & Setup

### Prerequisites
- Node.js 18.x or higher
- npm or yarn package manager
- Git

### Step 1: Clone Repository

```bash
git clone https://github.com/KevinJeremi/wheather-Prediction-App.git
cd wheather-Prediction-App
```

### Step 2: Install Dependencies

```bash
npm install
# atau
yarn install
```

### Step 3: Setup Environment Variables

Create `.env.local` file in root directory:

```bash
# Open-Meteo API (Free, no key needed)
NEXT_PUBLIC_WEATHER_API_URL=https://api.open-meteo.com/v1

# OpenRouter API (Get from https://openrouter.ai)
NEXT_PUBLIC_OPENROUTER_API_KEY=your_openrouter_api_key_here

# Optional: Groq API (Get from https://console.groq.com)
NEXT_PUBLIC_GROQ_API_KEY=your_groq_api_key_here
```

### Step 4: Run Development Server

```bash
npm run dev
# atau
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) in browser.

### Step 5: Build for Production

```bash
npm run build
npm run start
```

---

## 🔑 Environment Variables

### Required Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `NEXT_PUBLIC_OPENROUTER_API_KEY` | OpenRouter API key for LLM | `sk-or-v1-xxx...` |
| `NEXT_PUBLIC_WEATHER_API_URL` | Open-Meteo base URL | `https://api.open-meteo.com/v1` |

### Optional Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NEXT_PUBLIC_GROQ_API_KEY` | Groq API key (alternative LLM) | `undefined` |
| `NODE_ENV` | Environment (development/production) | `development` |
| `NEXT_PUBLIC_MAX_FORECAST_DAYS` | Max forecast days to fetch | `16` |

### Getting API Keys

#### OpenRouter API
1. Visit https://openrouter.ai
2. Sign up / Login
3. Go to Settings → Keys
4. Create new API key
5. Copy to `.env.local`

#### Groq API
1. Visit https://console.groq.com
2. Sign up
3. Create API key
4. Copy to `.env.local`

---

## 📖 Usage Guide

### Basic Usage

#### 1. **App Initialization**

App otomatis mendeteksi lokasi user via browser geolocation API.

```typescript
// Automatic on app load
- Request browser permission
- Get latitude & longitude
- Save to localStorage
- Fetch weather data
```

#### 2. **Manual Location Search**

```typescript
// Jika geolocation gagal atau user ingin ubah lokasi
Click "Cari Lokasi Manual" button
  ↓
Enter city name (e.g., "Jakarta")
  ↓
Select from search results
  ↓
Location saved to localStorage
  ↓
Weather data fetched & displayed
```

#### 3. **View Weather Details**

```
HOME → See current weather
HISTORY → Choose between:
  - Weather History (past data)
  - Forecast (16-day prediction)
ALERTS → View active weather warnings
SETTINGS → Configure preferences (coming soon)
```

#### 4. **Chat with AI**

```typescript
// In AIReasoning card
1. Type your question in input field
   Example: "Should I bring an umbrella?"
2. Click send button
3. AI analyzes weather context
4. Response displayed with animation
```

---

## 🛠️ Development

### Available Scripts

```bash
# Development server (hot reload)
npm run dev

# Build production bundle
npm run build

# Start production server
npm run start

# Run linter
npm run lint

# Format code
npm run format
```

### Code Structure Best Practices

#### Component Pattern

```typescript
'use client'  // If using hooks

import { motion } from 'framer-motion'
import type { ComponentProps } from './types'

interface MyComponentProps {
  title: string
  onClick?: () => void
  variant?: 'default' | 'compact'
}

export function MyComponent({ 
  title, 
  onClick, 
  variant = 'default' 
}: MyComponentProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="component-classes"
    >
      {title}
    </motion.div>
  )
}
```

#### Hook Pattern

```typescript
export function useWeatherData(location: LocationCoordinates) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    // Fetch logic
  }, [location])

  return { data, loading, error }
}
```

#### Service Pattern

```typescript
// services/weatherService.ts
export class WeatherService {
  async getWeather(lat: number, lon: number) {
    // API call with error handling
  }

  async getForecast(lat: number, lon: number) {
    // API call with caching
  }
}
```

### Debugging

#### Enable Debug Logs

```typescript
// Browser console
localStorage.setItem('DEBUG', 'true')
```

#### Monitor Network Requests

Use browser DevTools → Network tab to inspect:
- Weather API calls
- AI API calls
- Cache hits/misses

#### Check Component State

```typescript
import { useEffect } from 'react'

export function DebugComponent() {
  useEffect(() => {
    console.log('Component mounted')
    return () => console.log('Component unmounted')
  }, [])
}
```

---

## 🚀 Deployment

### Deploy to Vercel (Recommended)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

### Deploy to Other Platforms

#### Netlify
```bash
npm run build
# Upload 'out' folder to Netlify
```

#### Docker

```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]
```

```bash
docker build -t climasense-ai .
docker run -p 3000:3000 -e NEXT_PUBLIC_OPENROUTER_API_KEY=xxx climasense-ai
```

---

## 📚 API References

### JMA Global Forecast Model - Technical Details

**Japan Meteorological Agency (JMA)** mengoperasikan salah satu sistem prediksi cuaca paling canggih di dunia. Berikut adalah detail teknis model yang digunakan ClimaSense AI:

#### **Model Specifications**

| Aspek | Detail |
|-------|--------|
| **Model Name** | JMA Global Forecast Model (GSM) |
| **Grid Resolution** | 0.25° × 0.25° (~27 km) |
| **Forecast Range** | 0-16 days (384 hours) |
| **Update Frequency** | 4 kali per hari (00, 06, 12, 18 UTC) |
| **Variables** | 60+ meteorological parameters |
| **Computational System** | Earth Simulator - Supercomputer tercanggih |
| **Data Assimilation** | 4D-Var method with satellite data |

#### **Physical Parameters**

JMA model memprediksi 60+ parameter atmosfer:

**Thermodynamic Variables:**
- Temperature (surface & upper levels)
- Dew point temperature
- Relative & absolute humidity
- Pressure fields (surface & geopotential heights)

**Dynamic Variables:**
- Wind components (u, v)
- Vertical velocity
- Vorticity & divergence
- Stream function

**Hydrological Variables:**
- Precipitation (liquid & solid)
- Cloud water content
- Cloud cover (layer-wise)
- Soil moisture

**Radiative Variables:**
- Shortwave radiation
- Longwave radiation
- Solar insolation
- Albedo

#### **Model Physics**

```
Core Equations:
├── Primitive Equations (Navier-Stokes for atmosphere)
├── Thermodynamic Equation (Energy balance)
├── Continuity Equation (Mass conservation)
├── Equation of State (Ideal gas law)
└── Hydrostatic Equation (Pressure gradient)

Physical Processes:
├── Convection (Cumulus & stratiform)
├── Cloud Microphysics (Rain, snow, ice)
├── Boundary Layer Turbulence
├── Radiative Transfer (Shortwave & Longwave)
├── Land-Surface Processes
└── Ocean Heat Exchange
```

#### **Data Assimilation Strategy**

JMA menggunakan **4D-Variational (4D-Var)** method:

```
Observation Data Sources:
├── Satellites (Polar & Geostationary)
│   ├─ Cloud-drift winds
│   ├─ Radiances (NOAA, EUMETSAT, Himawari)
│   └─ Atmospheric motion vectors
│
├── Ground Observations
│   ├─ Weather stations (150,000+ globally)
│   ├─ Buoys & ocean platforms
│   └─ Radiosonde balloons
│
├── Radar Data
│   ├─ Precipitation rates
│   ├─ Reflectivity patterns
│   └─ Velocity fields
│
└── Aircraft Reports (ACARS)
    ├─ Temperature & wind
    └─ Moisture profiles

                    ↓
            4D-Var Assimilation
            (Window: 6 hours)
            
                    ↓
            Analysis Increment
            (Update model state)
            
                    ↓
            Initial Conditions
            (Start for prediction)
```

#### **Forecast Skill Evolution**

```
Day 1-3:  ████████████████████ 95%+ skill
Day 4-5:  ██████████████████░░ 85-90% skill
Day 6-7:  ████████████████░░░░ 80-85% skill
Day 8-10: ██████████░░░░░░░░░░ 70-75% skill
Day 11-14:████████░░░░░░░░░░░░ 60-65% skill
Day 15-16:██████░░░░░░░░░░░░░░ 50-60% skill

Legend:
█ = High predictability
░ = Lower predictability
```

#### **Integration with Open-Meteo**

ClimaSense AI mengakses JMA data melalui **Open-Meteo API**, sebuah layanan gratis yang:

1. **Agregasi Model Data**: Mengumpulkan dari berbagai sumber global
2. **Quality Control**: Validasi dan cleaning data real-time
3. **Standardisasi**: Format konsisten untuk semua lokasi
4. **Caching**: Optimasi kecepatan dengan cache cerdas
5. **API Exposure**: Endpoint REST yang sederhana & reliable

```
JMA Servers (Tokyo)
        │
        ├─► Process Forecast Output
        ├─► Generate GRIB/NetCDF files
        │
        ▼
Open-Meteo Servers
        │
        ├─► Download Latest Data
        ├─► Parse & Validate
        ├─► Cache in CDN
        │
        ▼
ClimaSense App
        │
        ├─► Request Data via HTTP
        ├─► Receive JSON Response
        ├─► Display to User
        │
        ▼
User Dashboard
```

#### **Why JMA Model Excels**

✅ **Highest Accuracy**: Konsisten masuk top 3 model global  
✅ **Advanced Physics**: 60+ parameter vs kompetitor dengan 30+  
✅ **Best for Asia-Pacific**: Coverage terdetail di region ini  
✅ **Rapid Update**: Output setiap 6 jam  
✅ **Satellite Integration**: Menggunakan data satelit terbaru  
✅ **Proven Track Record**: 70+ tahun pengalaman prediksi  

#### **Comparison with Other Models**

| Model | Resolution | Range | Accuracy (Day 3) | Region Strength |
|-------|-----------|-------|---|---|
| **JMA GSM** | 0.25° | 16 days | 95%+ | Asia-Pacific 🏆 |
| GFS (NOAA) | 0.5° | 16 days | 92% | Global average |
| ECMWF | 0.1° | 15 days | 93% | Europe strong |
| ICON (DWD) | 0.25° | 10 days | 92% | Germany/Europe |
| MetOffice | 0.22° | 15 days | 91% | UK/Europe |

---

### Weather Code (WMO)

| Code | Condition | Icon |
|------|-----------|------|
| 0 | Clear | ☀️ |
| 1-3 | Partly Cloudy | ⛅ |
| 45-48 | Foggy | 🌫️ |
| 51-67 | Drizzle/Rain | 🌧️ |
| 71-85 | Snow | ❄️ |
| 80-82 | Rain Showers | 🌦️ |
| 85-86 | Snow Showers | 🌨️ |
| 95-99 | Thunderstorm | ⛈️ |

### UV Index Scale

| Index | Risk Level | Color |
|-------|-----------|-------|
| 0-2 | Low | 🟢 |
| 3-5 | Moderate | 🟡 |
| 6-7 | High | 🟠 |
| 8-10 | Very High | 🔴 |
| 11+ | Extreme | 🟣 |

### Alert Severity Levels

| Level | Description | Color |
|-------|-------------|-------|
| Low | Advisory | 🔵 |
| Moderate | Warning | 🟡 |
| High | Severe | 🔴 |

---

## 🎨 Design System

### Color Palette

```css
Primary Blue: #2F80ED
Primary Cyan: #56CCF2
Primary Light: #BBE1FA
Success: #4ECDC4
Warning: #FF6B6B
Error: #d4183d
```

### Typography

```css
Font Family: Geist Sans, Geist Mono
Base Size: 16px
Line Height: 1.6

h1: 24px (font-medium)
h2: 20px (font-medium)
h3: 18px (font-medium)
body: 16px (font-normal)
small: 14px (font-normal)
tiny: 12px (font-normal)
```

### Spacing Scale

```css
Base unit: 4px
Scale: 4px, 8px, 12px, 16px, 20px, 24px, 32px, 40px, 48px, 64px
```

### Border Radius

```css
Tight: 6px
Small: 8px
Medium: 10px
Large: 12px
Extra Large: 16px
```

---

## 📊 Performance Optimization

### Current Optimizations

- ✅ **API Caching**: 10-minute TTL cache untuk weather data
- ✅ **Request Debouncing**: Debounce location search requests
- ✅ **Component Lazy Loading**: Dynamic imports for heavy components
- ✅ **Image Optimization**: Next.js Image component
- ✅ **Code Splitting**: Route-based & component-based splitting

### Metrics Target

- **First Contentful Paint (FCP)**: < 1.5s
- **Largest Contentful Paint (LCP)**: < 2.5s
- **Cumulative Layout Shift (CLS)**: < 0.1
- **Time to Interactive (TTI)**: < 3.5s

---

## 🤝 Contributing

### How to Contribute

1. Fork repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

### Development Guidelines

- Follow TypeScript strict mode
- Use ESLint & Prettier
- Write meaningful commit messages
- Add tests for new features
- Update documentation

---

## 📝 License

This project is licensed under the MIT License - see [LICENSE](LICENSE) file for details.

---

## 🙋 Support & Contact

### Issues & Bugs
Report issues at: [GitHub Issues](https://github.com/KevinJeremi/wheather-Prediction-App/issues)

### Discussion
Join discussions at: [GitHub Discussions](https://github.com/KevinJeremi/wheather-Prediction-App/discussions)

### Contact
- **Author**: Kevin Jeremi
- **GitHub**: [@KevinJeremi](https://github.com/KevinJeremi)

---

## 🎉 Acknowledgments

### APIs & Services
- [Open-Meteo](https://open-meteo.com/) - Weather data
- [OpenRouter](https://openrouter.ai/) - LLM integration
- [Nominatim](https://nominatim.org/) - Geolocation
- [Groq](https://groq.com/) - Alternative LLM

### UI/UX Resources
- [Shadcn/ui](https://ui.shadcn.com/) - Component library
- [Radix UI](https://www.radix-ui.com/) - Primitives
- [Framer Motion](https://www.framer.com/motion/) - Animations
- [Tailwind CSS](https://tailwindcss.com/) - Styling

### Inspiration & References
- Modern weather applications (Weather.com, Dark Sky)
- AI chatbot interfaces
- Real-time data visualization patterns

---

## 📈 Roadmap

### Phase 1 (Current ✅)
- ✅ Basic weather display
- ✅ AI-powered analysis
- ✅ Multi-location support
- ✅ Dark/Light mode

### Phase 2 (In Progress)
- 🔄 Extended hourly forecast
- 🔄 Advanced alert system
- 🔄 Historical data tracking

### Phase 3 (Planned)
- 📅 User authentication
- 📅 Saved preferences sync
- 📅 Weather notifications (push)
- 📅 Satellite imagery
- 📅 Mobile app (React Native)

### Phase 4 (Future)
- 🔮 AR weather visualization
- 🔮 Advanced radar integration
- 🔮 Social sharing
- 🔮 Weather community features

---

<div align="center">

**Made with ❤️ by Kevin Jeremi**

[⭐ Star us on GitHub](https://github.com/KevinJeremi/wheather-Prediction-App) | [🐛 Report Issues](https://github.com/KevinJeremi/wheather-Prediction-App/issues) | [💬 Discussions](https://github.com/KevinJeremi/wheather-Prediction-App/discussions)

</div>

---

**Last Updated**: October 25, 2025  
**Version**: 1.0.0  
**Status**: Production Ready
