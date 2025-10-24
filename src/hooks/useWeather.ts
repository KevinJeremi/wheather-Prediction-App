/**
 * useWeather Hook
 * Custom hook untuk fetching dan managing weather data
 */

'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import type { CombinedWeatherData, LocationCoordinates, WeatherAPIError } from '@/types/weather.types'

interface UseWeatherOptions {
    enabled?: boolean
    refetchInterval?: number
    onError?: (error: WeatherAPIError) => void
    includeHourly?: boolean
    hourlyCount?: number
}

interface UseWeatherReturn {
    data: CombinedWeatherData | null
    isLoading: boolean
    error: WeatherAPIError | null
    refetch: () => Promise<void>
    clearError: () => void
}

/**
 * Hook untuk fetch weather data dari API
 * 
 * Example:
 * ```tsx
 * const { data, isLoading, error } = useWeather(
 *   { latitude: -1.169, longitude: 124.730, name: 'Motoling' },
 *   { refetchInterval: 600000 }
 * )
 * ```
 */
export function useWeather(
    location: LocationCoordinates | null,
    options: UseWeatherOptions = {}
): UseWeatherReturn {
    const {
        enabled = true,
        refetchInterval = 10 * 60 * 1000, // 10 minutes default
        onError,
        includeHourly = true,
        hourlyCount = 24,
    } = options

    const [data, setData] = useState<CombinedWeatherData | null>(null)
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<WeatherAPIError | null>(null)

    const abortControllerRef = useRef<AbortController | null>(null)
    const refetchTimeoutRef = useRef<NodeJS.Timeout | null>(null)
    const onErrorRef = useRef(onError)
    const locationKeyRef = useRef<string>('')

    // Update onErrorRef when onError changes
    useEffect(() => {
        onErrorRef.current = onError
    }, [onError])

    // Generate location key to track changes
    const locationKey = location
        ? `${location.latitude}_${location.longitude}_${location.name}`
        : ''

    // Fetch weather data
    const fetchWeatherData = useCallback(async () => {
        if (!location || !enabled) return

        // Cancel previous request if it exists
        if (abortControllerRef.current) {
            abortControllerRef.current.abort()
        }

        abortControllerRef.current = new AbortController()
        setIsLoading(true)
        setError(null)

        try {
            const params = new URLSearchParams({
                lat: location.latitude.toString(),
                lon: location.longitude.toString(),
                name: location.name,
                hourly: includeHourly.toString(),
                hourlyCount: hourlyCount.toString(),
            })

            const response = await fetch(
                `/api/weather/forecast?${params.toString()}`,
                {
                    method: 'GET',
                    signal: abortControllerRef.current.signal,
                    headers: {
                        'Accept': 'application/json',
                    },
                }
            )

            if (!response.ok) {
                const errorData = await response.json()
                throw new Error(errorData.error?.message || `HTTP Error: ${response.status}`)
            }

            const result = await response.json()

            if (result.success && result.data) {
                setData(result.data)
                setError(null)
            } else {
                throw new Error(result.error?.message || 'Failed to fetch weather data')
            }
        } catch (err) {
            // Ignore abort errors
            if (err instanceof Error && err.name === 'AbortError') {
                return
            }

            const error = err instanceof Error ? err : new Error('Unknown error')
            setError(error as any) // Type assertion for simplicity
            onErrorRef.current?.(error as any)
            setData(null)
        } finally {
            setIsLoading(false)
        }
    }, [location, enabled, includeHourly, hourlyCount])

    // Fetch data when location changes
    useEffect(() => {
        // Check if location key changed
        if (locationKey !== locationKeyRef.current) {
            locationKeyRef.current = locationKey
            if (location && enabled) {
                fetchWeatherData()
            }
        }
    }, [locationKey, location, enabled, fetchWeatherData])

    // Setup refetch interval
    useEffect(() => {
        if (!location || !enabled || refetchInterval <= 0) return

        // Setup interval to refetch
        refetchTimeoutRef.current = setInterval(() => {
            fetchWeatherData()
        }, refetchInterval)

        // Cleanup
        return () => {
            if (refetchTimeoutRef.current) {
                clearInterval(refetchTimeoutRef.current)
            }
        }
    }, [refetchInterval, location, enabled, fetchWeatherData])

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (abortControllerRef.current) {
                abortControllerRef.current.abort()
            }
            if (refetchTimeoutRef.current) {
                clearInterval(refetchTimeoutRef.current)
            }
        }
    }, [])

    const clearError = useCallback(() => {
        setError(null)
    }, [])

    return {
        data,
        isLoading,
        error,
        refetch: fetchWeatherData,
        clearError,
    }
}

/**
 * Hook untuk fetch weather data untuk multiple locations
 */
export function useMultipleWeather(
    locations: LocationCoordinates[] | null,
    options: UseWeatherOptions = {}
) {
    const [dataMap, setDataMap] = useState<Map<string, CombinedWeatherData>>(new Map())
    const [isLoading, setIsLoading] = useState(false)
    const [errors, setErrors] = useState<Map<string, WeatherAPIError>>(new Map())

    const fetchAllLocations = useCallback(async () => {
        if (!locations || locations.length === 0) return

        setIsLoading(true)
        const newDataMap = new Map<string, CombinedWeatherData>()
        const newErrors = new Map<string, WeatherAPIError>()

        try {
            const promises = locations.map(async (location) => {
                try {
                    const params = new URLSearchParams({
                        lat: location.latitude.toString(),
                        lon: location.longitude.toString(),
                        name: location.name,
                        hourly: options.includeHourly !== false ? 'true' : 'false',
                        hourlyCount: (options.hourlyCount || 24).toString(),
                    })

                    const response = await fetch(`/api/weather/forecast?${params.toString()}`)
                    const result = await response.json()

                    if (result.success && result.data) {
                        const key = `${location.latitude}_${location.longitude}`
                        newDataMap.set(key, result.data)
                    }
                } catch (err) {
                    const key = `${location.latitude}_${location.longitude}`
                    newErrors.set(key, err as WeatherAPIError)
                }
            })

            await Promise.allSettled(promises)
        } finally {
            setDataMap(newDataMap)
            setErrors(newErrors)
            setIsLoading(false)
        }
    }, [options.includeHourly, options.hourlyCount])

    useEffect(() => {
        fetchAllLocations()
    }, [fetchAllLocations])

    return {
        dataMap,
        errors,
        isLoading,
        refetch: fetchAllLocations,
    }
}

/**
 * Hook untuk tracking geolocation dan fetching weather
 */
export function useWeatherForCurrentLocation(
    options: UseWeatherOptions = {}
) {
    const [location, setLocation] = useState<LocationCoordinates | null>(null)
    const [locationError, setLocationError] = useState<string | null>(null)

    useEffect(() => {
        if (!navigator.geolocation) {
            setLocationError('Geolocation is not supported by your browser')
            return
        }

        const watchId = navigator.geolocation.watchPosition(
            (position) => {
                const { latitude, longitude } = position.coords
                setLocation({
                    latitude,
                    longitude,
                    name: 'Current Location',
                })
                setLocationError(null)
            },
            (error) => {
                setLocationError(`Geolocation error: ${error.message}`)
            },
            {
                enableHighAccuracy: false,
                timeout: 5000,
                maximumAge: 60000, // Cache position for 1 minute
            }
        )

        return () => navigator.geolocation.clearWatch(watchId)
    }, [])

    const weather = useWeather(location, options)

    return {
        ...weather,
        location,
        locationError,
    }
}
