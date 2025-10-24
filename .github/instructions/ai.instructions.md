---
applyTo: '**'
---

# ClimaSense AI - Weather Application System Documentation

## 📋 Table of Contents
1. [Project Overview](#project-overview)
2. [System Architecture](#system-architecture)
3. [Flow System & Implementation](#flow-system--implementation)
4. [Component Structure](#component-structure)
5. [State Management](#state-management)
6. [Design System](#design-system)
7. [Animation Guidelines](#animation-guidelines)
8. [Code Standards](#code-standards)
9. [Implementation Rules](#implementation-rules)

---

## 🎯 Project Overview

**ClimaSense AI** adalah aplikasi weather forecasting berbasis AI dengan fokus pada:
- **Real-time Weather Data**: Menampilkan data cuaca terkini dengan visualisasi interaktif
- **AI-Powered Insights**: Analisis cuaca cerdas menggunakan AI reasoning
- **Predictive Analytics**: Chart prediksi suhu dan kondisi cuaca
- **Responsive Design**: Full responsive dari mobile hingga desktop
- **Dark/Light Mode**: Automatic theme switching berdasarkan waktu
- **Interactive Globe**: 3D globe interaktif menggunakan COBE library
- **Smart Alerts**: Notifikasi cerdas untuk perubahan cuaca

---

## 🏗️ System Architecture

### Technology Stack
```typescript
Framework: Next.js 16.0.0 (App Router)
React: 19.2.0
TypeScript: ^5
Styling: Tailwind CSS 4
Animation: Framer Motion (motion/react)
Charts: Recharts
3D Graphics: COBE (Globe visualization)
UI Components: shadcn/ui
```

### Project Structure
```
whealthy_people_project1/
├── src/
│   ├── app/
│   │   ├── layout.tsx          # Root layout dengan font configuration
│   │   ├── page.tsx            # Main entry point
│   │   └── globals.css         # Global styles & Tailwind
│   ├── components/             # Production components (to be created)
│   ├── lib/                    # Utilities & helpers
│   ├── hooks/                  # Custom React hooks
│   ├── types/                  # TypeScript type definitions
│   ├── services/               # API services & data fetching
│   └── utils/                  # Helper functions
├── panduan_ui_figma/           # Reference UI implementation
│   ├── App.tsx                 # Main app structure reference
│   ├── components/             # All component references
│   └── styles/                 # Design system reference
└── public/                     # Static assets
```

---

## 🔄 Flow System & Implementation

### 1. Application Flow

```
┌─────────────────────────────────────────────────────────────┐
│                     APPLICATION ENTRY POINT                  │
│                        (src/app/page.tsx)                    │
└─────────────────────────┬───────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│                      LAYOUT WRAPPER                          │
│  - Font Configuration (Geist Sans & Mono)                   │
│  - Dark Mode Provider (ThemeProvider)                        │
│  - Global Metadata Configuration                             │
└─────────────────────────┬───────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│                   MAIN APP COMPONENT                         │
│  State Management:                                           │
│  - activeView: 'home' | 'history' | 'alerts' | 'settings'  │
│  - isDark: boolean (auto-detect based on time)              │
│  - sidebarOpen: boolean                                      │
│  - isDesktop: boolean (responsive detection)                 │
│  - isLoading: boolean                                        │
└─────────────────────────┬───────────────────────────────────┘
                          │
                ┌─────────┴─────────┐
                │                   │
                ▼                   ▼
    ┌───────────────────┐  ┌──────────────────┐
    │  LOADING STATE    │  │   MAIN UI        │
    │  - LoadingCloud   │  │   - Background   │
    │  - 2s Duration    │  │   - Sidebar      │
    └───────────────────┘  │   - Content      │
                           │   - Navigation   │
                           └──────────────────┘
```

### 2. Component Hierarchy Flow

```
App (Main Container)
├── WeatherBackground
│   ├── EnhancedGlobeBackground (3D Globe + Animated Orbs)
│   └── Stars (Night mode only)
│
├── WeatherAnimations (Conditional based on weather)
│   ├── Rain (50 droplets)
│   ├── Snow (40 flakes)
│   ├── Clouds (5 animated clouds)
│   ├── Thunder (Lightning flashes)
│   └── Sunny (20 particles)
│
├── ClimaSidebar (AnimatedSidebar)
│   ├── Desktop: Auto expand/collapse on hover
│   ├── Mobile: Slide-in drawer
│   ├── Logo
│   ├── Navigation Links (Home, History, Alerts, Settings)
│   └── Dark Mode Toggle
│
├── Main Content (Dynamic based on activeView)
│   │
│   ├── HOME VIEW
│   │   ├── LocationCarousel (Horizontal scroll locations)
│   │   ├── SmartAlerts (Dismissible weather alerts)
│   │   ├── HeroSection (Main weather display)
│   │   │   ├── Location & Time
│   │   │   ├── Temperature (Count-up animation)
│   │   │   └── AI Summary Card
│   │   │
│   │   ├── TodaySummary
│   │   │   ├── AI Summary Text
│   │   │   ├── High/Low Temperature
│   │   │   └── Quick Stats Grid (Sunrise, Sunset, Humidity, Wind)
│   │   │
│   │   ├── Grid Layout (3 columns on desktop)
│   │   │   ├── WeatherStatsCards (2 columns)
│   │   │   │   ├── Feels Like (with sparkline)
│   │   │   │   ├── Humidity (with sparkline)
│   │   │   │   ├── Wind Speed (with sparkline)
│   │   │   │   └── Rain Probability (with sparkline)
│   │   │   │
│   │   │   └── EnvironmentalInsights (1 column)
│   │   │       ├── Air Quality
│   │   │       ├── UV Index
│   │   │       ├── Sunrise
│   │   │       └── Sunset
│   │   │
│   │   └── Chart & AI Row (2 columns)
│   │       ├── PredictionChart (Area chart with 3 time ranges)
│   │       └── AIReasoning (Chat interface)
│   │
│   ├── HISTORY VIEW (Placeholder: Coming Soon)
│   │
│   ├── ALERTS VIEW
│   │   ├── SmartAlerts (Expanded view)
│   │   └── No Warnings State (Empty state with emoji)
│   │
│   └── SETTINGS VIEW (Placeholder: Coming Soon)
│
├── BottomNav (Mobile only)
│   └── 4 Navigation buttons with active state
│
└── GlobeHint (First load only)
    └── Tooltip: "Drag to rotate the globe 🌍"
```

### 3. State Management Flow

```typescript
// App State Machine
type ViewState = 'home' | 'history' | 'alerts' | 'settings'

// Initial State Detection
useEffect(() => {
  // Auto Dark Mode based on time
  const hour = new Date().getHours()
  const shouldBeDark = hour < 6 || hour >= 20
  setIsDark(shouldBeDark)
  
  // Responsive detection
  const checkDesktop = () => setIsDesktop(window.innerWidth >= 768)
  checkDesktop()
  window.addEventListener('resize', checkDesktop)
  
  // Loading simulation
  setTimeout(() => setIsLoading(false), 2000)
}, [])

// View Transitions
activeView Change → Content Fade/Slide Animation → New View Rendered

// Sidebar Behavior
Desktop: 
  - onMouseEnter → Expand (280px)
  - onMouseLeave → Collapse (80px)
  - Content margin-left adapts automatically

Mobile:
  - Menu icon → Full-screen overlay
  - Close icon or overlay click → Dismiss
```

### 4. Data Flow

```
┌─────────────────────────────────────────────────────────────┐
│                    DATA SOURCES (Future)                     │
│  - Weather API (OpenWeatherMap / WeatherAPI)                │
│  - AI Service (GPT/Claude for reasoning)                    │
│  - Geolocation API                                           │
└─────────────────────────┬───────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│                   SERVICE LAYER                              │
│  services/                                                   │
│  ├── weatherService.ts   // Fetch weather data              │
│  ├── aiService.ts        // AI reasoning & summaries        │
│  ├── locationService.ts  // Geolocation handling            │
│  └── alertService.ts     // Weather alert management        │
└─────────────────────────┬───────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│                   STATE MANAGEMENT                           │
│  Currently: Local useState (Simple)                          │
│  Future: Context API or Zustand for complex state           │
│  ├── Weather State                                           │
│  ├── UI State (theme, view, sidebar)                        │
│  └── User Preferences                                        │
└─────────────────────────┬───────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│                   COMPONENTS                                 │
│  Props drilling → Data rendering → User interaction          │
└─────────────────────────────────────────────────────────────┘
```

---

## 📦 Component Structure

### Component Categories

#### 1. **Layout Components**
- `AnimatedSidebar`: Collapsible sidebar with smooth transitions
- `BottomNav`: Mobile bottom navigation bar
- `Header`: Top header with navigation (if needed)

#### 2. **Feature Components**
- `HeroSection`: Main weather display with temperature
- `WeatherStatsCards`: Grid of weather metrics with sparklines
- `PredictionChart`: Interactive temperature forecast chart
- `AIReasoning`: Chat interface for AI weather assistant
- `TodaySummary`: Comprehensive daily weather summary
- `EnvironmentalInsights`: Air quality, UV, sunrise/sunset
- `SmartAlerts`: Weather alerts and warnings
- `LocationCarousel`: Multi-location weather selection

#### 3. **Visual Components**
- `WeatherBackground`: Dynamic background based on weather
- `EnhancedGlobeBackground`: 3D globe with markers
- `WeatherAnimations`: Animated weather effects (rain, snow, etc.)
- `LoadingCloud`: Loading state animation
- `GlobeHint`: Tooltip for globe interaction

#### 4. **Utility Components**
- `Sparkline`: Mini line chart for trends
- `TypingIndicator`: AI typing animation
- `ImageWithFallback`: Image with error handling

#### 5. **UI Primitives** (shadcn/ui based)
- Located in `components/ui/`
- Pre-built accessible components
- Fully customizable with Tailwind

### Component Implementation Pattern

```typescript
// Standard Component Structure
'use client' // If uses hooks or interactivity

import { motion } from 'motion/react'
import { ComponentProps } from './types'

// Props Interface
interface ComponentNameProps {
  // Required props
  data: string
  // Optional props with defaults
  variant?: 'default' | 'compact'
  // Callbacks
  onAction?: () => void
}

// Component
export function ComponentName({ 
  data, 
  variant = 'default',
  onAction 
}: ComponentNameProps) {
  // State (if needed)
  const [state, setState] = useState<Type>(initialValue)
  
  // Effects (if needed)
  useEffect(() => {
    // Side effects
  }, [dependencies])
  
  // Handlers
  const handleClick = () => {
    // Logic
    onAction?.()
  }
  
  // Render
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="component-styles"
    >
      {/* Component content */}
    </motion.div>
  )
}

// Named export (preferred for tree-shaking)
export { ComponentName }
```

---

## 🎨 Design System

### Color Palette

```css
/* Primary Colors */
--primary-blue: #2F80ED      /* Main brand color */
--primary-cyan: #56CCF2      /* Accent blue */
--light-blue: #BBE1FA        /* Light accent */

/* Gradients */
--gradient-primary: linear-gradient(to right, #2F80ED, #56CCF2)
--gradient-card: linear-gradient(to bottom right, #2F80ED, #3D8FED, #56CCF2)

/* Light Mode */
--background: #ffffff
--surface: rgba(255, 255, 255, 0.6-0.8) /* Glass effect */
--text-primary: #030213
--text-secondary: #717182
--border: rgba(0, 0, 0, 0.1)

/* Dark Mode */
--background-dark: #0a0e1a
--surface-dark: rgba(31, 41, 55, 0.6-0.8)
--text-primary-dark: #ffffff
--text-secondary-dark: #9ca3af
--border-dark: rgba(255, 255, 255, 0.1)

/* Status Colors */
--success: #4ECDC4
--warning: #FF6B6B
--info: #56CCF2
--error: #d4183d
```

### Typography

```css
/* Font Families */
--font-sans: Geist Sans
--font-mono: Geist Mono
--font-size-base: 16px

/* Font Scale */
h1: text-2xl (24px) | font-medium | leading-relaxed
h2: text-xl (20px) | font-medium | leading-relaxed
h3: text-lg (18px) | font-medium | leading-relaxed
h4: text-base (16px) | font-medium | leading-relaxed
p: text-base (16px) | font-normal | leading-relaxed
small: text-sm (14px) | font-normal
tiny: text-xs (12px) | font-normal
```

### Spacing System

```typescript
// Padding & Margin Scale (Tailwind based)
0: 0px
1: 0.25rem (4px)
2: 0.5rem (8px)
3: 0.75rem (12px)
4: 1rem (16px)
5: 1.25rem (20px)
6: 1.5rem (24px)
8: 2rem (32px)
10: 2.5rem (40px)
12: 3rem (48px)
16: 4rem (64px)
20: 5rem (80px)

// Component Specific
Card Padding: p-4 md:p-5 lg:p-6 (16-24px responsive)
Section Spacing: space-y-4 (16px between items)
Grid Gap: gap-3 md:gap-4 (12-16px)
```

### Border Radius

```css
--radius: 0.625rem (10px) /* Base radius */
--radius-sm: calc(var(--radius) - 4px) /* 6px */
--radius-md: calc(var(--radius) - 2px) /* 8px */
--radius-lg: var(--radius) /* 10px */
--radius-xl: calc(var(--radius) + 4px) /* 14px */

/* Common Usage */
Small elements: rounded-xl (12px)
Cards: rounded-2xl (16px)
Large cards: rounded-3xl (24px)
Buttons: rounded-xl (12px)
Inputs: rounded-xl (12px)
```

### Glassmorphism Effect

```css
/* Standard Glass Card */
.glass-card {
  background: rgba(255, 255, 255, 0.6-0.8); /* Light mode */
  background: rgba(31, 41, 55, 0.6-0.8); /* Dark mode */
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 4px 25px rgba(0, 0, 0, 0.08);
}

/* Implementation in Tailwind */
className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-xl border border-white/20 dark:border-gray-700/20 shadow-xl"
```

### Shadows

```css
/* Shadow Scale */
--shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.05)
--shadow-md: 0 4px 6px rgba(0, 0, 0, 0.1)
--shadow-lg: 0 4px 25px rgba(0, 0, 0, 0.08)
--shadow-xl: 0 8px 32px rgba(0, 0, 0, 0.12)

/* Colored Shadows */
--shadow-blue: 0 8px 32px rgba(47, 128, 237, 0.3)
--shadow-blue-lg: 0 8px 32px rgba(47, 128, 237, 0.5)

/* Usage */
Cards: shadow-lg
Hover states: shadow-xl
Active buttons: shadow-blue-lg
```

---

## 🎭 Animation Guidelines

### Framer Motion Patterns

#### 1. **Page/Component Entry**
```typescript
<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.5, delay: 0.1 }}
>
```

#### 2. **Hover Interactions**
```typescript
<motion.div
  whileHover={{ scale: 1.03, y: -4 }}
  transition={{ type: 'spring', stiffness: 400 }}
>
```

#### 3. **Tap/Click Feedback**
```typescript
<motion.button
  whileTap={{ scale: 0.95 }}
>
```

#### 4. **Staggered Children**
```typescript
<motion.div
  initial={{ opacity: 0 }}
  animate={{ opacity: 1 }}
  transition={{ staggerChildren: 0.1 }}
>
  {items.map((item, i) => (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: i * 0.1 }}
    />
  ))}
</motion.div>
```

#### 5. **Continuous Animations**
```typescript
<motion.div
  animate={{
    scale: [1, 1.1, 1],
    rotate: [0, 5, -5, 0]
  }}
  transition={{
    duration: 3,
    repeat: Infinity,
    ease: 'easeInOut'
  }}
>
```

#### 6. **Exit Animations**
```typescript
<AnimatePresence mode="popLayout">
  {show && (
    <motion.div
      initial={{ opacity: 0, x: -100 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 100 }}
    />
  )}
</AnimatePresence>
```

### Animation Performance Rules
1. **Prefer transform & opacity**: Hardware accelerated
2. **Avoid animating**: width, height, left, top, margin
3. **Use will-change sparingly**: Only for complex animations
4. **Throttle scroll animations**: Use requestAnimationFrame
5. **Lazy load heavy animations**: Load on demand

### Animation Timing
```typescript
// Standard Timing Functions
ease: 'easeInOut'    // Default smooth
ease: 'easeOut'      // Quick start, slow end
ease: 'easeIn'       // Slow start, quick end
ease: 'linear'       // Constant speed

// Spring Physics (More natural)
type: 'spring'
stiffness: 400       // Bouncy (100-1000)
damping: 30          // Resistance (10-100)

// Duration Guidelines
Micro: 0.15s         // Hover feedback
Short: 0.3s          // Button clicks
Medium: 0.5s         // View transitions
Long: 1-2s           // Page loads
Continuous: Infinity // Background effects
```

---

## 💻 Code Standards

### File Naming Conventions
```
Components: PascalCase
├── HeroSection.tsx
├── WeatherStatsCards.tsx
└── AIReasoning.tsx

Utilities: camelCase
├── formatDate.ts
├── weatherUtils.ts
└── apiClient.ts

Types: PascalCase
├── Weather.types.ts
├── User.types.ts
└── API.types.ts

Hooks: camelCase with 'use' prefix
├── useWeather.ts
├── useGeolocation.ts
└── useTheme.ts
```

### Import Order
```typescript
// 1. External libraries
import { useState, useEffect } from 'react'
import { motion } from 'motion/react'

// 2. Internal components
import { WeatherCard } from '@/components/WeatherCard'
import { Button } from '@/components/ui/button'

// 3. Utilities & helpers
import { formatTemperature } from '@/utils/format'
import { cn } from '@/lib/utils'

// 4. Types
import type { WeatherData } from '@/types/weather'

// 5. Assets
import Logo from '@/public/logo.svg'
```

### TypeScript Standards

```typescript
// Use interface for object shapes
interface WeatherData {
  location: string
  temperature: number
  condition: WeatherCondition
}

// Use type for unions, intersections, utilities
type WeatherCondition = 'Sunny' | 'Cloudy' | 'Rainy' | 'Stormy'
type Optional<T> = T | null | undefined

// Always type function returns
function getWeather(location: string): Promise<WeatherData> {
  // Implementation
}

// Use const assertions for readonly data
const WEATHER_CONDITIONS = ['Sunny', 'Cloudy', 'Rainy'] as const

// Prefer type inference when obvious
const [count, setCount] = useState(0) // Good: Type inferred
const [count, setCount] = useState<number>(0) // Redundant

// Explicit typing when complex
const [data, setData] = useState<WeatherData | null>(null) // Good
```

### Component Props Pattern

```typescript
// Base props interface
interface BaseCardProps {
  className?: string
  children?: React.ReactNode
}

// Extended props
interface WeatherCardProps extends BaseCardProps {
  data: WeatherData
  onRefresh?: () => void
  variant?: 'default' | 'compact'
}

// With generics for reusable components
interface DataCardProps<T> extends BaseCardProps {
  data: T
  renderContent: (data: T) => React.ReactNode
}
```

### Error Handling

```typescript
// API Calls with try-catch
async function fetchWeather(location: string) {
  try {
    const response = await fetch(`/api/weather?location=${location}`)
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    
    const data = await response.json()
    return data
  } catch (error) {
    console.error('Failed to fetch weather:', error)
    // Return fallback or rethrow
    throw error
  }
}

// Component error boundaries
'use client'

export default function ErrorBoundary({ error }: { error: Error }) {
  return (
    <div className="error-container">
      <h2>Something went wrong!</h2>
      <p>{error.message}</p>
    </div>
  )
}
```

### Performance Best Practices

```typescript
// 1. Memoize expensive computations
const processedData = useMemo(() => {
  return expensiveOperation(rawData)
}, [rawData])

// 2. Memoize callbacks passed to children
const handleClick = useCallback(() => {
  performAction()
}, [dependencies])

// 3. Lazy load heavy components
const HeavyChart = dynamic(() => import('./HeavyChart'), {
  loading: () => <Skeleton />
})

// 4. Debounce rapid events
import { useDebouncedValue } from '@/hooks/useDebounce'
const debouncedSearch = useDebouncedValue(searchTerm, 300)

// 5. Virtual scrolling for long lists
import { VirtualList } from 'react-virtual'
```

---

## ⚡ Implementation Rules

### 1. Component Creation Rules

#### ✅ DO:
```typescript
// Use meaningful, descriptive names
export function WeatherForecastChart() { }

// Extract reusable logic to hooks
export function useWeatherData(location: string) {
  const [data, setData] = useState<WeatherData | null>(null)
  // Logic here
  return { data, isLoading, error, refetch }
}

// Keep components focused (Single Responsibility)
export function TemperatureDisplay({ temp }: { temp: number }) {
  return <span>{temp}°C</span>
}

// Use composition over props drilling
<WeatherProvider>
  <WeatherDashboard />
</WeatherProvider>
```

#### ❌ DON'T:
```typescript
// Avoid generic names
export function Component1() { }

// Don't mix concerns
export function WeatherAndUserProfile() { } // Too much

// Avoid deep prop drilling
<ComponentA data={data}>
  <ComponentB data={data}>
    <ComponentC data={data}> {/* Use context instead */}
```

### 2. Styling Rules

#### ✅ DO:
```typescript
// Use Tailwind utility classes
<div className="flex items-center gap-4 p-6 rounded-2xl bg-white/60 backdrop-blur-xl">

// Extract repeated patterns to components
<GlassCard>
  <CardHeader />
  <CardContent />
</GlassCard>

// Use cn() utility for conditional classes
<div className={cn(
  "base-classes",
  isActive && "active-classes",
  variant === 'compact' && "compact-classes"
)}>

// Responsive design mobile-first
<div className="p-4 md:p-6 lg:p-8">
```

#### ❌ DON'T:
```typescript
// Avoid inline styles (use Tailwind)
<div style={{ padding: '16px', backgroundColor: 'white' }}> ❌

// Don't use arbitrary values excessively
<div className="p-[13.5px]"> ❌  // Use standard spacing

// Avoid !important
<div className="!p-8"> ❌  // Refactor specificity instead
```

### 3. State Management Rules

#### ✅ DO:
```typescript
// Local state for component-specific data
const [isOpen, setIsOpen] = useState(false)

// Context for shared state
const { theme, setTheme } = useTheme()

// Derive state when possible (don't duplicate)
const fullName = `${firstName} ${lastName}` // ✅ Derived
const [fullName, setFullName] = useState('') // ❌ Duplicate state

// Use reducers for complex state logic
const [state, dispatch] = useReducer(weatherReducer, initialState)
```

#### ❌ DON'T:
```typescript
// Don't store derived data
const [items, setItems] = useState([])
const [itemCount, setItemCount] = useState(0) // ❌ Use items.length

// Avoid state for constants
const [API_URL, setAPIURL] = useState('...') // ❌ Use const

// Don't mutate state directly
state.items.push(newItem) // ❌
setState({ ...state, items: [...state.items, newItem] }) // ✅
```

### 4. API Integration Rules

```typescript
// Service layer pattern
// services/weatherService.ts
export class WeatherService {
  private baseURL = process.env.NEXT_PUBLIC_WEATHER_API_URL
  
  async getWeather(location: string): Promise<WeatherData> {
    const response = await fetch(`${this.baseURL}/weather?q=${location}`)
    
    if (!response.ok) {
      throw new WeatherAPIError('Failed to fetch weather')
    }
    
    return response.json()
  }
  
  async getForecast(location: string, days: number): Promise<ForecastData> {
    // Implementation
  }
}

// Usage in components
export function WeatherDashboard() {
  const { data, isLoading, error } = useWeatherData('Tokyo')
  
  if (isLoading) return <LoadingCloud />
  if (error) return <ErrorState error={error} />
  
  return <WeatherDisplay data={data} />
}
```

### 5. Accessibility Rules

#### ✅ DO:
```typescript
// Semantic HTML
<button onClick={handleClick}>Click me</button> ✅
<div onClick={handleClick}>Click me</div> ❌

// ARIA labels
<button aria-label="Close dialog" onClick={onClose}>
  <X />
</button>

// Keyboard navigation
<div 
  role="button" 
  tabIndex={0}
  onKeyDown={(e) => e.key === 'Enter' && onClick()}
>

// Focus management
const inputRef = useRef<HTMLInputElement>(null)
useEffect(() => {
  inputRef.current?.focus()
}, [])

// Alt text for images
<img src="weather.jpg" alt="Sunny weather with clear blue sky" />
```

### 6. Testing Considerations

```typescript
// Structure for testability
// ✅ Pure functions
export function formatTemperature(temp: number, unit: 'C' | 'F'): string {
  return unit === 'F' ? `${temp * 9/5 + 32}°F` : `${temp}°C`
}

// ✅ Separate logic from presentation
export function useWeatherLogic() {
  // Business logic
  return { processedData, handlers }
}

export function WeatherComponent() {
  const logic = useWeatherLogic()
  return <div>{/* Presentation */}</div>
}

// ✅ Test IDs for E2E tests
<button data-testid="refresh-weather" onClick={handleRefresh}>
```

### 7. Environment & Configuration

```typescript
// .env.local
NEXT_PUBLIC_WEATHER_API_KEY=your_api_key
NEXT_PUBLIC_AI_API_KEY=your_ai_key
DATABASE_URL=your_database_url

// config/index.ts
export const config = {
  api: {
    weather: process.env.NEXT_PUBLIC_WEATHER_API_KEY,
    ai: process.env.NEXT_PUBLIC_AI_API_KEY,
  },
  features: {
    enableAI: true,
    enableGeolocation: true,
  }
} as const

// Type-safe environment variables
declare global {
  namespace NodeJS {
    interface ProcessEnv {
      NEXT_PUBLIC_WEATHER_API_KEY: string
      DATABASE_URL: string
    }
  }
}
```

### 8. Code Organization

```
src/
├── app/                      # Next.js App Router
│   ├── (routes)/            # Route groups
│   │   ├── weather/
│   │   └── settings/
│   ├── api/                 # API routes
│   │   └── weather/
│   │       └── route.ts
│   ├── layout.tsx
│   └── page.tsx
│
├── components/              # React components
│   ├── layout/             # Layout components
│   │   ├── Sidebar.tsx
│   │   └── BottomNav.tsx
│   ├── weather/            # Feature components
│   │   ├── HeroSection.tsx
│   │   ├── WeatherCard.tsx
│   │   └── PredictionChart.tsx
│   └── ui/                 # UI primitives (shadcn)
│       ├── button.tsx
│       └── card.tsx
│
├── hooks/                   # Custom hooks
│   ├── useWeather.ts
│   ├── useGeolocation.ts
│   └── useTheme.ts
│
├── lib/                     # Utilities
│   ├── utils.ts            # General utilities
│   └── cn.ts               # Class name utility
│
├── services/                # API services
│   ├── weatherService.ts
│   └── aiService.ts
│
├── types/                   # TypeScript types
│   ├── weather.types.ts
│   └── api.types.ts
│
├── constants/               # Constants
│   └── weather.constants.ts
│
└── styles/                  # Global styles
    └── globals.css
```

---

## 🚀 Implementation Checklist

### Phase 1: Setup & Foundation
- [ ] Copy reference components from `panduan_ui_figma/` to `src/components/`
- [ ] Install required dependencies (framer-motion, recharts, cobe, etc.)
- [ ] Setup Tailwind CSS configuration with design tokens
- [ ] Create base layout structure in `src/app/layout.tsx`
- [ ] Setup dark mode provider (ThemeProvider)

### Phase 2: Core Components
- [ ] Implement `WeatherBackground` with globe
- [ ] Create `AnimatedSidebar` (desktop & mobile)
- [ ] Build `HeroSection` with temperature display
- [ ] Develop `WeatherStatsCards` with sparklines
- [ ] Create `PredictionChart` with responsive design

### Phase 3: Advanced Features
- [ ] Implement `AIReasoning` chat interface
- [ ] Build `SmartAlerts` system
- [ ] Create `LocationCarousel` with multi-location support
- [ ] Develop `WeatherAnimations` (rain, snow, clouds)
- [ ] Add `TodaySummary` and `EnvironmentalInsights`

### Phase 4: Interaction & Polish
- [ ] Implement responsive behavior (sidebar collapse, mobile nav)
- [ ] Add all animations and transitions
- [ ] Setup loading states and skeletons
- [ ] Implement error boundaries
- [ ] Add accessibility features (ARIA, keyboard nav)

### Phase 5: Integration
- [ ] Connect to Weather API
- [ ] Integrate AI service for summaries
- [ ] Implement geolocation
- [ ] Add data caching and persistence
- [ ] Setup analytics and monitoring

---

## 📝 Key Implementation Notes

1. **Responsive Design Priority**: Always implement mobile-first, then enhance for desktop
2. **Performance**: Use dynamic imports for heavy components (charts, globe)
3. **Accessibility**: All interactive elements must be keyboard accessible
4. **Type Safety**: No `any` types unless absolutely necessary
5. **Animation Budget**: Limit simultaneous animations to maintain 60fps
6. **Error Handling**: Always provide fallback UI for failed states
7. **Loading States**: Show skeleton/spinner during data fetching
8. **SEO**: Use proper meta tags and semantic HTML
9. **Code Splitting**: Route-based and component-based splitting
10. **Documentation**: Document complex logic and business rules

---

## 🎯 AI Assistant Guidelines

When generating code or making changes:

1. **Always follow the established patterns** in this document
2. **Use TypeScript strictly** - no implicit any
3. **Implement responsive design** - mobile-first approach
4. **Add proper animations** - use Framer Motion patterns
5. **Maintain consistency** - follow naming conventions
6. **Consider performance** - optimize re-renders
7. **Think accessibility** - ARIA labels, keyboard navigation
8. **Handle errors gracefully** - try-catch, error boundaries
9. **Write clean code** - readable, maintainable, well-commented
10. **Test mentally** - consider edge cases and error scenarios

### Response Format
When asked to implement features:
1. Analyze requirements thoroughly
2. Check existing patterns in `panduan_ui_figma/`
3. Follow the architecture defined here
4. Write production-ready code
5. Include TypeScript types
6. Add proper error handling
7. Consider responsive design
8. Add accessibility features
9. Optimize for performance
10. Document complex logic

---

**Last Updated**: January 2025  
**Version**: 1.0.0  
**Status**: Production Ready Reference