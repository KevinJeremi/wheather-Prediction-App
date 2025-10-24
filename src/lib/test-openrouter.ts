/**
 * Test File untuk OpenRouter Integration
 * Jalankan dengan: npx tsx src/lib/test-openrouter.ts
 */

import {
    getWeatherAnalysis,
    getDailySummary,
    chat,
    generateWeatherRecommendations,
    analyzeWeatherTrend,
    isOpenRouterConfigured,
    getModelInfo,
} from '@/services/openrouterService'

// ============================================================
// Test Cases
// ============================================================

async function testConfiguration() {
    console.log('\n📋 Test 1: Configuration Check')
    console.log('================================\n')

    const isConfigured = isOpenRouterConfigured()
    const modelInfo = getModelInfo()

    console.log('Is Configured:', isConfigured)
    console.log('Model Info:', modelInfo)

    if (!isConfigured) {
        throw new Error('❌ API key tidak dikonfigurasi!')
    }
    console.log('✅ Configuration OK\n')
}

async function testWeatherAnalysis() {
    console.log('\n📋 Test 2: Weather Analysis')
    console.log('================================\n')

    const weatherContext = `
Lokasi: Jakarta
Suhu Saat Ini: 28°C
Kondisi: Berawan
Kelembaban: 75%
Kecepatan Angin: 12 km/h
Tekanan: 1009 hPa
  `.trim()

    console.log('Context:\n', weatherContext)
    console.log('\nAnalyzing...')

    const result = await getWeatherAnalysis(weatherContext, 'Bagaimana cuaca untuk besok?')

    if (result.success && result.content) {
        console.log('\n✅ Analysis Result:')
        console.log(result.content)
    } else {
        console.log('\n❌ Analysis Failed:')
        console.log(result.error)
    }
}

async function testDailySummary() {
    console.log('\n📋 Test 3: Daily Summary')
    console.log('================================\n')

    console.log('Getting daily summary for Jakarta...\n')

    const result = await getDailySummary(
        'Jakarta',
        'Pagi ini cerah, suhu 24°C, kelembaban tinggi 80%',
        'Siang akan panas 30°C, sore ada hujan ringan'
    )

    if (result.success && result.content) {
        console.log('✅ Daily Summary:')
        console.log(result.content)
    } else {
        console.log('❌ Summary Failed:')
        console.log(result.error)
    }
}

async function testChat() {
    console.log('\n📋 Test 4: Multi-turn Chat')
    console.log('================================\n')

    // First message
    console.log('User: Cuaca seperti apa sekarang di Jakarta?')
    const response1 = await chat('Cuaca seperti apa sekarang di Jakarta?')

    if (response1.success && response1.content) {
        console.log('\nAssistant:', response1.content)
    } else {
        console.log('Chat Error:', response1.error)
        return
    }

    // Second message (dengan context)
    console.log('\nUser: Apa rekomendasi untuk outdoor activities?')
    const response2 = await chat(
        'Apa rekomendasi untuk outdoor activities?',
        [{ role: 'user', content: 'Cuaca seperti apa sekarang di Jakarta?' }]
    )

    if (response2.success && response2.content) {
        console.log('\nAssistant:', response2.content)
    } else {
        console.log('Chat Error:', response2.error)
    }

    console.log('\n✅ Chat test completed')
}

async function testRecommendations() {
    console.log('\n📋 Test 5: Weather Recommendations')
    console.log('================================\n')

    console.log('Getting recommendations for rainy weather...\n')

    const result = await generateWeatherRecommendations(
        'Hujan lebat, angin kencang 25 km/h',
        'Saya ingin pergi hiking'
    )

    if (result.success && result.content) {
        console.log('✅ Recommendations:')
        console.log(result.content)
    } else {
        console.log('❌ Recommendations Failed:')
        console.log(result.error)
    }
}

async function testTrendAnalysis() {
    console.log('\n📋 Test 6: Weather Trend Analysis')
    console.log('================================\n')

    const predictions = [
        { time: '06:00', temperature: 20, condition: 'Cerah', humidity: 75 },
        { time: '09:00', temperature: 23, condition: 'Cerah', humidity: 70 },
        { time: '12:00', temperature: 28, condition: 'Berawan', humidity: 65 },
        { time: '15:00', temperature: 29, condition: 'Berawan', humidity: 60 },
        { time: '18:00', temperature: 25, condition: 'Hujan Ringan', humidity: 80 },
        { time: '21:00', temperature: 22, condition: 'Hujan', humidity: 85 },
    ]

    console.log('Analyzing trend for 6-hour forecast:\n')
    predictions.forEach(p => {
        console.log(`${p.time}: ${p.temperature}°C, ${p.condition} (Humidity: ${p.humidity}%)`)
    })

    console.log('\nAnalyzing...\n')

    const result = await analyzeWeatherTrend(predictions)

    if (result.success && result.content) {
        console.log('✅ Trend Analysis:')
        console.log(result.content)
    } else {
        console.log('❌ Analysis Failed:')
        console.log(result.error)
    }
}

// ============================================================
// Main Test Runner
// ============================================================

async function runAllTests() {
    console.log('🚀 OpenRouter Integration Tests')
    console.log('================================')
    console.log(`Model: meta-llama/llama-4-maverick:free`)
    console.log(`Provider: OpenRouter`)
    console.log(`Time: ${new Date().toISOString()}\n`)

    try {
        // Test 1: Configuration
        await testConfiguration()

        // Test 2: Weather Analysis
        await testWeatherAnalysis()

        // Test 3: Daily Summary
        await testDailySummary()

        // Test 4: Chat
        await testChat()

        // Test 5: Recommendations
        await testRecommendations()

        // Test 6: Trend Analysis
        await testTrendAnalysis()

        console.log('\n\n✅ All tests completed!')
        console.log('================================\n')
    } catch (error) {
        console.error('\n❌ Test failed:')
        console.error(error instanceof Error ? error.message : error)
        process.exit(1)
    }
}

// ============================================================
// Simplified Test - Just Chat
// ============================================================

async function quickTest() {
    console.log('🚀 Quick Test: Simple Chat\n')

    try {
        console.log('Testing API connection...\n')
        const result = await chat('Halo! Bagaimana kabarmu?')

        if (result.success && result.content) {
            console.log('✅ Success!')
            console.log('\nResponse from Llama 4 Maverick:')
            console.log(result.content)
        } else {
            console.log('❌ Failed:')
            console.log(result.error)
        }
    } catch (error) {
        console.error('❌ Error:')
        console.error(error instanceof Error ? error.message : error)
    }
}

// ============================================================
// Export for import
// ============================================================

export { runAllTests, quickTest }

// ============================================================
// Run if executed directly
// ============================================================

if (require.main === module) {
    const testType = process.argv[2] || 'quick'

    if (testType === 'all') {
        runAllTests()
    } else {
        quickTest()
    }
}
