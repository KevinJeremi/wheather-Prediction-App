/**
 * GET /api/weather/forecast
 * Endpoint untuk mendapatkan forecast cuaca
 * 
 * Query Parameters:
 * - lat: latitude (required)
 * - lon: longitude (required)
 * - name: location name (optional)
 * - hourly: include hourly data (default: true)
 * - hourlyCount: number of hours to include (default: 24)
 * 
 * Example:
 * GET /api/weather/forecast?lat=-1.169&lon=124.730&name=Motoling&hourly=true&hourlyCount=48
 */

import { NextRequest, NextResponse } from 'next/server'
import { getWeatherData } from '@/services/weatherService'
import { handleWeatherAPIError } from '@/services/weatherService'
import type { ApiResponse, CombinedWeatherData, LocationCoordinates } from '@/types/weather.types'

export async function GET(request: NextRequest) {
    try {
        // Get query parameters
        const searchParams = request.nextUrl.searchParams
        const latitude = searchParams.get('lat')
        const longitude = searchParams.get('lon')
        const locationName = searchParams.get('name') || 'Unknown'
        const includeHourly = searchParams.get('hourly') !== 'false'
        const hourlyCount = parseInt(searchParams.get('hourlyCount') || '24', 10)

        // Validate required parameters
        if (!latitude || !longitude) {
            return NextResponse.json(
                {
                    success: false,
                    error: {
                        code: 'INVALID_REQUEST',
                        message: 'Missing required parameters: lat and lon',
                    },
                    timestamp: new Date().toISOString(),
                } as ApiResponse<never>,
                { status: 400 }
            )
        }

        // Parse and validate coordinates
        const lat = parseFloat(latitude)
        const lon = parseFloat(longitude)

        if (isNaN(lat) || isNaN(lon)) {
            return NextResponse.json(
                {
                    success: false,
                    error: {
                        code: 'INVALID_COORDINATES',
                        message: 'Latitude and longitude must be valid numbers',
                    },
                    timestamp: new Date().toISOString(),
                } as ApiResponse<never>,
                { status: 400 }
            )
        }

        if (lat < -90 || lat > 90 || lon < -180 || lon > 180) {
            return NextResponse.json(
                {
                    success: false,
                    error: {
                        code: 'INVALID_COORDINATES',
                        message: 'Latitude must be between -90 and 90, longitude between -180 and 180',
                    },
                    timestamp: new Date().toISOString(),
                } as ApiResponse<never>,
                { status: 400 }
            )
        }

        // Create location object
        const location: LocationCoordinates = {
            latitude: lat,
            longitude: lon,
            name: locationName,
        }

        // Fetch weather data
        const weatherData = await getWeatherData(location, {
            includeHourly,
            hourlyCount: Math.min(hourlyCount, 168), // Max 7 days
        })

        // Return successful response
        const response: ApiResponse<CombinedWeatherData> = {
            success: true,
            data: weatherData,
            timestamp: new Date().toISOString(),
        }

        return NextResponse.json(response, {
            status: 200,
            headers: {
                'Cache-Control': 'public, s-maxage=600, stale-while-revalidate=1200',
            },
        })
    } catch (error) {
        console.error('[API] Weather forecast error:', error)

        const errorResponse = handleWeatherAPIError(error)

        return NextResponse.json(errorResponse, {
            status: 500,
        })
    }
}

/**
 * OPTIONS handler for CORS preflight
 */
export async function OPTIONS(request: NextRequest) {
    return NextResponse.json(null, {
        status: 200,
        headers: {
            'Allow': 'GET, OPTIONS',
            'Access-Control-Allow-Methods': 'GET, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        },
    })
}
