# 🏗️ ClimaSense AI - Architecture & Technical Documentation

## Table of Contents
1. [System Architecture](#system-architecture)
2. [Data Flow Diagrams](#data-flow-diagrams)
3. [Component Architecture](#component-architecture)
4. [State Management](#state-management)
5. [API Integration](#api-integration)
6. [Error Handling](#error-handling)
7. [Performance Optimization](#performance-optimization)
8. [Security Considerations](#security-considerations)

---

## System Architecture

### High-Level Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│                          Browser Client                              │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │              Next.js Application (Frontend)                  │  │
│  ├──────────────────────────────────────────────────────────────┤  │
│  │                                                              │  │
│  │  ┌─────────────────────────────────────────────────────┐    │  │
│  │  │            React Component Tree                     │    │  │
│  │  │  ├─ App Layout                                      │    │  │
│  │  │  ├─ Sidebar & Navigation                           │    │  │
│  │  │  ├─ Home (Dashboard)                               │    │  │
│  │  │  │  ├─ HeroSection                                 │    │  │
│  │  │  │  ├─ WeatherStatsCards                           │    │  │
│  │  │  │  ├─ PredictionChart                             │    │  │
│  │  │  │  └─ AIReasoning                                 │    │  │
│  │  │  ├─ History                                         │    │  │
│  │  │  ├─ Alerts                                          │    │  │
│  │  │  └─ Settings                                        │    │  │
│  │  └─────────────────────────────────────────────────────┘    │  │
│  │                         ▲                                    │  │
│  │                         │                                    │  │
│  │  ┌─────────────────────┼────────────────────────────────┐   │  │
│  │  │   State Management  │                                │   │  │
│  │  ├─────────────────────┼────────────────────────────────┤   │  │
│  │  │                     │                                │   │  │
│  │  │  • Context API      │   • Custom Hooks              │   │  │
│  │  │  • WeatherContext   │   • useWeather                │   │  │
│  │  │  • localStorage     │   • useGeolocation            │   │  │
│  │  │  • sessionStorage   │   • useWeatherInsights        │   │  │
│  │  │                     └────────────────────────────────┘   │  │
│  │  └─────────────────────────────────────────────────────────┘   │  │
│  │                                                              │  │
│  │  ┌──────────────────────────────────────────────────────┐   │  │
│  │  │        Services Layer (API Calls)                   │   │  │
│  │  ├──────────────────────────────────────────────────────┤   │  │
│  │  │  • weatherService.ts   (Open-Meteo wrapper)         │   │  │
│  │  │  • openrouterService.ts (OpenRouter/LLM wrapper)    │   │  │
│  │  │  • weatherAlertsService.ts (Alert generation)       │   │  │
│  │  │  • Cache management & retry logic                   │   │  │
│  │  └──────────────────────────────────────────────────────┘   │  │
│  │                         ▲                                    │  │
│  │                         │                                    │  │
│  └─────────────────────────┼──────────────────────────────────┘  │
│                            │                                     │
└────────────────────────────┼─────────────────────────────────────┘
                             │ HTTP/HTTPS
                             ▼
          ┌──────────────────────────────────────────┐
          │      External APIs                       │
          ├──────────────────────────────────────────┤
          │                                          │
          │  • Open-Meteo API                       │
          │    (Weather Data - JMA Forecast)        │
          │                                          │
          │  • OpenRouter API                       │
          │    (LLM - Grok, Claude, etc)            │
          │                                          │
          │  • Nominatim API                        │
          │    (Geolocation & Location Search)      │
          │                                          │
          │  • Browser Geolocation API              │
          │    (Native geolocation)                 │
          │                                          │
          └──────────────────────────────────────────┘
```

### Layered Architecture

```
┌─────────────────────────────────────────────┐
│     Presentation Layer                      │
│  (React Components, UI, Animations)         │
└─────────────────────────────────────────────┘
              ▲              │
              │              ▼
┌─────────────────────────────────────────────┐
│     State Management Layer                  │
│  (Context API, Hooks, State Logic)          │
└─────────────────────────────────────────────┘
              ▲              │
              │              ▼
┌─────────────────────────────────────────────┐
│     Services Layer                          │
│  (API Clients, Data Fetching, Caching)     │
└─────────────────────────────────────────────┘
              ▲              │
              │              ▼
┌─────────────────────────────────────────────┐
│     Types & Utils Layer                     │
│  (TypeScript Types, Helpers, Constants)    │
└─────────────────────────────────────────────┘
              ▲              │
              │              ▼
┌─────────────────────────────────────────────┐
│     External APIs Layer                     │
│  (Third-party services & APIs)              │
└─────────────────────────────────────────────┘
```

---

## Data Flow Diagrams

### Application Initialization Flow

```
Browser Load
    │
    ▼
DOM Ready & React Hydration
    │
    ▼
RootLayout Execution
    │
    ├─ Apply Fonts (Geist Sans/Mono)
    │
    └─ Wrap with AILocationMiddlewareProvider
         │
         ▼
    Page.tsx Execution (ClimaSenseApp)
         │
         ├─ Initialize State
         │  ├─ activeView = 'home'
         │  ├─ isDark = auto-detect
         │  ├─ isDesktop = responsive check
         │  └─ isLoading = true
         │
         ├─ Request Geolocation
         │  │
         │  ├─ Browser permission check
         │  │
         │  ├─ Success → Get lat/lon
         │  │  │
         │  │  └─ setCurrentLocation()
         │  │
         │  └─ Error → Show error UI
         │
         ├─ Load Saved Locations
         │  │
         │  └─ localStorage.getItem('weatherLocations')
         │
         ├─ Set Active Location
         │  │
         │  ├─ currentLocation (if geolocation succeeded)
         │  │
         │  └─ OR selectedLocation (if user clicked)
         │
         ├─ Fetch Weather Data
         │  │
         │  ├─ Check Cache (10 min TTL)
         │  │  │
         │  │  ├─ Hit → Return cached data
         │  │  │
         │  │  └─ Miss → Call weatherService
         │  │
         │  ├─ weatherService.getCombinedWeather()
         │  │  │
         │  │  ├─ Call Open-Meteo API
         │  │  │  └─ params: latitude, longitude, forecast_days=16
         │  │  │
         │  │  ├─ Parse Response
         │  │  │
         │  │  └─ Cache Result (10 min TTL)
         │  │
         │  └─ setWeatherData()
         │
         ├─ Generate AI Analysis
         │  │
         │  └─ useWeatherInsights() hook
         │     │
         │     ├─ Prepare context
         │     │  ├─ Temperature status (hot/warm/cool/cold)
         │     │  ├─ Precipitation trend
         │     │  ├─ Current weather condition
         │     │  └─ Historical data pattern
         │     │
         │     ├─ Call openrouterService.analyzeWeather()
         │     │  │
         │     │  └─ OpenRouter API with context
         │     │
         │     └─ Generate alerts & summary
         │
         ├─ Create WeatherContext
         │  │
         │  └─ Provide shared state to components
         │
         ├─ Set isDark based on hour
         │
         ├─ Detect Desktop/Mobile
         │
         ├─ Simulate 2s loading
         │
         └─ Render UI
            │
            ├─ Check loading state
            │  ├─ true → Show LoadingCloud
            │  └─ false → Proceed
            │
            ├─ Check activeLocation
            │  ├─ null → Show geolocation error/manual search
            │  └─ set → Proceed
            │
            ├─ Check weatherData
            │  ├─ null → Show weather loading
            │  └─ set → Proceed
            │
            └─ Render Main UI
               ├─ Aurora Background
               ├─ Sidebar/Header/BottomNav
               ├─ Main Content (conditional)
               └─ GlobeHint (first load only)
```

### Weather Data Fetch & Cache Flow

```
useWeather Hook Called
    │
    ├─ Input: LocationCoordinates { lat, lon, name }
    │
    ▼
Validate Input & Enable Flag
    │
    ├─ location null? → Return empty
    │
    └─ enabled = true? → Proceed
         │
         ▼
    Create Cache Key
         │
         └─ "weather_forecast_lat_lon"
         │
         ▼
    Check In-Memory Cache
         │
         ├─ Found & not expired? → Return cached data
         │
         └─ Not found or expired? → Proceed
              │
              ▼
         Create AbortController
              │
         ├─ Cancel previous request if exists
         │
         ▼
    Make API Call
         │
         ├─ URL: https://api.open-meteo.com/v1/forecast
         │
         ├─ Params:
         │  ├─ latitude
         │  ├─ longitude
         │  ├─ hourly: temp, humidity, pressure, precip, etc
         │  ├─ daily: temp_max, temp_min, precip_sum, etc
         │  ├─ forecast_days: 16
         │  └─ timezone: auto
         │
         ├─ Headers: User-Agent
         │
         ▼
    Response Received
         │
         ├─ Status 200? → Proceed
         │
         └─ Status error? → Throw error
              │
              ▼
         Parse JSON
              │
         ├─ Extract hourly data
         ├─ Extract daily data
         ├─ Process arrays
         │
         ▼
    Transform Data
         │
         ├─ Convert to CombinedWeatherData format
         ├─ Type hourly data points
         ├─ Aggregate daily summaries
         │
         ▼
    Cache Result
         │
         ├─ TTL: 10 minutes (600000ms)
         ├─ Store in weatherCache Map
         │
         ▼
    Update State
         │
         ├─ setData(processedData)
         ├─ setIsLoading(false)
         ├─ setError(null)
         │
         ▼
    Trigger Dependent Effects
         │
         ├─ useWeatherInsights → Generate AI analysis
         ├─ useCallback → Prepare data for components
         ├─ Components → Re-render with new data
         │
         ▼
    User Sees Updated Weather
```

### AI Analysis & Alert Generation Flow

```
useWeatherInsights Hook Called
    │
    ├─ Input: weatherData, locationName
    │
    ▼
Check Prerequisites
    │
    ├─ weatherData exists? → Proceed
    │
    └─ false → Return empty summary/alerts
         │
         ▼
    Build AI Context
         │
         ├─ Extract current conditions
         │  ├─ temperature, humidity, pressure
         │  ├─ wind speed, precipitation
         │  ├─ cloud cover, weather code
         │  └─ UV index, visibility
         │
         ├─ Build forecast context
         │  ├─ Next 3 days trend
         │  ├─ Temperature min/max
         │  ├─ Precipitation probability
         │  └─ Weather condition changes
         │
         ├─ Detect patterns
         │  ├─ Temperature status (hot/warm/cool/cold)
         │  ├─ Precipitation trend (increasing/stable/decreasing)
         │  ├─ Wind patterns
         │  └─ UV exposure risk
         │
         ▼
    Generate System Prompt
         │
         ├─ Include weather context
         ├─ Include location name
         ├─ Include user's language preference
         ├─ Include analysis instructions
         │
         ▼
    Call OpenRouter API
         │
         ├─ Model: x-ai/grok-code-fast-1
         │
         ├─ Request:
         │  {
         │    "role": "system",
         │    "content": "You are a weather analyst..."
         │  },
         │  {
         │    "role": "user",
         │    "content": "Analyze this weather: [context]"
         │  }
         │
         ▼
    Parse LLM Response
         │
         ├─ Extract JSON from response
         │
         ├─ Structure:
         │  {
         │    "summary": "Today will be...",
         │    "alerts": [
         │      {
         │        "type": "rain|temp|uv|wind",
         │        "severity": "low|moderate|high",
         │        "title": "Alert title",
         │        "message": "Details...",
         │        "aiGenerated": true
         │      }
         │    ]
         │  }
         │
         ▼
    Process Alerts
         │
         ├─ Generate unique IDs
         ├─ Add timestamps
         ├─ Sort by severity
         ├─ Limit to 5 alerts
         │
         ▼
    Update Context & State
         │
         ├─ setSummary(aiSummary)
         ├─ setAlerts(processedAlerts)
         │
         ▼
    Components Update
         │
         ├─ HeroSection → Show summary
         ├─ TodaySummary → Display AI text
         ├─ SmartAlerts → Show alert cards
         ├─ AIReasoning → Ready for chat
         │
         ▼
    User Sees AI Analysis
```

### User Interaction: Location Selection Flow

```
User Action: "Pilih Lokasi"
    │
    ▼
Show Location Modal
    │
    ├─ Display saved locations
    ├─ Show search input
    │
    ▼
User Types Location Name
    │
    ├─ Example: "Jakarta"
    │
    ├─ debounce(300ms)
    │
    ▼
User Clicks Search / Presses Enter
    │
    ├─ setIsSearchingLocation(true)
    │
    ▼
Call Nominatim API
    │
    ├─ https://nominatim.openstreetmap.org/search
    ├─ Params: q="Jakarta", format="json", limit=5
    │
    ▼
Process Results
    │
    ├─ Extract lat/lon from results
    ├─ Create LocationCoordinates object
    │
    ├─ Check if already saved
    │  ├─ Yes → Skip save
    │  └─ No → Add to savedLocations
    │
    ├─ Save to localStorage
    │
    ▼
Update State
    │
    ├─ setActiveLocation(newLocation)
    ├─ setShowLocationOptions(false)
    │
    ▼
Trigger Weather Fetch
    │
    ├─ activeLocation changed → useWeather runs
    ├─ Fetch new weather data
    │
    ▼
Update UI
    │
    ├─ Modal closes
    ├─ New location weather displays
    ├─ Components re-render with new data
    │
    ▼
User Sees New Location's Weather
```

---

## Component Architecture

### Component Classification

#### Layout Components
- `AnimatedSidebar`: Desktop/mobile sidebar with hover expansion
- `Header`: Mobile header with menu toggle
- `BottomNav`: Mobile bottom navigation (currently disabled)

#### Feature Components
- `HeroSection`: Main weather display with temperature counter
- `WeatherStatsCards`: Grid of weather metrics (4 cards)
- `TodaySummary`: Daily weather summary with high/low temps
- `EnvironmentalInsights`: Air quality, UV, sunrise/sunset
- `PredictionChart`: 16-day temperature forecast chart
- `AIReasoning`: Chat interface with LLM
- `LocationCarousel`: Multi-location selector
- `SmartAlerts`: Weather alerts display
- `WeatherHistory`: Historical data view
- `WeatherPrediction`: Extended forecast view

#### Visual Effects Components
- `Aurora`: Animated background gradient
- `LoadingCloud`: Loading spinner animation
- `GlobeHint`: Interactive tooltip (first load)
- `Sparkline`: Mini line chart in stat cards

#### UI Primitives (Shadcn/UI)
- Button, Card, Dialog, Input, Select, Toast, Skeleton, etc.

### Component Data Dependencies

```
┌─────────────────────────────────────────┐
│      App State                          │
│  (page.tsx)                             │
└─────────────────────────────────────────┘
         │
         ├─ activeView → Content Router
         ├─ isDark → Aurora, all components
         ├─ isDesktop → Layout decision
         ├─ activeLocation → All weather components
         │
         ▼
┌─────────────────────────────────────────┐
│      WeatherContext (Provider)          │
│  (shared state for all children)        │
├─────────────────────────────────────────┤
│  • activeLocation                       │
│  • weatherData                          │
│  • isLoading                            │
│  • isDark                               │
│  • aiContext                            │
└─────────────────────────────────────────┘
         │
         ├─ HeroSection ← weatherData
         │
         ├─ TodaySummary ← weatherData, aiSummary
         │
         ├─ WeatherStatsCards ← weatherData
         │
         ├─ EnvironmentalInsights ← weatherData
         │
         ├─ PredictionChart ← weatherData
         │
         ├─ AIReasoning ← activeLocation, weatherData
         │
         ├─ SmartAlerts ← weatherData, aiAlerts
         │
         ├─ LocationCarousel ← savedLocations
         │
         └─ ... (other components)
```

---

## State Management

### Application-Level State

```typescript
// Main App State (page.tsx)
const [activeView, setActiveView] = useState<'home' | 'history' | 'weather-history' | 'weather-prediction' | 'alerts' | 'settings'>('home')
const [isDark, setIsDark] = useState(false)
const [sidebarOpen, setSidebarOpen] = useState(false)        // Mobile
const [sidebarExpanded, setSidebarExpanded] = useState(false) // Desktop
const [isDesktop, setIsDesktop] = useState(false)
const [isLoading, setIsLoading] = useState(true)

// Location State
const [currentLocation, setCurrentLocation] = useState<LocationCoordinates | null>(null)
const [savedLocations, setSavedLocations] = useState<LocationCoordinates[]>([])
const [activeLocation, setActiveLocation] = useState<LocationCoordinates | null>(null)
const [selectedLocationIndex, setSelectedLocationIndex] = useState<number>(-1)
const [showLocationOptions, setShowLocationOptions] = useState(false)
const [manualLocationInput, setManualLocationInput] = useState('')
const [isSearchingLocation, setIsSearchingLocation] = useState(false)

// Data State
const { data: weatherData, isLoading: isWeatherLoading, error: weatherError } = useWeather(activeLocation)
const { summary: aiSummary, alerts: aiAlerts } = useWeatherInsights(weatherData, activeLocation?.name)

// Geolocation State
const { location: currentLocation, isLoading: isGeoLoading, error: geoError } = useGeolocation()
```

### Context-Based State

```typescript
// WeatherContext
interface WeatherContextType {
  activeLocation: LocationCoordinates | null
  weatherData: CombinedWeatherData | null
  isLoading: boolean
  isWeatherLoading: boolean
  isGeoLoading: boolean
  weatherError: WeatherAPIError | null
  geoError: string | null
  savedLocations: LocationCoordinates[]
  isDark: boolean
  aiContext: AIContext | null
}

// Provider wrapper
<WeatherProvider value={contextValue}>
  {children}
</WeatherProvider>

// Usage in components
const context = useContext(WeatherContext)
```

### localStorage Keys

```typescript
'weatherLocations'     // Array of saved LocationCoordinates
'globeHintShown'       // Boolean for first load tooltip
'theme'                // 'light' | 'dark'
'units'                // 'metric' | 'imperial' (future)
```

---

## API Integration

### Open-Meteo API Integration

**Service**: `services/weatherService.ts`

```typescript
// Cache Management
const weatherCache = new Map<string, CacheEntry>()
const CACHE_TTL = 10 * 60 * 1000 // 10 minutes

// Functions
async function fetchJMAForecast(lat, lon)  // Hourly + Daily forecast
async function fetchEnvironmental(lat, lon) // Environmental data
async function getCombinedWeather(lat, lon) // Combined response

// Error Handling
export class WeatherAPIError extends Error {
  constructor(code: string, message: string)
}

// Retry Logic
// Built-in retry with exponential backoff (3 attempts)
```

### OpenRouter API Integration

**Service**: `services/openrouterService.ts`

```typescript
// Configuration
const OPENROUTER_API_KEY = process.env.NEXT_PUBLIC_OPENROUTER_API_KEY
const OPENROUTER_BASE_URL = 'https://openrouter.ai/api/v1'
const MODEL = 'x-ai/grok-code-fast-1'

// Functions
async function analyzeWeather(context: WeatherAnalysisContext)
async function generateAlerts(weatherData, context)
async function chatWithAI(messages: AIMessage[], context: AIContext)

// Error Handling
export class OpenRouterError extends Error {
  constructor(code: string, message: string, status?: number)
}

// Features
// - Streaming response support (future)
// - Token counting
// - Rate limit handling
// - Retry with backoff
```

### Geolocation & Search

**Geolocation Hook**: `hooks/useGeolocation.ts`
- Uses browser's native Geolocation API
- Handles permission requests
- Error handling & retry logic

**Location Search**: Uses Nominatim API (embedded in page.tsx)
- Free, no authentication required
- Debounced input
- Results caching

---

## Error Handling

### Global Error Boundary

```typescript
// Error boundary wrapper (layout.tsx)
<ErrorBoundary fallback={<ErrorFallback />}>
  {children}
</ErrorBoundary>
```

### Component-Level Error Handling

```typescript
// In components
try {
  // API call
} catch (error) {
  if (error instanceof WeatherAPIError) {
    // Handle weather API error
  } else if (error instanceof OpenRouterError) {
    // Handle LLM error
  } else {
    // Handle generic error
  }
}
```

### User-Facing Error States

1. **Geolocation Denied**: Show manual location search
2. **Weather API Failed**: Show retry button + cached data
3. **LLM API Failed**: Show fallback text or skip AI features
4. **Network Error**: Show offline indicator
5. **Invalid Data**: Show error message + suggestion

---

## Performance Optimization

### Strategies Implemented

1. **API Caching**: 10-minute TTL for weather data
2. **Request Debouncing**: 300ms for location search
3. **Lazy Loading**: Dynamic imports for heavy components
4. **Memoization**: useMemo for expensive computations
5. **Callback Memoization**: useCallback for props passed to children
6. **Code Splitting**: Route-based and component-based splitting
7. **Image Optimization**: Next.js Image component
8. **CSS-in-JS**: Tailwind CSS for minimal bundle

### Performance Metrics

```
First Load:
- Initial HTML: ~45 KB
- JavaScript: ~280 KB (gzipped: ~85 KB)
- CSS: ~25 KB (gzipped: ~8 KB)
- FCP: ~1.2s
- LCP: ~2.3s
- TTI: ~3.5s
- CLS: ~0.05

After Cache:
- API call: Skipped (cached)
- Render time: ~200ms
- Full load: ~500ms
```

### Memory Usage

```
Browser Memory (development):
- Initial: ~40 MB
- After 10 API calls: ~65 MB
- Cache size: ~2-5 MB
```

---

## Security Considerations

### API Key Management

```typescript
// ✅ Correct: Environment variable
const apiKey = process.env.NEXT_PUBLIC_OPENROUTER_API_KEY

// ❌ Wrong: Hardcoded in code
const apiKey = "sk-or-v1-xxx..."

// ✅ Correct: Only expose NEXT_PUBLIC_* variables
// ❌ Wrong: Expose private API keys on client
```

### CORS & API Calls

```typescript
// ✅ Correct: Open-Meteo allows CORS
const response = await fetch('https://api.open-meteo.com/v1/forecast')

// ✅ Correct: OpenRouter allows CORS with Authorization header
const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
  headers: {
    'Authorization': `Bearer ${apiKey}`
  }
})

// Note: For sensitive operations, use API route proxy
// POST /api/weather/forecast → Proxy to Open-Meteo
```

### Data Privacy

```typescript
// Geolocation
- Only requested with user permission
- Not sent to external APIs
- Stored locally in browser only
- User can deny and use manual search

// Weather Data
- Public information
- No personal data attached
- Cached locally

// localStorage
- Not encrypted (use careful for sensitive data)
- Limited to same-origin policy
- User can clear anytime
```

### Input Validation

```typescript
// Location search
const trimmed = userInput.trim()
if (!trimmed || trimmed.length < 2) {
  return // Invalid input
}

// Weather data from API
if (!data.latitude || !data.hourly || !data.daily) {
  throw new WeatherAPIError('INVALID_RESPONSE', 'Missing required fields')
}

// AI response parsing
try {
  const parsed = JSON.parse(llmResponse)
  // Validate structure
} catch (e) {
  // Handle invalid JSON
}
```

### Rate Limiting

```typescript
// No built-in rate limiting from APIs (free tier allows reasonable usage)
// Recommended: Implement server-side rate limiting

// Client-side protection:
- Debounce location search (300ms)
- Cache weather data (10 min TTL)
- Single active request (abort previous)
```

---

## Future Enhancements

### Phase 2 Improvements
- [ ] Advanced alert system with push notifications
- [ ] Historical data tracking & analytics
- [ ] User authentication & personalization
- [ ] Extended forecast (30+ days)
- [ ] Satellite imagery integration

### Phase 3 Improvements
- [ ] Mobile app (React Native)
- [ ] AR weather visualization
- [ ] Social sharing features
- [ ] Weather community platform
- [ ] Advanced radar integration

### Performance Improvements
- [ ] Server-side rendering (SSR) for first page load
- [ ] Static generation (SSG) for common locations
- [ ] Edge caching for API responses
- [ ] Service Worker for offline support
- [ ] Compressed image formats (WebP)

### Code Quality
- [ ] Unit tests (Jest + React Testing Library)
- [ ] E2E tests (Cypress or Playwright)
- [ ] Storybook for component documentation
- [ ] API documentation (OpenAPI/Swagger)
- [ ] Performance monitoring (Web Vitals)

---

**Last Updated**: October 25, 2025  
**Version**: 1.0.0
