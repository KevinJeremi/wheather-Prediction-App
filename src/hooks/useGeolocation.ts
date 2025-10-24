'use client'

import { useState, useEffect, useCallback } from 'react'
import type { LocationCoordinates } from '@/types/weather.types'

interface UseGeolocationReturn {
    location: LocationCoordinates | null
    isLoading: boolean
    error: string | null
    requestLocation: () => void
    clearError: () => void
}

/**
 * Get location name dari koordinat menggunakan reverse geocoding
 */
async function getLocationName(latitude: number, longitude: number): Promise<string> {
    try {
        // Using Nominatim (OpenStreetMap) untuk reverse geocoding yang lebih detail
        const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=10&addressdetails=1&accept-language=id`,
            {
                headers: {
                    'User-Agent': 'ClimaSenseWeatherApp/1.0'
                }
            }
        )

        if (!response.ok) {
            throw new Error('Failed to fetch location name')
        }

        const data = await response.json()
        const address = data.address || {}

        // Build location name: Desa/Village -> Kabupaten/County -> Provinsi/State -> Negara/Country
        const parts = []

        // Cek untuk nama tempat (desa, kota kecil, dll)
        if (address.village) parts.push(address.village)
        else if (address.town) parts.push(address.town)
        else if (address.city) parts.push(address.city)
        else if (address.county) parts.push(address.county)

        // Kabupaten/Regency
        if (address.county && !parts.includes(address.county)) {
            parts.push(address.county)
        }

        // Provinsi/State
        if (address.state && !parts.includes(address.state)) {
            parts.push(address.state)
        }

        // Negara/Country
        if (address.country && !parts.includes(address.country)) {
            parts.push(address.country)
        }

        if (parts.length > 0) {
            return parts.join(', ')
        }

        // Fallback ke display_name jika ada
        if (data.display_name) {
            return data.display_name.split(',').slice(0, 4).join(',').trim()
        }

        return `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`
    } catch (err) {
        console.error('Failed to get location name:', err)
        return `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`
    }
}

/**
 * Hook untuk get current geolocation
 */
export function useGeolocation(): UseGeolocationReturn {
    const [location, setLocation] = useState<LocationCoordinates | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [hasRequested, setHasRequested] = useState(false)

    const requestLocation = useCallback(() => {
        if (!navigator.geolocation) {
            setError('Geolocation tidak didukung oleh browser Anda')
            setIsLoading(false)
            return
        }

        setIsLoading(true)
        setError(null)

        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const { latitude, longitude } = position.coords

                try {
                    // Get location name
                    const name = await getLocationName(latitude, longitude)

                    setLocation({
                        latitude,
                        longitude,
                        name,
                    })
                    setError(null)
                    console.log('✅ Location detected:', { latitude, longitude, name })
                } catch (err) {
                    console.error('Error getting location name:', err)
                    setLocation({
                        latitude,
                        longitude,
                        name: `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`,
                    })
                } finally {
                    setIsLoading(false)
                }
            },
            (err) => {
                setIsLoading(false)
                let errorMessage = ''

                switch (err.code) {
                    case 1: // PERMISSION_DENIED
                        errorMessage = 'Akses lokasi ditolak. Aktifkan GPS di pengaturan browser untuk memulai.'
                        break
                    case 2: // POSITION_UNAVAILABLE
                        errorMessage = 'Lokasi tidak tersedia saat ini. Coba lagi dalam beberapa detik.'
                        break
                    case 3: // TIMEOUT
                        errorMessage = 'Timeout mencari lokasi. Silakan coba lagi.'
                        break
                    default:
                        errorMessage = `Error: ${err.message || 'Gagal mendapatkan lokasi'}`
                }

                console.warn('❌ Geolocation error:', errorMessage)
                setError(errorMessage)
            },
            {
                enableHighAccuracy: false, // Ubah ke false untuk faster response
                timeout: 8000,
                maximumAge: 300000, // Cache 5 menit
            }
        )
    }, [])

    // Auto request location on mount
    useEffect(() => {
        if (!hasRequested) {
            setHasRequested(true)
            requestLocation()
        }
    }, [hasRequested, requestLocation])

    const clearError = useCallback(() => {
        setError(null)
    }, [])

    return {
        location,
        isLoading,
        error,
        requestLocation,
        clearError,
    }
}
