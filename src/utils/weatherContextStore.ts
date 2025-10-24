/**
 * Weather Context Temp Store
 * Temporary store untuk pass weather data dari component ke groqService
 * tanpa perlu modify signature dari semua functions
 */

interface WeatherContextData {
    // Current weather
    temperature?: number
    humidity?: number
    windSpeed?: number
    pressure?: number
    condition?: string
    precipitation?: number
    cloudCover?: number
    uvIndex?: number
    visibility?: number

    // Forecast data
    forecast?: Array<{
        date?: string
        time?: string
        temp?: number
        minTemp?: number
        maxTemp?: number
        condition?: string
        precipitation?: number
    }>
}

let currentWeatherContext: WeatherContextData | null = null

export function setWeatherContext(data: WeatherContextData | null) {
    currentWeatherContext = data
    console.log('🌡️ [weatherContextStore] Weather context set:', {
        current: {
            temp: data?.temperature,
            humidity: data?.humidity,
            condition: data?.condition
        },
        forecast: data?.forecast ? `${data.forecast.length} items` : 'none'
    })
}

export function getWeatherContext(): WeatherContextData | null {
    return currentWeatherContext
}

export function clearWeatherContext() {
    currentWeatherContext = null
}
