# 🌤️ ClimaSense AI - Next.js Implementation Guide

> Dashboard prediksi cuaca premium dengan AI reasoning, interactive 3D globe, dan glassmorphism design

## 📋 Table of Contents

1. [Project Overview](#project-overview)
2. [Tech Stack](#tech-stack)
3. [Project Structure](#project-structure)
4. [Installation & Setup](#installation--setup)
5. [Core Features](#core-features)
6. [Component Architecture](#component-architecture)
7. [Styling Guidelines](#styling-guidelines)
8. [Step-by-Step Implementation](#step-by-step-implementation)
9. [API Integration](#api-integration)
10. [Deployment](#deployment)

---

## 🎯 Project Overview

**ClimaSense AI** adalah dashboard prediksi cuaca modern yang menampilkan data cuaca dari Japan Meteorological Agency (JMA) dengan penjelasan AI dalam bahasa natural. Aplikasi ini menggabungkan estetika premium dari Apple Weather, interaktivitas ChatGPT, dan clean design Tesla interface.

### Key Highlights
- ✨ **3D Interactive Globe Background** dengan COBE WebGL
- 🎨 **Glassmorphism Design** dengan efek blur dan transparency
- 🤖 **AI-Powered Chat** untuk weather reasoning
- 📊 **Advanced Charts** dengan Recharts (12h/3d/7d toggle)
- 🌈 **Dynamic Weather Animations** (rain, snow, lightning)
- 🌓 **Auto Dark/Light Mode** berdasarkan waktu
- 📱 **Fully Responsive** dengan mobile-first approach
- ⚡ **Micro Animations** dengan Motion (Framer Motion)

---

## 🛠️ Tech Stack

### Core Framework
```json
{
  "framework": "Next.js 14+",
  "runtime": "App Router",
  "language": "TypeScript",
  "styling": "Tailwind CSS v4"
}
```

### Dependencies

#### Essential Packages
```bash
# Core
npm install next@latest react@latest react-dom@latest typescript

# Styling
npm install tailwindcss@next
npm install clsx tailwind-merge

# UI Components (shadcn/ui)
npx shadcn-ui@latest init

# 3D Globe
npm install cobe

# Animations
npm install motion

# Icons
npm install lucide-react

# Charts
npm install recharts

# Forms
npm install react-hook-form@7.55.0 zod @hookform/resolvers

# Toast Notifications
npm install sonner@2.0.3

# Carousel
npm install embla-carousel-react

# Date Handling
npm install date-fns
```

#### Dev Dependencies
```bash
npm install -D @types/node @types/react @types/react-dom
npm install -D autoprefixer postcss
```

---

## 📁 Project Structure

```
climasense-ai/
├── app/
│   ├── layout.tsx              # Root layout with providers
│   ├── page.tsx                # Main dashboard page
│   ├── globals.css             # Global styles & Tailwind
│   └── api/
│       └── weather/
│           └── route.ts        # Weather API endpoint
├── components/
│   ├── layout/
│   │   ├── Header.tsx          # Top navigation with glass effect
│   │   ├── AnimatedSidebar.tsx # Desktop sidebar navigation
│   │   └── BottomNav.tsx       # Mobile bottom navigation
│   ├── weather/
│   │   ├── HeroSection.tsx     # Main weather display
│   │   ├── WeatherStatsCards.tsx  # Stats grid
│   │   ├── PredictionChart.tsx    # Interactive charts
│   │   ├── TodaySummary.tsx      # Daily summary card
│   │   ├── LocationCarousel.tsx   # Multi-location carousel
│   │   ├── SmartAlerts.tsx       # Weather notifications
│   │   └── WeatherAnimations.tsx # Rain/snow/lightning effects
│   ├── ai/
│   │   ├── AIReasoning.tsx     # AI chat interface
│   │   └── TypingIndicator.tsx # Chat typing animation
│   ├── background/
│   │   ├── WeatherBackground.tsx        # Main background controller
│   │   ├── EnhancedGlobeBackground.tsx  # 3D Globe component
│   │   └── GlobeHint.tsx               # Interaction hint tooltip
│   ├── insights/
│   │   ├── EnvironmentalInsights.tsx  # Environmental data
│   │   ├── RecentLocations.tsx        # Location history
│   │   └── Sparkline.tsx              # Mini trend charts
│   ├── loading/
│   │   └── LoadingCloud.tsx    # Cloud loading animation
│   └── ui/
│       ├── globe.tsx           # COBE Globe wrapper
│       ├── button.tsx          # shadcn components
│       ├── card.tsx
│       ├── dialog.tsx
│       ├── tabs.tsx
│       ├── tooltip.tsx
│       ├── badge.tsx
│       ├── progress.tsx
│       ├── switch.tsx
│       ├── scroll-area.tsx
│       └── utils.ts            # cn() utility
├── lib/
│   ├── utils.ts                # Helper functions
│   ├── weather-api.ts          # Weather API client
│   └── constants.ts            # App constants
├── types/
│   └── weather.ts              # TypeScript interfaces
└── public/
    └── icons/                  # Weather icons
```

---

## 🚀 Installation & Setup

### Step 1: Create Next.js Project

```bash
npx create-next-app@latest climasense-ai --typescript --tailwind --app
cd climasense-ai
```

### Step 2: Configure Tailwind CSS v4

Update `app/globals.css`:

```css
@import "tailwindcss";

@theme {
  /* Colors */
  --color-primary: #2F80ED;
  --color-primary-light: #56CCF2;
  --color-primary-lighter: #BBE1FA;
  --color-background: #F4F7FB;
  
  /* Spacing */
  --radius-card: 20px;
  --radius-button: 12px;
  
  /* Shadows */
  --shadow-glass: 0 8px 32px rgba(31, 38, 135, 0.15);
  --shadow-neumorphic: 20px 20px 60px #d1d9e6, -20px -20px 60px #ffffff;
}

/* Typography - DO NOT override with Tailwind classes */
body {
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
}

h1 { 
  font-size: 3rem; 
  font-weight: 700; 
  line-height: 1.2; 
}

h2 { 
  font-size: 2rem; 
  font-weight: 600; 
  line-height: 1.3; 
}

h3 { 
  font-size: 1.5rem; 
  font-weight: 600; 
  line-height: 1.4; 
}

p { 
  font-size: 1rem; 
  line-height: 1.6; 
}

/* Glassmorphism utility */
.glass {
  background: rgba(255, 255, 255, 0.25);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.18);
}

.glass-dark {
  background: rgba(15, 23, 42, 0.6);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

/* Neumorphic utility */
.neumorphic {
  background: #f0f0f3;
  box-shadow: 20px 20px 60px #d1d9e6, -20px -20px 60px #ffffff;
}

.neumorphic-dark {
  background: #1e293b;
  box-shadow: 20px 20px 60px #0f172a, -20px -20px 60px #2d3e57;
}

/* Custom scrollbar */
::-webkit-scrollbar {
  width: 8px;
}

::-webkit-scrollbar-track {
  background: rgba(0, 0, 0, 0.05);
}

::-webkit-scrollbar-thumb {
  background: rgba(47, 128, 237, 0.3);
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: rgba(47, 128, 237, 0.5);
}
```

### Step 3: Install shadcn/ui Components

```bash
npx shadcn-ui@latest init

# Install required components
npx shadcn-ui@latest add button
npx shadcn-ui@latest add card
npx shadcn-ui@latest add dialog
npx shadcn-ui@latest add tabs
npx shadcn-ui@latest add tooltip
npx shadcn-ui@latest add badge
npx shadcn-ui@latest add progress
npx shadcn-ui@latest add switch
npx shadcn-ui@latest add scroll-area
npx shadcn-ui@latest add avatar
npx shadcn-ui@latest add input
npx shadcn-ui@latest add textarea
```

### Step 4: Setup TypeScript Types

Create `types/weather.ts`:

```typescript
export interface WeatherData {
  location: string;
  temperature: number;
  condition: string;
  humidity: number;
  windSpeed: number;
  precipitation: number;
  uvIndex: number;
  visibility: number;
  pressure: number;
  feelsLike: number;
  dewPoint: number;
  timestamp: Date;
}

export interface ForecastData {
  time: string;
  temperature: number;
  condition: string;
  precipitation: number;
}

export interface DailySummary {
  date: string;
  high: number;
  low: number;
  condition: string;
  precipitation: number;
  summary: string;
}

export interface AIResponse {
  message: string;
  reasoning: string;
  confidence: number;
}

export interface WeatherAlert {
  id: string;
  type: 'warning' | 'watch' | 'info';
  title: string;
  message: string;
  timestamp: Date;
  severity: 'low' | 'medium' | 'high';
}
```

---

## ✨ Core Features

### 1. **3D Interactive Globe Background** 🌍

```tsx
// components/ui/globe.tsx
import createGlobe, { COBEOptions } from "cobe"
import { useCallback, useEffect, useRef, useState } from "react"
import { cn } from "./utils"

export function Globe({ className, config }: { 
  className?: string
  config?: COBEOptions 
}) {
  // Implementation dengan COBE library
  // - Auto-rotate animation
  // - Drag interaction
  // - Responsive sizing
  // - Theme-aware colors
}
```

**Features:**
- Auto-rotating 3D globe
- Drag to rotate with mouse/touch
- Weather station markers (Tokyo, Osaka, dll)
- Light/Dark mode adaptation
- Smooth WebGL rendering

### 2. **Dynamic Weather Animations** 🌧️⚡❄️

```tsx
// components/weather/WeatherAnimations.tsx
export function WeatherAnimations({ condition }: { condition: string }) {
  // Rain animation: 50 falling drops
  // Snow animation: 30 snowflakes with rotation
  // Lightning: Random flash effects
  // Clouds: Floating cloud shapes
}
```

### 3. **AI Chat Reasoning** 🤖

```tsx
// components/ai/AIReasoning.tsx
export function AIReasoning() {
  // Chat interface with typing indicator
  // Context-aware responses
  // Weather analysis & recommendations
  // Natural language processing
}
```

### 4. **Smart Charts** 📊

```tsx
// components/weather/PredictionChart.tsx
export function PredictionChart() {
  // Recharts integration
  // Toggle: 12h / 3d / 7d
  // Interactive tooltips
  // Gradient fills
  // Responsive design
}
```

### 5. **Auto Theme Detection** 🌓

```tsx
// Auto switch based on time
const hour = new Date().getHours()
const isDark = hour < 6 || hour >= 20

useEffect(() => {
  document.documentElement.classList.toggle('dark', isDark)
}, [isDark])
```

### 6. **Multi-Location Carousel** 📍

```tsx
// components/weather/LocationCarousel.tsx
// Embla Carousel integration
// Swipe gestures
// Auto-advance
// Location favorites
```

### 7. **Smart Alerts System** 🔔

```tsx
// components/weather/SmartAlerts.tsx
// Real-time notifications
// Priority-based sorting
// Dismissible alerts
// Weather warnings
```

### 8. **Loading States** ☁️

```tsx
// components/loading/LoadingCloud.tsx
// Animated cloud with Motion
// Shimmer effect
// Smooth transitions
```

---

## 🏗️ Component Architecture

### Layout Components

#### Header
```tsx
// components/layout/Header.tsx
export function Header({ isDark, toggleTheme }) {
  return (
    <header className="glass dark:glass-dark sticky top-0 z-50">
      {/* Logo, Search, Theme Toggle, Profile */}
    </header>
  )
}
```

#### Sidebar (Desktop)
```tsx
// components/layout/AnimatedSidebar.tsx
export function ClimaSidebar({ activeView, setActiveView }) {
  // Navigation items
  // Smooth transitions
  // Active state indicators
}
```

#### Bottom Navigation (Mobile)
```tsx
// components/layout/BottomNav.tsx
export function BottomNav({ activeView, setActiveView }) {
  // Mobile navigation
  // Icon-based menu
  // Active state
}
```

### Weather Components

#### Hero Section
```tsx
// components/weather/HeroSection.tsx
export function HeroSection({ weatherData }) {
  return (
    <section className="glass dark:glass-dark rounded-[20px] p-8">
      {/* Large temperature display */}
      {/* Weather icon */}
      {/* AI summary */}
      {/* Feels like, high/low */}
    </section>
  )
}
```

#### Stats Cards
```tsx
// components/weather/WeatherStatsCards.tsx
export function WeatherStatsCards({ weatherData }) {
  const stats = [
    { label: 'Humidity', value: '65%', icon: Droplets },
    { label: 'Wind Speed', value: '12 km/h', icon: Wind },
    // ... more stats
  ]
  
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {stats.map(stat => (
        <StatCard key={stat.label} {...stat} />
      ))}
    </div>
  )
}
```

#### Prediction Chart
```tsx
// components/weather/PredictionChart.tsx
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'

export function PredictionChart({ data, range }) {
  const [activeRange, setActiveRange] = useState('12h')
  
  return (
    <div className="glass dark:glass-dark rounded-[20px] p-6">
      {/* Range toggle buttons */}
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={filteredData}>
          {/* Chart configuration */}
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
```

### Background Components

#### Weather Background Controller
```tsx
// components/background/WeatherBackground.tsx
export function WeatherBackground({ condition, isDark }) {
  return (
    <>
      {/* Base color layer */}
      {/* Globe background */}
      {/* Stars (night mode) */}
      {/* Weather animations */}
    </>
  )
}
```

#### Enhanced Globe Background
```tsx
// components/background/EnhancedGlobeBackground.tsx
export function EnhancedGlobeBackground({ isDark }) {
  return (
    <div className="fixed inset-0 -z-10">
      {/* Animated gradient orbs */}
      {/* Interactive globe */}
      {/* Gradient overlay */}
      {/* Grid pattern */}
    </div>
  )
}
```

---

## 🎨 Styling Guidelines

### Design System

#### Colors
```css
/* Primary Palette */
--primary: #2F80ED          /* Main blue */
--primary-light: #56CCF2    /* Cyan accent */
--primary-lighter: #BBE1FA  /* Light blue */
--background: #F4F7FB       /* Off-white */

/* Dark Mode */
--dark-bg: #0a0e1a
--dark-surface: #1e293b
--dark-border: rgba(255, 255, 255, 0.1)
```

#### Spacing
```css
--spacing-xs: 0.5rem    /* 8px */
--spacing-sm: 1rem      /* 16px */
--spacing-md: 1.5rem    /* 24px */
--spacing-lg: 2rem      /* 32px */
--spacing-xl: 3rem      /* 48px */
```

#### Border Radius
```css
--radius-sm: 12px
--radius-md: 16px
--radius-lg: 20px
--radius-xl: 24px
```

#### Shadows
```css
/* Glass Effect */
box-shadow: 0 8px 32px rgba(31, 38, 135, 0.15);

/* Neumorphic */
box-shadow: 
  20px 20px 60px #d1d9e6, 
  -20px -20px 60px #ffffff;

/* Elevation */
box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
```

### Animation Patterns

```tsx
// Fade in
<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.5 }}
>

// Stagger children
<motion.div
  variants={{
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  }}
>

// Hover scale
<motion.button
  whileHover={{ scale: 1.05 }}
  whileTap={{ scale: 0.95 }}
>
```

### Responsive Breakpoints

```css
/* Mobile First */
sm: 640px   /* Small tablets */
md: 768px   /* Tablets */
lg: 1024px  /* Laptops */
xl: 1280px  /* Desktops */
2xl: 1536px /* Large screens */
```

---

## 📝 Step-by-Step Implementation

### Phase 1: Project Setup (Day 1)

1. **Initialize Next.js**
```bash
npx create-next-app@latest climasense-ai
cd climasense-ai
```

2. **Install Core Dependencies**
```bash
npm install cobe motion lucide-react recharts
npm install react-hook-form@7.55.0 zod
npm install sonner@2.0.3
```

3. **Setup Tailwind & Globals CSS**
   - Configure `globals.css` dengan design tokens
   - Setup custom utilities (glass, neumorphic)

4. **Install shadcn/ui**
```bash
npx shadcn-ui@latest init
npx shadcn-ui@latest add button card dialog tabs
```

### Phase 2: Layout & Navigation (Day 2)

1. **Create Layout Structure**
   - `app/layout.tsx` - Root layout with providers
   - `app/page.tsx` - Main dashboard page

2. **Build Navigation Components**
   - Header with glassmorphism
   - Desktop sidebar
   - Mobile bottom nav
   - Theme toggle

3. **Setup Routing**
   - Dashboard (/)
   - Locations (/locations)
   - Insights (/insights)
   - Settings (/settings)

### Phase 3: Background & Theme (Day 3)

1. **Implement Globe Component**
   - `components/ui/globe.tsx`
   - COBE integration
   - Interaction handlers

2. **Build Background System**
   - `EnhancedGlobeBackground.tsx`
   - Animated gradient orbs
   - Grid pattern overlay

3. **Create Theme System**
   - Auto dark/light mode
   - Time-based switching
   - Manual override

### Phase 4: Weather Display (Day 4-5)

1. **Hero Section**
   - Large temperature display
   - Weather condition
   - AI summary

2. **Stats Cards Grid**
   - Humidity, wind, UV, etc.
   - Icon integration
   - Sparkline charts

3. **Prediction Chart**
   - Recharts setup
   - Toggle range (12h/3d/7d)
   - Custom tooltips

4. **Today Summary Card**
   - Hourly breakdown
   - Morning/afternoon/evening

### Phase 5: AI Features (Day 6)

1. **AI Chat Interface**
   - Message input
   - Chat history
   - Typing indicator

2. **AI Reasoning Engine**
   - Context-aware responses
   - Weather analysis
   - Recommendations

3. **Smart Suggestions**
   - Activity recommendations
   - Clothing suggestions
   - Travel advice

### Phase 6: Advanced Features (Day 7-8)

1. **Weather Animations**
   - Rain effect
   - Snow particles
   - Lightning flashes

2. **Location Carousel**
   - Embla carousel
   - Favorite locations
   - Quick switching

3. **Smart Alerts**
   - Weather warnings
   - Notification system
   - Priority sorting

4. **Environmental Insights**
   - Air quality
   - Pollen count
   - UV forecast

### Phase 7: Polish & Optimization (Day 9-10)

1. **Loading States**
   - Cloud animation
   - Skeleton screens
   - Smooth transitions

2. **Micro Animations**
   - Hover effects
   - Page transitions
   - Element reveals

3. **Performance**
   - Code splitting
   - Lazy loading
   - Image optimization

4. **Accessibility**
   - Keyboard navigation
   - Screen reader support
   - ARIA labels

---

## 🔌 API Integration

### Weather API Setup

```typescript
// lib/weather-api.ts
const JMA_API_BASE = 'https://www.jma.go.jp/bosai/forecast/data'

export async function getWeatherData(areaCode: string) {
  const response = await fetch(`${JMA_API_BASE}/forecast/${areaCode}.json`)
  const data = await response.json()
  
  return {
    location: data[0].publishingOffice,
    temperature: parseTemperature(data),
    condition: parseCondition(data),
    // ... parse other fields
  }
}

export async function getForecast(areaCode: string, range: '12h' | '3d' | '7d') {
  // Fetch forecast data based on range
}
```

### API Routes (Next.js)

```typescript
// app/api/weather/route.ts
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const location = searchParams.get('location') || '130000' // Tokyo
  
  try {
    const weatherData = await getWeatherData(location)
    return Response.json(weatherData)
  } catch (error) {
    return Response.json({ error: 'Failed to fetch weather' }, { status: 500 })
  }
}
```

### Client-Side Data Fetching

```typescript
// hooks/useWeather.ts
import useSWR from 'swr'

export function useWeather(location: string) {
  const { data, error, isLoading } = useSWR(
    `/api/weather?location=${location}`,
    fetcher,
    { refreshInterval: 600000 } // Refresh every 10 minutes
  )
  
  return { weather: data, error, isLoading }
}
```

---

## 🚀 Deployment

### Vercel Deployment

1. **Push to GitHub**
```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin <your-repo-url>
git push -u origin main
```

2. **Deploy to Vercel**
```bash
npm install -g vercel
vercel
```

3. **Environment Variables**
```env
NEXT_PUBLIC_WEATHER_API_KEY=your_api_key
NEXT_PUBLIC_AI_API_KEY=your_ai_key
```

### Build Optimization

```javascript
// next.config.js
module.exports = {
  images: {
    domains: ['your-image-cdn.com'],
    formats: ['image/avif', 'image/webp'],
  },
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
}
```

---

## 📊 Performance Checklist

- [ ] Image optimization (Next.js Image)
- [ ] Code splitting (dynamic imports)
- [ ] Lazy loading components
- [ ] Minimize bundle size
- [ ] Enable gzip compression
- [ ] Implement service worker
- [ ] Add loading skeletons
- [ ] Optimize animations (GPU acceleration)
- [ ] Debounce API calls
- [ ] Cache API responses

---

## 🎯 Feature Checklist

### Core Features
- [x] 3D Interactive Globe background
- [x] Glassmorphism UI design
- [x] Auto dark/light mode
- [x] Responsive layout
- [x] Weather data display
- [x] Prediction charts
- [x] AI chat reasoning

### Premium Features
- [x] Dynamic weather animations
- [x] Multi-location carousel
- [x] Smart alerts system
- [x] Environmental insights
- [x] Loading animations
- [x] Micro interactions
- [x] Daily summary cards
- [x] Sparkline charts

### UX Enhancements
- [x] Smooth page transitions
- [x] Hover effects
- [x] Touch gestures
- [x] Keyboard shortcuts
- [x] Screen reader support
- [x] Error boundaries
- [x] Offline support
- [x] Progressive Web App

---

## 🔧 Troubleshooting

### Common Issues

**1. Globe not rendering**
```bash
# Ensure COBE is installed
npm install cobe

# Check WebGL support
console.log(!!window.WebGLRenderingContext)
```

**2. Animations laggy**
```tsx
// Use transform instead of top/left
// Enable GPU acceleration
style={{ transform: 'translateZ(0)' }}
```

**3. Build errors**
```bash
# Clear cache
rm -rf .next
npm run build
```

---

## 📚 Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Tailwind CSS](https://tailwindcss.com)
- [shadcn/ui](https://ui.shadcn.com)
- [COBE Globe](https://github.com/shuding/cobe)
- [Motion (Framer Motion)](https://motion.dev)
- [Recharts](https://recharts.org)

---

## 📄 License

MIT License - feel free to use this guide for your projects!

---

## 👨‍💻 Author

Created with ❤️ for developers building modern weather applications

**Happy Coding! 🚀**
