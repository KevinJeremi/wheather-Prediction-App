/**
 * Enhanced Weather Context Chat
 * AI integration with weather context for better understanding
 */

import type { ConversationHistory, AIMessage } from '@/types/ai.types'
import { chat as baseChat } from '@/services/groqService'

/**
 * Enhanced chat function that sends weather context to AI
 * So AI better understands the user's weather situation
 */
export async function chatWithWeatherContext(
    userMessage: string,
    conversationHistory: ConversationHistory,
    weatherContext?: {
        location?: string
        temperature?: number
        condition?: string
        humidity?: number
        windSpeed?: number
        pressure?: number
        uvIndex?: number
        precipitationProbability?: number
        visibility?: number
        airQuality?: {
            aqi: number
            aqiLevel: string
            pm25: number
        }
        sunrise?: string
        sunset?: string
        maxTemp?: number
        minTemp?: number
        timezone?: string
        lastUpdate?: string
    }
): Promise<{ success: boolean; content?: string; error?: { message: string } }> {
    try {
        // If weather context exists, add it as system context
        let enhancedMessage = userMessage

        if (weatherContext) {
            const weatherInfo = buildWeatherContextString(weatherContext)
            enhancedMessage = `${userMessage}\n\n${weatherInfo}`
        }

        // Call original chat function with enhanced message
        const result = await baseChat(enhancedMessage, conversationHistory)

        return result
    } catch (error) {
        console.error('Chat with weather context failed:', error)
        return {
            success: false,
            error: {
                message: error instanceof Error ? error.message : 'Chat failed'
            }
        }
    }
}

/**
 * Build a structured weather context string for AI
 */
function buildWeatherContextString(weatherContext: {
    location?: string
    temperature?: number
    condition?: string
    humidity?: number
    windSpeed?: number
    pressure?: number
    uvIndex?: number
    precipitationProbability?: number
    visibility?: number
    airQuality?: {
        aqi: number
        aqiLevel: string
        pm25: number
    }
    sunrise?: string
    sunset?: string
    maxTemp?: number
    minTemp?: number
    timezone?: string
    lastUpdate?: string
}): string {
    const lines: string[] = ['[REAL-TIME WEATHER CONTEXT]']

    if (weatherContext.location) {
        lines.push(`📍 Location: ${weatherContext.location}`)
    }

    if (weatherContext.temperature !== undefined) {
        lines.push(`🌡️ Current Temperature: ${weatherContext.temperature}°C`)
    }

    if (weatherContext.condition) {
        lines.push(`☁️ Condition: ${weatherContext.condition}`)
    }

    if (weatherContext.humidity !== undefined) {
        lines.push(`💧 Humidity: ${weatherContext.humidity}%`)
    }

    if (weatherContext.windSpeed !== undefined) {
        lines.push(`💨 Wind Speed: ${weatherContext.windSpeed} km/h`)
    }

    if (weatherContext.pressure !== undefined) {
        lines.push(`🔽 Pressure: ${weatherContext.pressure} mb`)
    }

    if (weatherContext.uvIndex !== undefined) {
        const uvLevel = getUVLevel(weatherContext.uvIndex)
        lines.push(`☀️ UV Index: ${weatherContext.uvIndex} (${uvLevel})`)
    }

    if (weatherContext.precipitationProbability !== undefined) {
        lines.push(`🌧️ Precipitation Probability: ${weatherContext.precipitationProbability}%`)
    }

    if (weatherContext.visibility !== undefined) {
        lines.push(`👁️ Visibility: ${weatherContext.visibility} km`)
    }

    if (weatherContext.airQuality) {
        lines.push(`🌍 Air Quality: AQI ${weatherContext.airQuality.aqi} (${weatherContext.airQuality.aqiLevel}), PM2.5: ${weatherContext.airQuality.pm25} µg/m³`)
    }

    if (weatherContext.sunrise && weatherContext.sunset) {
        lines.push(`🌅 Sunrise: ${weatherContext.sunrise} | 🌇 Sunset: ${weatherContext.sunset}`)
    }

    if (weatherContext.maxTemp !== undefined && weatherContext.minTemp !== undefined) {
        lines.push(`📊 Today's Range: ${weatherContext.maxTemp}°C (Max) - ${weatherContext.minTemp}°C (Min)`)
    }

    if (weatherContext.timezone) {
        lines.push(`🕐 Timezone: ${weatherContext.timezone}`)
    }

    if (weatherContext.lastUpdate) {
        lines.push(`⏰ Last Update: ${new Date(weatherContext.lastUpdate).toLocaleString('en-US')}`)
    }

    lines.push('[END CONTEXT]')

    return lines.join('\n')
}

/**
 * Tentukan level UV berdasarkan index
 */
function getUVLevel(uvIndex: number): string {
    if (uvIndex < 3) return 'Low'
    if (uvIndex < 6) return 'Moderate'
    if (uvIndex < 8) return 'High'
    if (uvIndex < 11) return 'Very High'
    return 'Extreme'
}

/**
 * Analyze weather data dan generate insights untuk AI
 */
export function analyzeWeatherForAI(weatherData: any) {
    const current = weatherData.hourly?.[0]
    const today = weatherData.daily?.[0]
    const tomorrow = weatherData.daily?.[1]

    if (!current || !today) {
        return null
    }

    const analysis = {
        currentTemperature: current.temperature,
        temperatureStatus: getTemperatureStatus(current.temperature),
        humidity: current.humidity,
        humidityStatus: getHumidityStatus(current.humidity),
        windSpeed: current.windSpeed,
        windStatus: getWindStatus(current.windSpeed),
        condition: getWeatherConditionDescription(current.weatherCode),
        uvIndex: today.uvIndexMax,
        uvStatus: getUVLevel(today.uvIndexMax),
        precipitation: today.precipitationSum,
        precipitationTrend: calculatePrecipitationTrend(today, tomorrow),
        airQuality: weatherData.airQuality ? {
            aqi: weatherData.airQuality.aqi,
            level: weatherData.airQuality.aqiLevel,
            description: getAQIDescription(weatherData.airQuality.aqi)
        } : null,
        visibilityStatus: getVisibilityStatus(weatherData.visibility?.valueKm || 10)
    }

    return analysis
}

/**
 * Get temperature status description
 */
function getTemperatureStatus(temp: number): string {
    if (temp >= 30) return 'Hot (Very Warm)'
    if (temp >= 25) return 'Warm'
    if (temp >= 15) return 'Cool/Moderate'
    if (temp >= 5) return 'Cold'
    return 'Very Cold'
}

/**
 * Get humidity status
 */
function getHumidityStatus(humidity: number): string {
    if (humidity >= 80) return 'Very High (Uncomfortable)'
    if (humidity >= 60) return 'High (Humid)'
    if (humidity >= 40) return 'Moderate (Comfortable)'
    if (humidity >= 20) return 'Low (Dry)'
    return 'Very Low (Very Dry)'
}

/**
 * Get wind status
 */
function getWindStatus(windSpeed: number): string {
    if (windSpeed >= 50) return 'Very Strong (Dangerous)'
    if (windSpeed >= 40) return 'Strong (Be Careful)'
    if (windSpeed >= 25) return 'Moderate (Noticeable)'
    if (windSpeed >= 10) return 'Light'
    return 'Calm'
}

/**
 * Get weather condition from code
 */
function getWeatherConditionDescription(code: number): string {
    const conditions: Record<number, string> = {
        0: 'Clear Sky',
        1: 'Mainly Clear',
        2: 'Partly Cloudy',
        3: 'Overcast',
        45: 'Foggy',
        48: 'Depositing Rime Fog',
        51: 'Light Drizzle',
        53: 'Moderate Drizzle',
        55: 'Dense Drizzle',
        61: 'Slight Rain',
        63: 'Moderate Rain',
        65: 'Heavy Rain',
        71: 'Slight Snow',
        73: 'Moderate Snow',
        75: 'Heavy Snow',
        77: 'Snow Grains',
        80: 'Slight Rain Showers',
        81: 'Moderate Rain Showers',
        82: 'Violent Rain Showers',
        85: 'Slight Snow Showers',
        86: 'Heavy Snow Showers',
        95: 'Thunderstorm',
        96: 'Thunderstorm with Slight Hail',
        99: 'Thunderstorm with Heavy Hail',
    }
    return conditions[code] || `Weather Code: ${code}`
}

/**
 * Get AQI description
 */
function getAQIDescription(aqi: number): string {
    if (aqi <= 50) return 'Good - Air quality is satisfactory'
    if (aqi <= 100) return 'Moderate - Air quality is acceptable'
    if (aqi <= 150) return 'Unhealthy for Sensitive Groups - Members of sensitive groups may experience health effects'
    if (aqi <= 200) return 'Unhealthy - Some members of the general public may experience health effects'
    if (aqi <= 300) return 'Very Unhealthy - Health alert: The risk of health effects is increased for everyone'
    return 'Hazardous - Health alert: The entire population is more likely to be affected'
}

/**
 * Get visibility status
 */
function getVisibilityStatus(visibilityKm: number): string {
    if (visibilityKm >= 10) return 'Excellent (>10 km)'
    if (visibilityKm >= 5) return 'Good (5-10 km)'
    if (visibilityKm >= 2) return 'Moderate (2-5 km)'
    if (visibilityKm >= 1) return 'Poor (1-2 km)'
    return 'Very Poor (<1 km)'
}

/**
 * Calculate precipitation trend
 */
function calculatePrecipitationTrend(today: any, tomorrow?: any): string {
    if (!tomorrow) return 'Unknown'

    const todayPrecip = today.precipitationSum || 0
    const tomorrowPrecip = tomorrow.precipitationSum || 0

    const percentageChange = todayPrecip > 0
        ? ((tomorrowPrecip - todayPrecip) / todayPrecip) * 100
        : 0

    if (percentageChange > 20) return 'Increasing (more rain expected)'
    if (percentageChange < -20) return 'Decreasing (less rain expected)'
    return 'Stable (similar conditions expected)'
}

