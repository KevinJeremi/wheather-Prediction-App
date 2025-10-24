/**
 * Weather Service Layer
 * Menghandle semua komunikasi dengan Open-Meteo API
 * Includes: JMA Forecast + Environmental Data
 */

import type {
    JMAForecastResponse,
    EnvironmentalResponse,
    CombinedWeatherData,
    LocationCoordinates,
    DailyWeatherSummary,
    WeatherDataPoint,
    ForecastRequest,
    WeatherAPIError,
    ApiResponse,
    CacheEntry,
} from '@/types/weather.types'

import { WeatherAPIError as WeatherAPIErrorClass } from '@/types/weather.types'

// ============================================================
// Configuration
// ============================================================

const BASE_URL = 'https://api.open-meteo.com/v1/forecast'
const FORECAST_DAYS = 16  // JMA API maximum supported: 16 days (not 30)
const CACHE_TTL = 10 * 60 * 1000 // 10 minutes in milliseconds

// Simple in-memory cache
const weatherCache = new Map<string, CacheEntry<any>>()

// ============================================================
// Cache Management
// ============================================================

function getCacheKey(lat: number, lon: number, type: 'forecast' | 'environment'): string {
    return `weather_${type}_${lat}_${lon}`
}

function getFromCache<T>(key: string): T | null {
    const entry = weatherCache.get(key)
    if (!entry) return null

    const now = Date.now()
    if (now - entry.timestamp > entry.ttl) {
        weatherCache.delete(key)
        return null
    }

    return entry.data
}

function setToCache<T>(key: string, data: T, ttl: number = CACHE_TTL): void {
    weatherCache.set(key, {
        data,
        timestamp: Date.now(),
        ttl,
    })
}

// ============================================================
// API Call Functions
// ============================================================

/**
 * Fetch JMA Global Forecast Data
 */
async function fetchJMAForecast(
    latitude: number,
    longitude: number
): Promise<JMAForecastResponse> {
    const cacheKey = getCacheKey(latitude, longitude, 'forecast')

    // Check cache first
    const cached = getFromCache<JMAForecastResponse>(cacheKey)
    if (cached) {
        console.log(`[Cache] JMA Forecast for ${latitude}, ${longitude}`)
        return cached
    }

    const params = new URLSearchParams({
        latitude: latitude.toString(),
        longitude: longitude.toString(),
        hourly: [
            'temperature_2m',
            'relative_humidity_2m',
            'pressure_msl',
            'precipitation',
            'cloud_cover',
            'wind_speed_10m',
            'weather_code',
        ].join(','),
        daily: [
            'temperature_2m_max',
            'temperature_2m_min',
            'precipitation_sum',
            'weather_code',
        ].join(','),
        forecast_days: FORECAST_DAYS.toString(),
        timezone: 'auto',
        models: 'jma_gsm',
        temperature_unit: 'celsius',
    })

    try {
        const response = await fetch(`${BASE_URL}?${params.toString()}`, {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
            },
            // Using Next.js fetch with cache for better performance
            next: { revalidate: 600 }, // 10 minutes
        })

        if (!response.ok) {
            throw new WeatherAPIErrorClass(
                'JMA_FORECAST_ERROR',
                `Failed to fetch JMA forecast: ${response.statusText}`,
                response.status
            )
        }

        const data: JMAForecastResponse = await response.json()

        // Cache the result
        setToCache(cacheKey, data)

        return data
    } catch (error) {
        if (error instanceof WeatherAPIErrorClass) {
            throw error
        }
        throw new WeatherAPIErrorClass(
            'JMA_FETCH_ERROR',
            `Error fetching JMA forecast: ${error instanceof Error ? error.message : 'Unknown error'}`,
            undefined,
            { originalError: error }
        )
    }
}

/**
 * Fetch Air Quality Data from Open-Meteo Air Quality API
 */
async function fetchAirQualityData(
    latitude: number,
    longitude: number
): Promise<any> {
    const params = new URLSearchParams({
        latitude: latitude.toString(),
        longitude: longitude.toString(),
        hourly: ['pm2_5', 'pm10', 'carbon_monoxide', 'ozone'].join(','),
        timezone: 'auto',
    })

    try {
        const response = await fetch(
            `https://air-quality-api.open-meteo.com/v1/air-quality?${params.toString()}`,
            {
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                },
                next: { revalidate: 600 }, // 10 minutes
            }
        )

        if (!response.ok) {
            throw new Error(`Failed to fetch air quality data: ${response.statusText}`)
        }

        const data = await response.json()
        return data
    } catch (error) {
        console.error('Error fetching air quality:', error)
        return null
    }
}

/**
 * Fetch Visibility Data from OpenWeatherMap
 */
async function fetchVisibilityData(
    latitude: number,
    longitude: number
): Promise<any> {
    const apiKey = process.env.NEXT_PUBLIC_OPENWEATHERMAP_API_KEY || '714d9d1a2d88fbbe23912a8b1810f7d0'

    try {
        const response = await fetch(
            `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${apiKey}&units=metric`,
            {
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                },
                next: { revalidate: 600 }, // 10 minutes
            }
        )

        if (!response.ok) {
            throw new Error(`Failed to fetch visibility data: ${response.statusText}`)
        }

        const data = await response.json()
        return data
    } catch (error) {
        console.error('Error fetching visibility:', error)
        return null
    }
}

/**
 * Calculate Air Quality Index (AQI) from PM2.5
 */
function calculateAQI(pm25: number): { aqi: number; level: string } {
    let aqi: number
    let level: string

    if (pm25 <= 12) {
        aqi = (pm25 / 12) * 50
        level = 'Good'
    } else if (pm25 <= 35.4) {
        aqi = ((pm25 - 12) / (35.4 - 12)) * (100 - 50) + 50
        level = 'Moderate'
    } else if (pm25 <= 55.4) {
        aqi = ((pm25 - 35.4) / (55.4 - 35.4)) * (150 - 100) + 100
        level = 'Unhealthy for Sensitive'
    } else if (pm25 <= 150.4) {
        aqi = ((pm25 - 55.4) / (150.4 - 55.4)) * (200 - 150) + 150
        level = 'Unhealthy'
    } else if (pm25 <= 250.4) {
        aqi = ((pm25 - 150.4) / (250.4 - 150.4)) * (300 - 200) + 200
        level = 'Very Unhealthy'
    } else {
        aqi = 500
        level = 'Hazardous'
    }

    return { aqi: Math.round(aqi), level }
}

/**
 * Fetch Environmental Data (UV Index, Sunrise, Sunset)
 */
async function fetchEnvironmentalData(
    latitude: number,
    longitude: number
): Promise<EnvironmentalResponse> {
    const cacheKey = getCacheKey(latitude, longitude, 'environment')

    // Check cache first
    const cached = getFromCache<EnvironmentalResponse>(cacheKey)
    if (cached) {
        console.log(`[Cache] Environmental data for ${latitude}, ${longitude}`)
        return cached
    }

    const params = new URLSearchParams({
        latitude: latitude.toString(),
        longitude: longitude.toString(),
        daily: ['uv_index_max', 'sunrise', 'sunset'].join(','),
        timezone: 'auto',
        forecast_days: FORECAST_DAYS.toString(),
    })

    try {
        const response = await fetch(`${BASE_URL}?${params.toString()}`, {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
            },
            next: { revalidate: 600 }, // 10 minutes
        })

        if (!response.ok) {
            throw new WeatherAPIErrorClass(
                'ENV_DATA_ERROR',
                `Failed to fetch environmental data: ${response.statusText}`,
                response.status
            )
        }

        const data: EnvironmentalResponse = await response.json()

        // Cache the result
        setToCache(cacheKey, data)

        return data
    } catch (error) {
        if (error instanceof WeatherAPIErrorClass) {
            throw error
        }
        throw new WeatherAPIErrorClass(
            'ENV_FETCH_ERROR',
            `Error fetching environmental data: ${error instanceof Error ? error.message : 'Unknown error'}`,
            undefined,
            { originalError: error }
        )
    }
}

// ============================================================
// Data Transformation Functions
// ============================================================

/**
 * Transform hourly data from API response
 */
function transformHourlyData(
    forecast: JMAForecastResponse,
    hoursToInclude: number = 24
): WeatherDataPoint[] {
    const hourly = forecast.hourly
    const count = Math.min(hoursToInclude, hourly.time.length)

    return Array.from({ length: count }, (_, index) => ({
        time: hourly.time[index],
        temperature: hourly.temperature_2m[index],
        humidity: hourly.relative_humidity_2m[index],
        pressure: hourly.pressure_msl[index],
        precipitation: hourly.precipitation[index],
        cloudCover: hourly.cloud_cover[index],
        windSpeed: hourly.wind_speed_10m[index],
        weatherCode: hourly.weather_code[index],
    }))
}

/**
 * Transform daily data from both API responses
 */
function transformDailyData(
    forecast: JMAForecastResponse,
    environment: EnvironmentalResponse
): DailyWeatherSummary[] {
    const daily = forecast.daily
    const envDaily = environment.daily

    return Array.from({ length: daily.time.length }, (_, index) => ({
        date: daily.time[index],
        temperatureMax: daily.temperature_2m_max[index],
        temperatureMin: daily.temperature_2m_min[index],
        precipitationSum: daily.precipitation_sum[index],
        uvIndexMax: envDaily.uv_index_max[index],
        sunrise: envDaily.sunrise[index],
        sunset: envDaily.sunset[index],
        weatherCode: daily.weather_code[index],
    }))
}

// ============================================================
// Main Service Function
// ============================================================

/**
 * Get combined weather data for a location
 * Combines JMA forecast + environmental data
 */
export async function getWeatherData(
    locationCoordinates: LocationCoordinates,
    options?: {
        includeHourly?: boolean
        hourlyCount?: number
    }
): Promise<CombinedWeatherData> {
    const { includeHourly = true, hourlyCount = 24 } = options || {}

    try {
        // Fetch all data sources in parallel
        const [forecast, environment, airQualityData, visibilityData] = await Promise.all([
            fetchJMAForecast(locationCoordinates.latitude, locationCoordinates.longitude),
            fetchEnvironmentalData(locationCoordinates.latitude, locationCoordinates.longitude),
            fetchAirQualityData(locationCoordinates.latitude, locationCoordinates.longitude),
            fetchVisibilityData(locationCoordinates.latitude, locationCoordinates.longitude),
        ])

        // Transform and combine data
        const hourly = includeHourly
            ? transformHourlyData(forecast, hourlyCount)
            : []

        const daily = transformDailyData(forecast, environment)

        // Extract air quality data
        let airQuality = null
        if (airQualityData && airQualityData.hourly && airQualityData.hourly.pm2_5) {
            const pm25 = airQualityData.hourly.pm2_5[0] || 0
            const { aqi, level } = calculateAQI(pm25)
            airQuality = {
                pm25,
                pm10: airQualityData.hourly.pm10?.[0] || 0,
                carbonMonoxide: airQualityData.hourly.carbon_monoxide?.[0] || 0,
                ozone: airQualityData.hourly.ozone?.[0] || 0,
                aqi,
                aqiLevel: level,
            }
        }

        // Extract visibility data
        let visibility = null
        if (visibilityData && visibilityData.visibility) {
            const visibilityM = visibilityData.visibility
            visibility = {
                value: visibilityM,
                valueKm: visibilityM / 1000,
            }
        }

        const combined: CombinedWeatherData = {
            location: locationCoordinates,
            timezone: forecast.timezone,
            lastUpdate: new Date().toISOString(),
            hourly,
            daily,
            airQuality,
            visibility,
            metadata: {
                elevation: forecast.elevation,
                utcOffset: forecast.utc_offset_seconds,
            },
        }

        return combined
    } catch (error) {
        if (error instanceof WeatherAPIErrorClass) {
            throw error
        }
        throw new WeatherAPIErrorClass(
            'COMBINED_DATA_ERROR',
            'Failed to fetch combined weather data',
            undefined,
            { originalError: error }
        )
    }
}

/**
 * Get weather data for multiple locations
 */
export async function getWeatherDataForMultipleLocations(
    locations: LocationCoordinates[],
    options?: {
        parallel?: boolean
    }
): Promise<CombinedWeatherData[]> {
    const { parallel = true } = options || {}

    if (parallel) {
        return Promise.all(locations.map((loc) => getWeatherData(loc)))
    } else {
        const results = []
        for (const location of locations) {
            results.push(await getWeatherData(location))
        }
        return results
    }
}

/**
 * Clear all weather cache
 */
export function clearWeatherCache(): void {
    weatherCache.clear()
    console.log('Weather cache cleared')
}

/**
 * Get cache stats for debugging
 */
export function getCacheStats(): {
    size: number
    entries: Array<{
        key: string
        age: number
        ttl: number
    }>
} {
    const now = Date.now()
    const entries = Array.from(weatherCache.entries()).map(([key, entry]) => ({
        key,
        age: now - entry.timestamp,
        ttl: entry.ttl,
    }))

    return {
        size: weatherCache.size,
        entries,
    }
}

// ============================================================
// Error Handling Utility
// ============================================================

export function handleWeatherAPIError(error: unknown): ApiResponse<never> {
    let apiError: WeatherAPIErrorClass

    if (error instanceof WeatherAPIErrorClass) {
        apiError = error
    } else if (error instanceof Error) {
        apiError = new WeatherAPIErrorClass('UNKNOWN_ERROR', error.message)
    } else {
        apiError = new WeatherAPIErrorClass('UNKNOWN_ERROR', 'An unknown error occurred')
    }

    return {
        success: false,
        error: {
            code: apiError.code,
            message: apiError.message,
            details: apiError.details,
        },
        timestamp: new Date().toISOString(),
    }
}
