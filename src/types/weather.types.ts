/**
 * Weather API Types & Interfaces
 * Definisi struktur data untuk Open-Meteo API (JMA + Environmental)
 */

// ============================================================
// JMA Forecast Types
// ============================================================

export interface HourlyWeatherData {
    time: string[]
    temperature_2m: number[]
    relative_humidity_2m: number[]
    pressure_msl: number[]
    precipitation: number[]
    cloud_cover: number[]
    wind_speed_10m: number[]
    weather_code: number[]
}

export interface HourlyWeatherUnits {
    time: string
    temperature_2m: string
    relative_humidity_2m: string
    pressure_msl: string
    precipitation: string
    cloud_cover: string
    wind_speed_10m: string
    weather_code: string
}

export interface DailyWeatherData {
    time: string[]
    temperature_2m_max: number[]
    temperature_2m_min: number[]
    precipitation_sum: number[]
    weather_code: number[]
}

export interface DailyWeatherUnits {
    time: string
    temperature_2m_max: string
    temperature_2m_min: string
    precipitation_sum: string
    weather_code: string
}

export interface JMAForecastResponse {
    latitude: number
    longitude: number
    elevation: number
    timezone: string
    timezone_abbreviation: string
    utc_offset_seconds: number
    hourly_units: HourlyWeatherUnits
    hourly: HourlyWeatherData
    daily_units: DailyWeatherUnits
    daily: DailyWeatherData
}

// ============================================================
// Environmental Data Types
// ============================================================

export interface EnvironmentalDailyData {
    time: string[]
    uv_index_max: number[]
    sunrise: string[]
    sunset: string[]
}

export interface EnvironmentalDailyUnits {
    time: string
    uv_index_max: string
    sunrise: string
    sunset: string
}

export interface EnvironmentalResponse {
    latitude: number
    longitude: number
    elevation: number
    timezone: string
    timezone_abbreviation: string
    utc_offset_seconds: number
    daily_units: EnvironmentalDailyUnits
    daily: EnvironmentalDailyData
}

// ============================================================
// Combined Weather Data Types
// ============================================================

export interface LocationCoordinates {
    latitude: number
    longitude: number
    name: string
}

export interface WeatherDataPoint {
    time: string
    temperature: number
    humidity: number
    pressure: number
    precipitation: number
    cloudCover: number
    windSpeed: number
    weatherCode: number
}

export interface DailyWeatherSummary {
    date: string
    temperatureMax: number
    temperatureMin: number
    precipitationSum: number
    uvIndexMax: number
    sunrise: string
    sunset: string
    weatherCode: number
}

export interface CombinedWeatherData {
    location: LocationCoordinates
    timezone: string
    lastUpdate: string
    hourly: WeatherDataPoint[]
    daily: DailyWeatherSummary[]
    airQuality: {
        pm25: number
        pm10: number
        carbonMonoxide: number
        ozone: number
        aqi: number
        aqiLevel: string
    } | null
    visibility: {
        value: number // in meters
        valueKm: number // in kilometers
    } | null
    metadata: {
        elevation: number
        utcOffset: number
    }
}

// ============================================================
// API Request Types
// ============================================================

export interface ForecastRequest {
    latitude: number
    longitude: number
    forecastDays?: number
    timezone?: string
}

export interface LocationRequest {
    latitude: number
    longitude: number
    locationName: string
}

// ============================================================
// Error Types
// ============================================================

export class WeatherAPIError extends Error {
    constructor(
        public code: string,
        message: string,
        public statusCode?: number,
        public details?: Record<string, any>
    ) {
        super(message)
        this.name = 'WeatherAPIError'
    }
}

// ============================================================
// Utility Types
// ============================================================

export interface ApiResponse<T> {
    success: boolean
    data?: T
    error?: {
        code: string
        message: string
        details?: Record<string, any>
    }
    timestamp: string
}

export interface CacheEntry<T> {
    data: T
    timestamp: number
    ttl: number
}

// ============================================================
// Weather Code Mappings (WMO Weather Code)
// ============================================================

export const WEATHER_CODE_MAP: Record<number, {
    description: string
    icon: string
    severity: 'clear' | 'cloudy' | 'rainy' | 'stormy'
}> = {
    0: { description: 'Clear Sky', icon: '☀️', severity: 'clear' },
    1: { description: 'Mainly Clear', icon: '🌤️', severity: 'clear' },
    2: { description: 'Partly Cloudy', icon: '⛅', severity: 'cloudy' },
    3: { description: 'Overcast', icon: '☁️', severity: 'cloudy' },
    45: { description: 'Foggy', icon: '🌫️', severity: 'cloudy' },
    48: { description: 'Depositing Rime Fog', icon: '🌫️', severity: 'cloudy' },
    51: { description: 'Light Drizzle', icon: '🌧️', severity: 'rainy' },
    53: { description: 'Moderate Drizzle', icon: '🌧️', severity: 'rainy' },
    55: { description: 'Dense Drizzle', icon: '🌧️', severity: 'rainy' },
    61: { description: 'Slight Rain', icon: '🌧️', severity: 'rainy' },
    63: { description: 'Moderate Rain', icon: '🌧️', severity: 'rainy' },
    65: { description: 'Heavy Rain', icon: '⛈️', severity: 'rainy' },
    71: { description: 'Slight Snow', icon: '❄️', severity: 'stormy' },
    73: { description: 'Moderate Snow', icon: '❄️', severity: 'stormy' },
    75: { description: 'Heavy Snow', icon: '❄️', severity: 'stormy' },
    77: { description: 'Snow Grains', icon: '❄️', severity: 'stormy' },
    80: { description: 'Slight Rain Showers', icon: '🌦️', severity: 'rainy' },
    81: { description: 'Moderate Rain Showers', icon: '🌦️', severity: 'rainy' },
    82: { description: 'Violent Rain Showers', icon: '⛈️', severity: 'stormy' },
    85: { description: 'Slight Snow Showers', icon: '🌨️', severity: 'stormy' },
    86: { description: 'Heavy Snow Showers', icon: '🌨️', severity: 'stormy' },
    95: { description: 'Thunderstorm', icon: '⛈️', severity: 'stormy' },
    96: { description: 'Thunderstorm with Slight Hail', icon: '⛈️', severity: 'stormy' },
    99: { description: 'Thunderstorm with Heavy Hail', icon: '⛈️', severity: 'stormy' },
}

export function getWeatherDescription(code: number): string {
    return WEATHER_CODE_MAP[code]?.description || 'Unknown'
}

export function getWeatherIcon(code: number): string {
    return WEATHER_CODE_MAP[code]?.icon || '🌡️'
}

export function getWeatherSeverity(code: number): string {
    return WEATHER_CODE_MAP[code]?.severity || 'cloudy'
}
