/**
 * AI Location Middleware Initializer
 * 
 * File ini di-import di app root untuk:
 * 1. Initialize middleware saat app start
 * 2. Setup location detection otomatis
 * 3. Handle permission requests
 */

'use client'

import { useEffect, useRef } from 'react'
import { initializeAILocationMiddleware } from '@/middleware/aiLocationMiddleware'

/**
 * Hook untuk initialize middleware di component tree
 * Panggil ini di app root layout atau main page
 */
export function useInitializeAILocationMiddleware() {
    const initializedRef = useRef(false)

    useEffect(() => {
        if (initializedRef.current) return

        initializedRef.current = true

        // Initialize middleware dengan config
        const middleware = initializeAILocationMiddleware({
            autoDetect: true,
            cacheValidityMs: 5 * 60 * 1000, // 5 minutes
            includeLocationInPrompt: false, // Don't add to prompt text
            onLocationDetected: (location) => {
                console.log('✅ [App] User location detected:', {
                    name: location.name,
                    coordinates: `${location.latitude}, ${location.longitude}`,
                })

                // Optional: Show notification atau store in analytics
                // toast({ title: 'Location detected', description: location.name })
            },
            onLocationError: (error) => {
                console.warn('⚠️ [App] Location detection failed:', error)

                // Optional: Show error notification
                // toast({
                //   title: 'Location Access',
                //   description: error,
                //   variant: 'destructive'
                // })
            },
        })

        // Debug: Show middleware status
        console.log('🚀 [App] AI Location Middleware initialized')
        console.log('📍 [App] Middleware status:', middleware.getDebugInfo())

        // Cleanup on unmount
        return () => {
            // Don't shutdown, keep running - middleware is singleton
            // middleware.shutdown()
        }
    }, [])
}

/**
 * Provider component untuk wrap app
 * Gunakan di layout.tsx atau _app.tsx
 */
export function AILocationMiddlewareProvider({ children }: { children: React.ReactNode }) {
    useInitializeAILocationMiddleware()

    return <>{children}</>
}
