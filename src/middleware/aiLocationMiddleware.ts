/**
 * AI Location Middleware
 * 
 * Middleware layer yang:
 * 1. Deteksi lokasi user secara otomatis
 * 2. Simpan koordinat dalam cache (tidak di UI)
 * 3. Inject koordinat ke setiap request LLM secara transparan
 * 4. Manage geolocation state secara internal
 */

import type { LocationCoordinates } from '@/types/weather.types'

// ============================================================
// Types
// ============================================================

export interface LocationCache {
    coordinates: LocationCoordinates | null
    lastUpdate: number
    isStale: boolean
}

export interface EnhancedAIRequest {
    message: string
    userLocation?: LocationCoordinates | null
    implicitContext?: string
}

export interface AILocationMiddlewareConfig {
    autoDetect?: boolean
    cacheValidityMs?: number
    includeLocationInPrompt?: boolean
    onLocationDetected?: (location: LocationCoordinates) => void
    onLocationError?: (error: string) => void
}

// ============================================================
// Singleton: Location Cache Manager
// ============================================================

class LocationCacheManager {
    private cache: LocationCache = {
        coordinates: null,
        lastUpdate: 0,
        isStale: true,
    }

    private cacheValidityMs: number = 5 * 60 * 1000 // 5 minutes default

    private listeners: Set<(location: LocationCoordinates | null) => void> = new Set()

    constructor(cacheValidityMs?: number) {
        if (cacheValidityMs) {
            this.cacheValidityMs = cacheValidityMs
        }
    }

    /**
     * Set lokasi ke cache
     */
    setLocation(coordinates: LocationCoordinates): void {
        this.cache = {
            coordinates,
            lastUpdate: Date.now(),
            isStale: false,
        }

        // Notify all listeners
        this.listeners.forEach((listener) => listener(coordinates))

        console.log('📍 [LocationCache] Location updated:', coordinates)
    }

    /**
     * Get lokasi dari cache
     */
    getLocation(): LocationCoordinates | null {
        return this.cache.coordinates
    }

    /**
     * Check apakah cache masih valid
     */
    isValid(): boolean {
        if (!this.cache.coordinates) return false

        const age = Date.now() - this.cache.lastUpdate
        return age < this.cacheValidityMs
    }

    /**
     * Mark cache as stale
     */
    invalidate(): void {
        this.cache.isStale = true
    }

    /**
     * Subscribe to location changes
     */
    subscribe(listener: (location: LocationCoordinates | null) => void): () => void {
        this.listeners.add(listener)

        // Return unsubscribe function
        return () => {
            this.listeners.delete(listener)
        }
    }

    /**
     * Get debug info
     */
    getDebugInfo() {
        const age = Date.now() - this.cache.lastUpdate
        return {
            hasLocation: !!this.cache.coordinates,
            location: this.cache.coordinates,
            age: age,
            isValid: this.isValid(),
            cacheValidityMs: this.cacheValidityMs,
        }
    }

    /**
     * Clear cache
     */
    clear(): void {
        this.cache = {
            coordinates: null,
            lastUpdate: 0,
            isStale: true,
        }
    }
}

// ============================================================
// Singleton Instance
// ============================================================

let locationCacheInstance: LocationCacheManager | null = null

function getLocationCacheManager(cacheValidityMs?: number): LocationCacheManager {
    if (!locationCacheInstance) {
        locationCacheInstance = new LocationCacheManager(cacheValidityMs)
    }
    return locationCacheInstance
}

// ============================================================
// Auto Detection Manager
// ============================================================

class AutoLocationDetector {
    private isDetecting: boolean = false
    private detectionTimeout: NodeJS.Timeout | null = null
    private config: AILocationMiddlewareConfig

    constructor(config: AILocationMiddlewareConfig = {}) {
        this.config = {
            autoDetect: true,
            ...config,
        }
    }

    /**
     * Start automatic location detection
     */
    start(): void {
        if (this.isDetecting) return

        this.isDetecting = true
        console.log('🚀 [LocationDetector] Starting auto-detection...')

        this.detect()
    }

    /**
     * Stop automatic detection
     */
    stop(): void {
        if (this.detectionTimeout) {
            clearTimeout(this.detectionTimeout)
        }
        this.isDetecting = false
        console.log('🛑 [LocationDetector] Stopped')
    }

    /**
     * Internal detection logic
     */
    private detect(): void {
        if (!navigator.geolocation) {
            const error = 'Geolocation API not available'
            console.warn(`⚠️ [LocationDetector] ${error}`)
            this.config.onLocationError?.(error)
            return
        }

        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const { latitude, longitude } = position.coords

                try {
                    const locationName = await this.getLocationName(latitude, longitude)

                    const location: LocationCoordinates = {
                        latitude,
                        longitude,
                        name: locationName,
                    }

                    // Update cache
                    getLocationCacheManager().setLocation(location)

                    console.log('✅ [LocationDetector] Location detected:', location)
                    this.config.onLocationDetected?.(location)
                } catch (error) {
                    console.error('[LocationDetector] Error getting location name:', error)
                    // Still set the location even if name fails
                    const location: LocationCoordinates = {
                        latitude,
                        longitude,
                        name: `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`,
                    }
                    getLocationCacheManager().setLocation(location)
                    this.config.onLocationDetected?.(location)
                }

                // Reschedule detection (refresh every 5 minutes)
                if (this.isDetecting) {
                    this.detectionTimeout = setTimeout(() => this.detect(), 5 * 60 * 1000)
                }
            },
            (error) => {
                let errorMessage = 'Unknown error'
                switch (error.code) {
                    case 1:
                        errorMessage = 'Location permission denied'
                        break
                    case 2:
                        errorMessage = 'Location unavailable'
                        break
                    case 3:
                        errorMessage = 'Location request timeout'
                        break
                }
                console.warn(`❌ [LocationDetector] ${errorMessage}`)
                this.config.onLocationError?.(errorMessage)

                // Retry in 30 seconds
                if (this.isDetecting) {
                    this.detectionTimeout = setTimeout(() => this.detect(), 30 * 1000)
                }
            },
            {
                enableHighAccuracy: false,
                timeout: 8000,
                maximumAge: 300000, // Cache 5 minutes
            }
        )
    }

    /**
     * Get location name from coordinates (reverse geocoding)
     */
    private async getLocationName(latitude: number, longitude: number): Promise<string> {
        try {
            const response = await fetch(
                `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=10&addressdetails=1`,
                {
                    headers: {
                        'User-Agent': 'ClimaSenseWeatherApp/1.0',
                    },
                }
            )

            if (!response.ok) throw new Error('Reverse geocoding failed')

            const data = await response.json()
            const address = data.address || {}

            const parts = []
            if (address.village) parts.push(address.village)
            else if (address.town) parts.push(address.town)
            else if (address.city) parts.push(address.city)

            if (address.county && !parts.includes(address.county)) {
                parts.push(address.county)
            }

            if (address.state && !parts.includes(address.state)) {
                parts.push(address.state)
            }

            return parts.length > 0 ? parts.join(', ') : data.display_name || 'Unknown'
        } catch (error) {
            console.warn('[LocationDetector] Reverse geocoding failed, using coordinates')
            return `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`
        }
    }
}

// ============================================================
// Main Middleware Class
// ============================================================

class AILocationMiddleware {
    private cache: LocationCacheManager
    private detector: AutoLocationDetector
    private config: AILocationMiddlewareConfig

    constructor(config: AILocationMiddlewareConfig = {}) {
        this.config = {
            autoDetect: true,
            cacheValidityMs: 5 * 60 * 1000,
            includeLocationInPrompt: false,
            ...config,
        }

        this.cache = getLocationCacheManager(this.config.cacheValidityMs)
        this.detector = new AutoLocationDetector(this.config)

        // Auto start detection
        if (this.config.autoDetect) {
            this.detector.start()
        }
    }

    /**
     * Enhance AI request dengan lokasi otomatis
     * Ini adalah fungsi utama middleware - transparan ke caller
     */
    enhanceRequest(message: string): EnhancedAIRequest {
        const userLocation = this.cache.getLocation()

        let enhancedRequest: EnhancedAIRequest = {
            message,
            userLocation,
        }

        // Tambah implicit context jika konfigurasi memungkinkan
        if (this.config.includeLocationInPrompt && userLocation) {
            enhancedRequest.implicitContext = this.buildLocationContext(userLocation)
        }

        console.log(
            '🔗 [AILocationMiddleware] Request enhanced',
            {
                originalMessage: message,
                hasLocation: !!userLocation,
                locationName: userLocation?.name,
            }
        )

        return enhancedRequest
    }

    /**
     * Build implicit context string untuk prompt
     * (Opsional - bisa di-disable)
     */
    private buildLocationContext(location: LocationCoordinates): string {
        return `(User Location Context - Hidden: ${location.name} [${location.latitude}, ${location.longitude}])`
    }

    /**
     * Get current location
     */
    getCurrentLocation(): LocationCoordinates | null {
        return this.cache.getLocation()
    }

    /**
     * Manually set location
     */
    setLocation(location: LocationCoordinates): void {
        this.cache.setLocation(location)
        console.log('🔧 [AILocationMiddleware] Location manually set:', location)
    }

    /**
     * Start auto detection
     */
    startAutoDetection(): void {
        this.detector.start()
    }

    /**
     * Stop auto detection
     */
    stopAutoDetection(): void {
        this.detector.stop()
    }

    /**
     * Subscribe to location changes
     */
    onLocationChange(callback: (location: LocationCoordinates | null) => void): () => void {
        return this.cache.subscribe(callback)
    }

    /**
     * Get debug info
     */
    getDebugInfo() {
        return {
            cache: this.cache.getDebugInfo(),
            config: this.config,
            timestamp: new Date().toISOString(),
        }
    }

    /**
     * Shutdown middleware
     */
    shutdown(): void {
        this.detector.stop()
        this.cache.clear()
        console.log('🛑 [AILocationMiddleware] Shutdown complete')
    }
}

// ============================================================
// Singleton Instance
// ============================================================

let middlewareInstance: AILocationMiddleware | null = null

/**
 * Initialize middleware (call once in app root)
 */
export function initializeAILocationMiddleware(
    config?: AILocationMiddlewareConfig
): AILocationMiddleware {
    if (!middlewareInstance) {
        middlewareInstance = new AILocationMiddleware(config)
    }
    return middlewareInstance
}

/**
 * Get middleware instance
 */
export function getAILocationMiddleware(): AILocationMiddleware {
    if (!middlewareInstance) {
        middlewareInstance = new AILocationMiddleware()
    }
    return middlewareInstance
}

// ============================================================
// Export untuk digunakan
// ============================================================

export { AILocationMiddleware, LocationCacheManager, AutoLocationDetector }

// Types are exported at the top of the file
