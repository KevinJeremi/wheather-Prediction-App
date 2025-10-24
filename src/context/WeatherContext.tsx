'use client'

import React, { createContext, useContext, ReactNode } from 'react'
import type { CombinedWeatherData, LocationCoordinates } from '@/types/weather.types'

/**
 * Weather Context untuk menyimpan & share semua weather data ke seluruh app
 * Terutama untuk AI Assistant agar mengerti context cuaca saat ini
 */

interface WeatherContextType {
    // Lokasi aktif saat ini
    activeLocation: LocationCoordinates | null

    // Data cuaca untuk lokasi aktif
    weatherData: CombinedWeatherData | null

    // Status loading
    isLoading: boolean
    isWeatherLoading: boolean
    isGeoLoading: boolean

    // Errors
    weatherError: any | null
    geoError: string | null

    // Saved locations
    savedLocations: LocationCoordinates[]

    // Dark mode
    isDark: boolean

    // Additional metadata untuk AI
    aiContext: {
        currentCondition: string
        temperatureStatus: 'hot' | 'warm' | 'cool' | 'cold'
        precipitationTrend: 'increasing' | 'stable' | 'decreasing'
        lastUpdateTime: string
    } | null
}

const WeatherContext = createContext<WeatherContextType | undefined>(undefined)

interface WeatherProviderProps {
    children: ReactNode
    value: WeatherContextType
}

/**
 * Provider untuk wrap aplikasi
 */
export function WeatherProvider({ children, value }: WeatherProviderProps) {
    return (
        <WeatherContext.Provider value={value}>
            {children}
        </WeatherContext.Provider>
    )
}

/**
 * Hook untuk mengakses weather context
 * Sekarang dengan optional fallback jika tidak dalam provider
 */
export function useWeatherContext() {
    const context = useContext(WeatherContext)
    // Don't throw error, return null if not in provider
    // This allows components to handle gracefully
    if (context === undefined) {
        console.warn('⚠️ useWeatherContext called outside WeatherProvider. Returning null.')
        return null as any
    }
    return context
}

/**
 * Hook untuk mendapatkan AI context summary
 * Lebih ringkas untuk dikirim ke AI
 */
export function useWeatherContextSummary() {
    const context = useWeatherContext()

    if (!context.weatherData) {
        return null
    }

    const current = context.weatherData.hourly[0]
    const today = context.weatherData.daily[0]

    return {
        location: context.activeLocation?.name || 'Unknown',
        latitude: context.activeLocation?.latitude || 0,
        longitude: context.activeLocation?.longitude || 0,
        temperature: current.temperature,
        condition: context.aiContext?.currentCondition || 'Unknown',
        humidity: current.humidity,
        windSpeed: current.windSpeed,
        pressure: current.pressure,
        uvIndex: today.uvIndexMax,
        precipitationProbability: Math.round((today.precipitationSum / 50) * 100),
        sunrise: today.sunrise,
        sunset: today.sunset,
        feelsLike: current.temperature, // Can be calculated if needed
        visibility: context.weatherData.visibility?.valueKm || 10,
        cloudCover: current.cloudCover,
        airQuality: context.weatherData.airQuality ? {
            aqi: context.weatherData.airQuality.aqi,
            aqiLevel: context.weatherData.airQuality.aqiLevel,
            pm25: context.weatherData.airQuality.pm25
        } : null,
        lastUpdate: context.weatherData.lastUpdate,
        timezone: context.weatherData.timezone,
    }
}

/**
 * Hook untuk mendapatkan full detailed context untuk AI
 * Sekarang dengan optional fallback
 */
export function useWeatherDetailedContext() {
    const context = useWeatherContext()

    // Return null if context tidak available
    if (!context || !context.weatherData) {
        return null
    }

    const current = context.weatherData.hourly[0]
    const today = context.weatherData.daily[0]
    const tomorrow = context.weatherData.daily[1]

    return {
        // Current conditions
        current: {
            location: context.activeLocation?.name || 'Unknown',
            coordinates: {
                latitude: context.activeLocation?.latitude || 0,
                longitude: context.activeLocation?.longitude || 0,
            },
            temperature: current.temperature,
            humidity: current.humidity,
            windSpeed: current.windSpeed,
            windDirection: 0, // Will add if available
            pressure: current.pressure,
            cloudCover: current.cloudCover,
            precipitation: current.precipitation,
            weatherCode: current.weatherCode,
            weatherDescription: context.aiContext?.currentCondition || 'Unknown',
            feelsLike: current.temperature,
            visibility: context.weatherData.visibility?.valueKm || 10,
            time: new Date().toISOString(),
        },

        // Today's forecast
        today: {
            maxTemperature: today.temperatureMax,
            minTemperature: today.temperatureMin,
            precipitation: today.precipitationSum,
            precipitationProbability: Math.round((today.precipitationSum / 50) * 100),
            uvIndex: today.uvIndexMax,
            sunrise: today.sunrise,
            sunset: today.sunset,
            weatherCode: today.weatherCode,
            date: today.date,
        },

        // Tomorrow's forecast (if available)
        tomorrow: tomorrow ? {
            maxTemperature: tomorrow.temperatureMax,
            minTemperature: tomorrow.temperatureMin,
            precipitation: tomorrow.precipitationSum,
            precipitationProbability: Math.round((tomorrow.precipitationSum / 50) * 100),
            uvIndex: tomorrow.uvIndexMax,
            weatherCode: tomorrow.weatherCode,
            date: tomorrow.date,
        } : null,

        // Hourly forecast (next 24 hours)
        hourlyForecast: context.weatherData.hourly.slice(0, 24).map((hour: any) => ({
            time: hour.time,
            temperature: hour.temperature,
            precipitation: hour.precipitation,
            windSpeed: hour.windSpeed,
            weatherCode: hour.weatherCode,
        })),

        // Daily forecast (7 days)
        dailyForecast: context.weatherData.daily.slice(0, 7).map((day: any) => ({
            date: day.date,
            maxTemp: day.temperatureMax,
            minTemp: day.temperatureMin,
            precipitation: day.precipitationSum,
            uvIndex: day.uvIndexMax,
            weatherCode: day.weatherCode,
        })),

        // Air quality
        airQuality: context.weatherData.airQuality ? {
            aqi: context.weatherData.airQuality.aqi,
            aqiLevel: context.weatherData.airQuality.aqiLevel,
            pm25: context.weatherData.airQuality.pm25,
            pm10: context.weatherData.airQuality.pm10,
            carbonMonoxide: context.weatherData.airQuality.carbonMonoxide,
            ozone: context.weatherData.airQuality.ozone,
        } : null,

        // Metadata
        metadata: {
            timezone: context.weatherData.timezone,
            elevation: context.weatherData.metadata?.elevation || 0,
            lastUpdate: context.weatherData.lastUpdate,
            dataSource: 'Open-Meteo API',
        },

        // AI Analysis context
        analysis: {
            temperatureStatus: context.aiContext?.temperatureStatus || 'warm',
            precipitationTrend: context.aiContext?.precipitationTrend || 'stable',
            isDarkMode: context.isDark,
        }
    }
}

