# 📡 API Documentation

## Table of Contents
1. [Overview](#overview)
2. [Base URLs](#base-urls)
3. [Weather API](#weather-api)
4. [AI API](#ai-api)
5. [Geolocation API](#geolocation-api)
6. [Error Codes](#error-codes)
7. [Rate Limiting](#rate-limiting)
8. [Examples](#examples)

---

## Overview

ClimaSense AI integrates with multiple external APIs to provide comprehensive weather data and AI-powered insights:

- **Open-Meteo API**: Real-time weather forecast and environmental data
- **OpenRouter API**: LLM integration for AI analysis and chat
- **Nominatim API**: Location search and reverse geocoding
- **Browser Geolocation API**: User location detection

---

## Base URLs

| Service | URL | Auth |
|---------|-----|------|
| Open-Meteo | `https://api.open-meteo.com/v1` | None |
| OpenRouter | `https://openrouter.ai/api/v1` | Bearer Token |
| Nominatim | `https://nominatim.openstreetmap.org` | None |
| Browser Geolocation | Native API | User Permission |

---

## Weather API

### 1. Open-Meteo Forecast API

Provides real-time weather data and forecasts using JMA Global Forecast Model.

#### Endpoint: `GET /forecast`

**URL**: `https://api.open-meteo.com/v1/forecast`

**Query Parameters**:

| Parameter | Type | Required | Description | Example |
|-----------|------|----------|-------------|---------|
| `latitude` | float | Yes | Location latitude | `-1.169` |
| `longitude` | float | Yes | Location longitude | `124.730` |
| `hourly` | string[] | Yes | Hourly data fields | `temperature_2m,humidity_2m` |
| `daily` | string[] | Yes | Daily data fields | `temperature_2m_max,precipitation_sum` |
| `forecast_days` | int | No | Days to forecast (1-16) | `16` |
| `timezone` | string | No | Timezone (auto-detect) | `auto` or `Asia/Jakarta` |
| `elevation` | float | No | Elevation in meters | `0` |
| `wind_speed_unit` | string | No | Wind speed unit | `kmh`, `ms`, `mph`, `kn` |
| `precipitation_unit` | string | No | Precipitation unit | `mm`, `inch` |
| `temperature_unit` | string | No | Temperature unit | `celsius`, `fahrenheit` |

**Hourly Data Fields** (available):

```typescript
time                        // ISO 8601 timestamp
temperature_2m              // Temperature at 2m height (°C)
relative_humidity_2m        // Relative humidity at 2m (%)
pressure_msl                // Mean sea level pressure (hPa)
precipitation               // Total precipitation (mm)
cloud_cover                 // Cloud cover percentage (%)
wind_speed_10m              // Wind speed at 10m height (km/h)
weather_code                // WMO weather code
shortwave_radiation         // Solar radiation (W/m²)
evapotranspiration          // Potential evapotranspiration (mm)
```

**Daily Data Fields** (available):

```typescript
time                        // ISO 8601 date
weather_code                // Primary weather code
temperature_2m_max          // Maximum temperature (°C)
temperature_2m_min          // Minimum temperature (°C)
precipitation_sum           // Total precipitation (mm)
precipitation_hours         // Precipitation hours
windspeed_10m_max           // Maximum wind speed (km/h)
windgusts_10m_max           // Maximum wind gust (km/h)
uv_index_max                // Maximum UV index
uv_index_clear_sky_max      // Max UV index (clear sky)
sunrise                     // Sunrise time (ISO 8601)
sunset                      // Sunset time (ISO 8601)
```

**Request Example**:

```bash
curl -G "https://api.open-meteo.com/v1/forecast" \
  -d "latitude=-1.169" \
  -d "longitude=124.730" \
  -d "hourly=temperature_2m,relative_humidity_2m,pressure_msl,precipitation,cloud_cover,wind_speed_10m,weather_code" \
  -d "daily=temperature_2m_max,temperature_2m_min,precipitation_sum,weather_code,uv_index_max,sunrise,sunset" \
  -d "forecast_days=16" \
  -d "timezone=auto"
```

**Response Example** (200 OK):

```json
{
  "latitude": -1.169,
  "longitude": 124.730,
  "elevation": 50.0,
  "generationtime_ms": 1.2345,
  "timezone": "Asia/Makassar",
  "timezone_abbreviation": "WITA",
  "utc_offset_seconds": 28800,
  "hourly_units": {
    "time": "iso8601",
    "temperature_2m": "°C",
    "relative_humidity_2m": "%",
    "pressure_msl": "hPa",
    "precipitation": "mm",
    "cloud_cover": "%",
    "wind_speed_10m": "km/h",
    "weather_code": "wmo code"
  },
  "hourly": {
    "time": [
      "2025-10-25T00:00",
      "2025-10-25T01:00",
      "2025-10-25T02:00"
    ],
    "temperature_2m": [28.5, 27.8, 27.2],
    "relative_humidity_2m": [75, 78, 80],
    "pressure_msl": [1013.2, 1013.1, 1013.0],
    "precipitation": [0.0, 0.2, 0.5],
    "cloud_cover": [60, 65, 70],
    "wind_speed_10m": [8.5, 7.2, 6.8],
    "weather_code": [2, 80, 80]
  },
  "daily_units": {
    "time": "iso8601",
    "weather_code": "wmo code",
    "temperature_2m_max": "°C",
    "temperature_2m_min": "°C",
    "precipitation_sum": "mm",
    "uv_index_max": "index"
  },
  "daily": {
    "time": [
      "2025-10-25",
      "2025-10-26",
      "2025-10-27"
    ],
    "weather_code": [80, 61, 2],
    "temperature_2m_max": [32.1, 30.5, 31.2],
    "temperature_2m_min": [24.3, 23.8, 24.1],
    "precipitation_sum": [8.5, 2.3, 0.0],
    "uv_index_max": [7.2, 6.8, 8.1],
    "sunrise": [
      "2025-10-25T05:45",
      "2025-10-26T05:46",
      "2025-10-27T05:47"
    ],
    "sunset": [
      "2025-10-25T18:15",
      "2025-10-26T18:14",
      "2025-10-27T18:13"
    ]
  }
}
```

**Weather Codes** (WMO):

| Code | Condition | Severity |
|------|-----------|----------|
| 0 | Clear sky | Low |
| 1 | Mainly clear | Low |
| 2 | Partly cloudy | Low |
| 3 | Overcast | Low |
| 45 | Foggy | Medium |
| 48 | Depositing rime fog | Medium |
| 51 | Light drizzle | Medium |
| 53 | Moderate drizzle | Medium |
| 55 | Dense drizzle | High |
| 61 | Slight rain | Medium |
| 63 | Moderate rain | Medium |
| 65 | Heavy rain | High |
| 71 | Slight snow | High |
| 73 | Moderate snow | High |
| 75 | Heavy snow | High |
| 80 | Slight rain showers | Medium |
| 81 | Moderate rain showers | High |
| 82 | Violent rain showers | High |
| 85 | Slight snow showers | High |
| 86 | Heavy snow showers | High |
| 95 | Thunderstorm | High |
| 96 | Thunderstorm with hail | High |
| 99 | Thunderstorm with hail | High |

---

## AI API

### 1. OpenRouter Chat Completion

Provides LLM integration for weather analysis and chat.

#### Endpoint: `POST /chat/completions`

**URL**: `https://openrouter.ai/api/v1/chat/completions`

**Headers**:

```typescript
{
  "Authorization": "Bearer YOUR_API_KEY",
  "HTTP-Referer": "https://yourdomain.com",
  "X-Title": "ClimaSense AI",
  "Content-Type": "application/json"
}
```

**Request Body**:

```typescript
{
  "model": string                    // Model ID
  "messages": Array<{
    "role": "system" | "user" | "assistant"
    "content": string
  }>
  "temperature"?: number             // Creativity (0-2)
  "max_tokens"?: number              // Response limit
  "top_p"?: number                   // Diversity (0-1)
  "top_k"?: number                   // Variety
  "frequency_penalty"?: number       // Repetition penalty
  "presence_penalty"?: number        // Novelty boost
}
```

**Available Models** (via OpenRouter):

| Model | Provider | Speed | Quality | Cost |
|-------|----------|-------|---------|------|
| `x-ai/grok-code-fast-1` | xAI | Fast | High | Low |
| `anthropic/claude-3-opus` | Anthropic | Slow | Excellent | High |
| `openai/gpt-4-turbo` | OpenAI | Medium | Excellent | High |
| `meta-llama/llama-2-70b` | Meta | Medium | Good | Medium |
| `google/palm-2-chat-bison` | Google | Medium | Good | Medium |

**Request Example**:

```bash
curl -X POST "https://openrouter.ai/api/v1/chat/completions" \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "x-ai/grok-code-fast-1",
    "messages": [
      {
        "role": "system",
        "content": "You are a helpful weather assistant. Provide concise, accurate weather analysis."
      },
      {
        "role": "user",
        "content": "Analyze this weather data: Temperature 28°C, Humidity 75%, Wind 8 km/h, Condition: Partly Cloudy"
      }
    ],
    "temperature": 0.7,
    "max_tokens": 500
  }'
```

**Response Example** (200 OK):

```json
{
  "id": "chatcmpl-8R7K8x9mL2pQ1vN4xJ2mB5sZ",
  "object": "chat.completion",
  "created": 1698098765,
  "model": "x-ai/grok-code-fast-1",
  "choices": [
    {
      "index": 0,
      "message": {
        "role": "assistant",
        "content": "Based on the weather data you provided:\n\n**Current Conditions:**\n- Temperature: 28°C (warm)\n- Humidity: 75% (humid)\n- Wind: 8 km/h (light breeze)\n- Condition: Partly Cloudy\n\n**Analysis:**\nIt's a warm, humid day with pleasant wind. Good for outdoor activities. Consider staying hydrated due to humidity."
      },
      "finish_reason": "stop"
    }
  ],
  "usage": {
    "prompt_tokens": 85,
    "completion_tokens": 120,
    "total_tokens": 205
  }
}
```

**Response Error Example** (400/401/429):

```json
{
  "error": {
    "message": "Unauthorized",
    "type": "invalid_request_error",
    "code": "invalid_api_key"
  }
}
```

**Response Streaming** (optional):

Add `"stream": true` to request for streaming response:

```
data: {"choices":[{"index":0,"delta":{"role":"assistant","content":"Based"},"finish_reason":null}]}
data: {"choices":[{"index":0,"delta":{"content":" on"},"finish_reason":null}]}
...
data: [DONE]
```

---

## Geolocation API

### 1. Browser Geolocation API

Native browser API for user location detection.

#### Method: `navigator.geolocation.getCurrentPosition()`

**Permissions**:
- First call requests user permission
- User can allow/deny
- Permission persists per browser

**Request Example**:

```javascript
navigator.geolocation.getCurrentPosition(
  (position) => {
    const latitude = position.coords.latitude
    const longitude = position.coords.longitude
    const accuracy = position.coords.accuracy
    console.log(`Lat: ${latitude}, Lon: ${longitude}, Accuracy: ${accuracy}m`)
  },
  (error) => {
    console.error(`Error code ${error.code}: ${error.message}`)
  },
  {
    enableHighAccuracy: true,
    timeout: 5000,
    maximumAge: 0
  }
)
```

**Success Response**:

```typescript
{
  coords: {
    latitude: number      // Decimal degrees
    longitude: number     // Decimal degrees
    accuracy: number      // Accuracy in meters
    altitude: number | null
    altitudeAccuracy: number | null
    heading: number | null
    speed: number | null
  },
  timestamp: number       // Milliseconds since epoch
}
```

**Error Codes**:

| Code | Message | Description |
|------|---------|-------------|
| 1 | PERMISSION_DENIED | User denied permission |
| 2 | POSITION_UNAVAILABLE | Location data unavailable |
| 3 | TIMEOUT | Request timed out |

---

### 2. Nominatim Location Search

OpenStreetMap's geocoding service for location search.

#### Endpoint: `GET /search`

**URL**: `https://nominatim.openstreetmap.org/search`

**Query Parameters**:

| Parameter | Type | Required | Description | Example |
|-----------|------|----------|-------------|---------|
| `q` | string | Yes | Location query | `Jakarta` |
| `format` | string | Yes | Response format | `json` |
| `limit` | int | No | Result limit | `5` |
| `countrycodes` | string | No | Country filter | `id` |
| `addressdetails` | int | No | Detailed address | `1` |
| `zoom` | int | No | Result zoom level | `10` |

**Request Example**:

```bash
curl "https://nominatim.openstreetmap.org/search?q=Jakarta&format=json&limit=5" \
  -H "User-Agent: ClimaSenseWeatherApp/1.0"
```

**Response Example** (200 OK):

```json
[
  {
    "place_id": 123456789,
    "osm_id": 987654321,
    "osm_type": "relation",
    "licence": "Data © OpenStreetMap contributors",
    "lat": "-6.2088",
    "lon": "106.8456",
    "class": "place",
    "type": "city",
    "place_rank": 16,
    "importance": 0.85,
    "addresstype": "city",
    "name": "Jakarta",
    "display_name": "Jakarta, Indonesia",
    "address": {
      "city": "Jakarta",
      "county": "Jakarta",
      "state": "Jakarta",
      "country": "Indonesia",
      "country_code": "id"
    }
  },
  {
    "place_id": 123456790,
    "lat": "-6.1751",
    "lon": "106.8249",
    "display_name": "Jakarta Pusat, Jakarta, Indonesia",
    "address": {
      "city": "Jakarta Pusat",
      "county": "Jakarta",
      "state": "Jakarta",
      "country": "Indonesia"
    }
  }
]
```

**Error Response** (404):

```json
[]
```

---

## Custom API Routes

### Weather Forecast Route

**Endpoint**: `POST /api/weather/forecast`

**Purpose**: Server-side weather data fetching with caching

**Request Body**:

```typescript
{
  latitude: number
  longitude: number
  includeHourly?: boolean
  hourlyCount?: number
}
```

**Response Example**:

```json
{
  "success": true,
  "data": {
    "latitude": -1.169,
    "longitude": 124.730,
    "location": {
      "name": "Motoling",
      "country": "Indonesia"
    },
    "hourly": [...],
    "daily": [...]
  },
  "cached": false,
  "timestamp": 1698098765
}
```

### AI Chat Route

**Endpoint**: `POST /api/ai/chat`

**Purpose**: Chat with AI about weather

**Request Body**:

```typescript
{
  messages: Array<{
    role: "user" | "assistant"
    content: string
  }>,
  context?: {
    location: string
    temperature: number
    humidity: number
    condition: string
  }
}
```

**Response Example**:

```json
{
  "success": true,
  "data": {
    "role": "assistant",
    "content": "Based on current weather in Jakarta..."
  },
  "model": "x-ai/grok-code-fast-1",
  "tokens": {
    "prompt": 85,
    "completion": 120
  }
}
```

---

## Error Codes

### Weather API Errors

| Code | Status | Description | Solution |
|------|--------|-------------|----------|
| INVALID_COORDINATES | 400 | Invalid latitude/longitude | Check coordinates range |
| MISSING_PARAMETERS | 400 | Missing required parameters | Include all required params |
| FORECAST_UNAVAILABLE | 503 | Service temporarily unavailable | Retry after 30s |
| API_RATE_LIMIT | 429 | Rate limit exceeded | Wait before next request |
| API_TIMEOUT | 504 | Request timed out | Retry or increase timeout |

### AI API Errors

| Code | Status | Description | Solution |
|------|--------|-------------|----------|
| invalid_api_key | 401 | Invalid or missing API key | Check OPENROUTER_API_KEY |
| insufficient_quota | 429 | API quota exceeded | Wait for quota reset |
| model_not_found | 400 | Model doesn't exist | Use valid model ID |
| context_length_exceeded | 400 | Message too long | Reduce message length |
| server_error | 500 | Server error | Retry after 60s |

### Geolocation Errors

| Code | Message | Solution |
|------|---------|----------|
| 1 | PERMISSION_DENIED | Allow geolocation in browser settings |
| 2 | POSITION_UNAVAILABLE | Check GPS/location services |
| 3 | TIMEOUT | Check internet connection |

---

## Rate Limiting

### Open-Meteo
- **Limit**: 10,000 calls/day (free tier)
- **Per-second**: No hard limit
- **Response**: Returns data without rate limit header

### OpenRouter
- **Limit**: Based on subscription plan
- **Free Tier**: 20 requests/day
- **Pro Tier**: Unlimited
- **Response Header**: `X-RateLimit-Remaining`

### Nominatim
- **Limit**: 1 request/second per IP
- **Response**: 429 Too Many Requests if exceeded
- **Solution**: Use debouncing (implemented)

---

## Examples

### JavaScript/TypeScript Examples

#### Fetch Weather Data

```typescript
const response = await fetch(
  'https://api.open-meteo.com/v1/forecast?' +
  'latitude=-1.169&longitude=124.730&' +
  'hourly=temperature_2m,humidity_2m,precipitation&' +
  'daily=temperature_2m_max,temperature_2m_min&' +
  'forecast_days=16&timezone=auto'
)

const data = await response.json()
console.log(data.hourly.temperature_2m)
```

#### Chat with AI

```typescript
const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${process.env.NEXT_PUBLIC_OPENROUTER_API_KEY}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    model: 'x-ai/grok-code-fast-1',
    messages: [
      {
        role: 'user',
        content: 'How is the weather today?'
      }
    ]
  })
})

const data = await response.json()
console.log(data.choices[0].message.content)
```

#### Search Location

```typescript
const response = await fetch(
  'https://nominatim.openstreetmap.org/search?' +
  'q=Jakarta&format=json&limit=5',
  {
    headers: {
      'User-Agent': 'ClimaSenseApp/1.0'
    }
  }
)

const results = await response.json()
console.log(results[0].lat, results[0].lon)
```

---

**Last Updated**: October 25, 2025  
**Version**: 1.0.0
