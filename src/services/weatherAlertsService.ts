/**
 * Weather Alerts Service
 * Generate smart alerts from weather data using AI (Groq)
 */

import type { CombinedWeatherData } from '@/types/weather.types'
import { chat } from './groqService'
import type { ConversationHistory } from '@/types/ai.types'

export interface WeatherAlert {
    id: string
    type: 'rain' | 'wind' | 'uv' | 'temp' | 'humidity' | 'general'
    title: string
    message: string
    severity: 'low' | 'moderate' | 'high'
    dismissible: boolean
    aiGenerated: boolean
    timestamp: string
}

/**
 * Generate smart weather alerts from weather data
 * Use AI for analysis and alert generation
 */
export async function generateWeatherAlerts(
    weatherData: CombinedWeatherData,
    location: string
): Promise<WeatherAlert[]> {
    try {
        const alerts: WeatherAlert[] = []

        // Extract key weather data
        const current = weatherData.hourly[0]
        const today = weatherData.daily[0]
        const tomorrow = weatherData.daily[1]

        // Check current conditions
        const checkResults = {
            rainProbability: today.precipitationSum > 0,
            highUV: today.uvIndexMax > 6,
            highWindSpeed: current.windSpeed > 30,
            extremeTemp: current.temperature > 35 || current.temperature < 0,
            highHumidity: current.humidity > 80,
        }

        // Build context for AI
        const weatherContext = `
Location: ${location}
Current Temperature: ${current.temperature}°C
Condition: ${getWeatherConditionText(current.weatherCode)}
Humidity: ${current.humidity}%
Wind Speed: ${current.windSpeed} km/h
Rain Probability Today: ${today.precipitationSum}mm
UV Index: ${today.uvIndexMax}
High Temperature: ${today.temperatureMax}°C
Low Temperature: ${today.temperatureMin}°C
Tomorrow's Forecast: ${getWeatherConditionText(tomorrow.weatherCode)} with temperatures ${tomorrow.temperatureMin}°C - ${tomorrow.temperatureMax}°C
    `.trim()

        // Check rain probability
        if (checkResults.rainProbability) {
            const rainContext = `
Rain is expected at ${today.precipitationSum}mm today.
Condition: ${getWeatherConditionText(current.weatherCode)}
${current.windSpeed > 20 ? 'With strong wind speed.' : ''}
      `.trim()

            const rainAlert = await generateAlertFromAI(
                'rain',
                rainContext,
                weatherContext
            )
            if (rainAlert) {
                alerts.push(rainAlert)
            }
        }

        // Check UV index
        if (checkResults.highUV) {
            const uvContext = `
UV index during midday will reach ${today.uvIndexMax} (high).
Temperature will reach ${today.temperatureMax}°C.
Weather condition: ${getWeatherConditionText(current.weatherCode)}
      `.trim()

            const uvAlert = await generateAlertFromAI(
                'uv',
                uvContext,
                weatherContext
            )
            if (uvAlert) {
                alerts.push(uvAlert)
            }
        }

        // Check wind speed
        if (checkResults.highWindSpeed) {
            const windContext = `
Strong wind is expected at ${current.windSpeed} km/h.
Rain: ${today.precipitationSum}mm
Condition: ${getWeatherConditionText(current.weatherCode)}
      `.trim()

            const windAlert = await generateAlertFromAI(
                'wind',
                windContext,
                weatherContext
            )
            if (windAlert) {
                alerts.push(windAlert)
            }
        }

        // Check extreme temperature
        if (checkResults.extremeTemp) {
            const tempContext = `
Extreme temperature expected: ${current.temperature}°C
High: ${today.temperatureMax}°C
Condition: ${getWeatherConditionText(current.weatherCode)}
      `.trim()

            const tempAlert = await generateAlertFromAI(
                'temp',
                tempContext,
                weatherContext
            )
            if (tempAlert) {
                alerts.push(tempAlert)
            }
        }

        // Check high humidity
        if (checkResults.highHumidity) {
            const humidityContext = `
High humidity reaching ${current.humidity}%
Temperature: ${current.temperature}°C
Condition: ${getWeatherConditionText(current.weatherCode)}
      `.trim()

            const humidityAlert = await generateAlertFromAI(
                'humidity',
                humidityContext,
                weatherContext
            )
            if (humidityAlert) {
                alerts.push(humidityAlert)
            }
        }

        return alerts
    } catch (error) {
        console.error('Error generating weather alerts:', error)
        // Return basic alerts if AI generation fails
        return generateBasicAlerts(weatherData, location)
    }
}

/**
 * Generate single alert using AI
 */
async function generateAlertFromAI(
    alertType: string,
    specifics: string,
    generalContext: string
): Promise<WeatherAlert | null> {
    try {
        const prompt = `
Create a concise and informative weather alert for the following situation:

Alert Type: ${alertType}
Specific Details: ${specifics}

General Weather Context:
${generalContext}

Response format MUST be JSON like this (WITHOUT markdown):
{
  "title": "Alert title (max 30 characters)",
  "message": "Detail message (max 100 characters)",
  "severity": "low|moderate|high"
}

IMPORTANT: Only provide JSON, without any additional explanation.
    `.trim()

        const historyRef: ConversationHistory = [
            {
                role: 'user',
                content: prompt,
                timestamp: new Date().toISOString(),
            },
        ]

        const result = await chat(prompt, historyRef)

        if (!result.success || !result.content) {
            return null
        }

        // Parse JSON from response
        const jsonMatch = result.content.match(/\{[\s\S]*\}/)
        if (!jsonMatch) {
            return null
        }

        const alertData = JSON.parse(jsonMatch[0])

        return {
            id: `${alertType}-${Date.now()}`,
            type: alertType as any,
            title: alertData.title || 'Weather Alert',
            message: alertData.message || '',
            severity: alertData.severity || 'moderate',
            dismissible: true,
            aiGenerated: true,
            timestamp: new Date().toISOString(),
        }
    } catch (error) {
        console.error(`Error generating ${alertType} alert:`, error)
        return null
    }
}

/**
 * Generate basic alerts if AI is not available
 */
function generateBasicAlerts(weatherData: CombinedWeatherData, location: string): WeatherAlert[] {
    const alerts: WeatherAlert[] = []
    const current = weatherData.hourly[0]
    const today = weatherData.daily[0]

    // Rain alert
    if (today.precipitationSum > 0) {
        alerts.push({
            id: `rain-${Date.now()}`,
            type: 'rain',
            title: 'Light Rain Expected',
            message: `Light precipitation expected in the next 2 hours (${today.precipitationSum}mm)`,
            severity: today.precipitationSum > 10 ? 'high' : 'moderate',
            dismissible: true,
            aiGenerated: false,
            timestamp: new Date().toISOString(),
        })
    }

    // UV alert
    if (today.uvIndexMax > 6) {
        alerts.push({
            id: `uv-${Date.now()}`,
            type: 'uv',
            title: 'High UV Index',
            message: 'UV levels will be high today. Remember to wear sunscreen',
            severity: today.uvIndexMax > 8 ? 'high' : 'moderate',
            dismissible: true,
            aiGenerated: false,
            timestamp: new Date().toISOString(),
        })
    }

    // Wind alert
    if (current.windSpeed > 30) {
        alerts.push({
            id: `wind-${Date.now()}`,
            type: 'wind',
            title: 'Strong Wind Warning',
            message: `Strong winds expected at ${current.windSpeed} km/h. Stay cautious outdoors.`,
            severity: current.windSpeed > 50 ? 'high' : 'moderate',
            dismissible: true,
            aiGenerated: false,
            timestamp: new Date().toISOString(),
        })
    }

    return alerts
}

/**
 * Get weather condition text dari weather code
 */
function getWeatherConditionText(weatherCode: number): string {
    if (weatherCode <= 3) return 'Clear'
    if (weatherCode <= 48) return 'Cloudy'
    if (weatherCode <= 55) return 'Drizzle'
    if (weatherCode <= 65) return 'Rainy'
    if (weatherCode <= 77) return 'Snowy'
    if (weatherCode <= 82) return 'Showers'
    if (weatherCode <= 99) return 'Thunderstorm'
    return 'Unknown'
}

/**
 * Generate daily AI summary from weather data
 */
export async function generateDailyAISummary(
    weatherData: CombinedWeatherData,
    location: string
): Promise<string> {
    try {
        const current = weatherData.hourly[0]
        const today = weatherData.daily[0]

        const weatherContext = `
Location: ${location}
Current Temperature: ${current.temperature}°C
Condition: ${getWeatherConditionText(current.weatherCode)}
Humidity: ${current.humidity}%
Wind Speed: ${current.windSpeed} km/h
Rain Probability: ${today.precipitationSum}mm
High Temperature: ${today.temperatureMax}°C
Low Temperature: ${today.temperatureMin}°C
Pressure: ${current.pressure} hPa
    `.trim()

        const prompt = `
Create a concise and informative weather summary for ${location}:

${weatherContext}

Summary must:
- Be brief (1-2 sentences)
- Describe current conditions and today's forecast
- Be informative and easy to understand
- Be in English language only
    `.trim()

        const result = await chat(prompt)

        if (result.success && result.content) {
            return result.content
        }

        // Fallback if AI fails
        return `Currently ${getWeatherConditionText(current.weatherCode).toLowerCase()} with temperature at ${current.temperature.toFixed(1)}°C. Today's high will be ${today.temperatureMax}°C with ${today.precipitationSum.toFixed(1)}mm expected rain. Humidity is at ${current.humidity}% and wind speed is ${current.windSpeed.toFixed(1)} km/h.`
    } catch (error) {
        console.error('Error generating daily AI summary:', error)
        // Return basic summary
        const current = weatherData.hourly[0]
        const today = weatherData.daily[0]
        return `Currently ${getWeatherConditionText(current.weatherCode).toLowerCase()} with temperature at ${current.temperature.toFixed(1)}°C. Today's high will be ${today.temperatureMax}°C with ${today.precipitationSum.toFixed(1)}mm expected rain. Humidity is at ${current.humidity}% and wind speed is ${current.windSpeed.toFixed(1)} km/h.`
    }
}
