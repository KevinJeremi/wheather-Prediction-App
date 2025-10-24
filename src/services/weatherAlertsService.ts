/**
 * Weather Alerts Service
 * Generate smart alerts dari data cuaca menggunakan AI (Groq)
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
 * Generate smart weather alerts dari data cuaca
 * Gunakan AI untuk analisis dan alert generation
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

        // Build context untuk AI
        const weatherContext = `
Lokasi: ${location}
Suhu saat ini: ${current.temperature}°C
Kondisi: ${getWeatherConditionText(current.weatherCode)}
Kelembaban: ${current.humidity}%
Kecepatan Angin: ${current.windSpeed} km/h
Probabilitas Curah Hujan Hari Ini: ${today.precipitationSum}mm
Indeks UV: ${today.uvIndexMax}
Suhu Tertinggi: ${today.temperatureMax}°C
Suhu Terendah: ${today.temperatureMin}°C
Prakiraan Besok: ${getWeatherConditionText(tomorrow.weatherCode)} dengan suhu ${tomorrow.temperatureMin}°C - ${tomorrow.temperatureMax}°C
    `.trim()

        // Check rain probability
        if (checkResults.rainProbability) {
            const rainContext = `
Curah hujan diperkirakan ${today.precipitationSum}mm hari ini.
Kondisi: ${getWeatherConditionText(current.weatherCode)}
${current.windSpeed > 20 ? 'Dengan kecepatan angin yang cukup kuat.' : ''}
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
Indeks UV siang hari akan mencapai ${today.uvIndexMax} (tinggi).
Suhu akan mencapai ${today.temperatureMax}°C.
Kondisi cuaca: ${getWeatherConditionText(current.weatherCode)}
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
Kecepatan angin tinggi diperkirakan ${current.windSpeed} km/h.
Curah hujan: ${today.precipitationSum}mm
Kondisi: ${getWeatherConditionText(current.weatherCode)}
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
Suhu ekstrem diperkirakan: ${current.temperature}°C
Suhu tertinggi: ${today.temperatureMax}°C
Kondisi: ${getWeatherConditionText(current.weatherCode)}
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
Kelembaban udara tinggi mencapai ${current.humidity}%
Suhu: ${current.temperature}°C
Kondisi: ${getWeatherConditionText(current.weatherCode)}
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
 * Generate single alert menggunakan AI
 */
async function generateAlertFromAI(
    alertType: string,
    specifics: string,
    generalContext: string
): Promise<WeatherAlert | null> {
    try {
        const prompt = `
Buatkan alert cuaca singkat dan informatif untuk situasi berikut:

Jenis Alert: ${alertType}
Detail Spesifik: ${specifics}

Konteks Umum Cuaca:
${generalContext}

Format respons HARUS berupa JSON seperti ini (TANPA markdown):
{
  "title": "Judul alert (max 30 karakter)",
  "message": "Pesan detail (max 100 karakter)",
  "severity": "low|moderate|high"
}

PENTING: Hanya berikan JSON, tanpa penjelasan tambahan.
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

        // Parse JSON dari response
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
 * Generate basic alerts jika AI tidak tersedia
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
 * Generate daily AI summary dari weather data
 */
export async function generateDailyAISummary(
    weatherData: CombinedWeatherData,
    location: string
): Promise<string> {
    try {
        const current = weatherData.hourly[0]
        const today = weatherData.daily[0]

        const weatherContext = `
Lokasi: ${location}
Suhu saat ini: ${current.temperature}°C
Kondisi: ${getWeatherConditionText(current.weatherCode)}
Kelembaban: ${current.humidity}%
Kecepatan Angin: ${current.windSpeed} km/h
Probabilitas Curah Hujan: ${today.precipitationSum}mm
Suhu Tertinggi: ${today.temperatureMax}°C
Suhu Terendah: ${today.temperatureMin}°C
Tekanan: ${current.pressure} hPa
    `.trim()

        const prompt = `
Buatkan ringkasan cuaca singkat dan informatif untuk ${location}:

${weatherContext}

Ringkasan harus:
- Singkat (1-2 kalimat)
- Menggambarkan kondisi saat ini dan prakiraan hari ini
- Informatif dan mudah dipahami
- Dalam bahasa Indonesia
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
