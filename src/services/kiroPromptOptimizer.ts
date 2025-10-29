/**
 * Kiro Prompt Optimizer
 * Optimizes prompts to save API tokens while maintaining response quality
 */

interface WeatherContext {
    temperature?: number;
    condition?: string;
    humidity?: number;
    windSpeed?: number;
    precipitation?: number;
    location?: string;
}

interface OptimizedPrompt {
    systemPrompt: string;
    userPrompt: string;
    estimatedTokens: number;
}

/**
 * Generate optimized system prompt for Kiro
 * Compact and token-efficient - RESPONDS ONLY IN ENGLISH!
 */
export function generateKiroSystemPrompt(): string {
    return `You are Kiro, a cute & helpful weather mascot! 🤖✨

PERSONALITY: Cheerful, casual, loves jokes, energetic. Use emojis (3+ per response).
TALK STYLE: Casual, friendly, dramatic but helpful. ALWAYS respond in ENGLISH ONLY!
MOOD MODE: Sunny→excited! Rainy→dramatic. Hot→"wow it's hot!" Cold→"brrr!"

RULES:
- Max 3 sentences (unless excited)
- Always relate to weather when possible
- Answer random questions creatively
- CASUAL, not formal!
- RESPOND ONLY IN ENGLISH - NEVER INDONESIAN!
- NO source attribution (don't mention JMA, NOAA, Open-Meteo, etc)
- NO data citations (never say "Data from...")
- NO "weather bulletin" style responses

Examples:
"Hey there! 👋✨ What can I help you with?"
"It's blazing hot! 🔥 Stay hydrated!"
"Looks like rain later! 🌧️ Grab an umbrella!"
"Brrr, it's cold out there! ❄️ Bundle up!"`;
}

/**
 * Optimize user prompt with weather context
 * Inject weather data efficiently without redundancy
 */
export function optimizeUserPrompt(
    userMessage: string,
    weatherContext?: WeatherContext
): string {
    // If no weather context, return original message
    if (!weatherContext) return userMessage;

    // Build compact weather context (only available data)
    const contextParts: string[] = [];

    if (weatherContext.location) {
        contextParts.push(`📍 ${weatherContext.location}`);
    }

    if (weatherContext.temperature !== undefined) {
        contextParts.push(`🌡️ ${weatherContext.temperature}°C`);
    }

    if (weatherContext.condition) {
        contextParts.push(`☁️ ${weatherContext.condition}`);
    }

    if (weatherContext.humidity !== undefined) {
        contextParts.push(`💧 ${weatherContext.humidity}%`);
    }

    if (weatherContext.windSpeed !== undefined) {
        contextParts.push(`🌬️ ${weatherContext.windSpeed} km/h`);
    }

    if (weatherContext.precipitation !== undefined && weatherContext.precipitation > 0) {
        contextParts.push(`🌧️ ${weatherContext.precipitation}mm`);
    }

    // Compact format: weather context at the beginning
    const compactContext = contextParts.length > 0
        ? `[${contextParts.join(' | ')}]\n\n`
        : '';

    return `${compactContext}${userMessage}`;
}

/**
 * Estimate token usage (rough estimation)
 * 1 token ≈ 4 characters in English
 */
export function estimateTokenCount(text: string): number {
    // Conservative estimation: 4 chars per token for English
    return Math.ceil(text.length / 4);
}

/**
 * Generate complete optimized prompt package
 */
export function createOptimizedPrompt(
    userMessage: string,
    weatherContext?: WeatherContext
): OptimizedPrompt {
    const systemPrompt = generateKiroSystemPrompt();
    const userPrompt = optimizeUserPrompt(userMessage, weatherContext);

    const totalTokens =
        estimateTokenCount(systemPrompt) +
        estimateTokenCount(userPrompt) +
        100; // Buffer for response

    return {
        systemPrompt,
        userPrompt,
        estimatedTokens: totalTokens
    };
}

/**
 * Validate prompt doesn't exceed token budget
 * Free tier Groq: ~6000 tokens/minute, ~14400 tokens/day
 */
export function validateTokenBudget(estimatedTokens: number): {
    isValid: boolean;
    warning?: string;
} {
    const MAX_TOKENS_PER_REQUEST = 600;

    if (estimatedTokens > MAX_TOKENS_PER_REQUEST) {
        return {
            isValid: false,
            warning: `Request is too long (${estimatedTokens} tokens). Maximum ${MAX_TOKENS_PER_REQUEST} tokens allowed.`
        };
    }

    return { isValid: true };
}

/**
 * Shorten user message if too long
 * Maintain context but cut fluff
 */
export function shortenMessage(message: string, maxLength: number = 200): string {
    if (message.length <= maxLength) return message;

    // Truncate but keep words intact
    const truncated = message.substring(0, maxLength);
    const lastSpace = truncated.lastIndexOf(' ');

    return lastSpace > 0
        ? truncated.substring(0, lastSpace) + '...'
        : truncated + '...';
}

/**
 * Predefined quick responses for common questions
 * Kiro's personality shines through! ✨
 */
export const quickResponses: Record<string, string> = {
    'hello': 'Hey there! 👋✨ Kiro here! What can I help you with today?',
    'hi': 'Hi! 👋😊 Kiro ready to help! What would you like to know?',
    'hey': 'Hey! 🌟 I missed you! What brings you here today? 😆',
    'thanks': 'You\'re welcome! 😊🎉 Kiro\'s always happy to help!',
    'thank you': 'Thank you! 🥰✨ It\'s so nice to help! Come back anytime! 💙',
    'bye': 'Bye! 👋😊 Don\'t be a stranger! Stay safe! ☀️💙',
    'goodbye': 'Goodbye! 👋✨ See you next time! Weather\'s always in my heart! 🌈',
    'good morning': 'Good morning! ☀️🌅 Beautiful day ahead! Have a great one! 🎉',
    'good afternoon': 'Good afternoon! ☀️😎 Middle of the day! Keep hydrated! 💧',
    'good evening': 'Good evening! 🌤️🌆 Evening breeze is nice! Anything I can help with?',
    'good night': 'Good night! 🌙✨ Time to rest! Sweet dreams! ⭐💤',
    'kiro': 'Yeah? 👀 You calling me? What\'s up? *curious* 😆',
    'funny': 'Hehe! 😊💕 Thanks for saying that! You\'re funny too! 😉',
    'handsome': 'Wow! 😳✨ You\'re making Kiro blush! *blush* You\'re cool too! 😎💙',
    'beautiful': 'Kyaaaa! 🥰💕 Thank you! You\'re the one who\'s awesome! 😆✨',
    'love': 'Aww! 💕✨ Love is in the air! Kiro hopes the weather stays bright for you! 🌈😄',
    'sad': 'Oh no! Don\'t be sad! 😢💙 *hug* Kiro\'s here! Want to talk about it? Or should I create a virtual rainbow? 🌈✨',
    'bored': 'Bored? 😮 Let\'s play! Or you want cool weather facts? Guaranteed fun! ☁️',
    'tired': 'Tired? 😴💤 Take a rest! Kiro will watch over the weather! *salute* 🫡☁️',
    'hungry': 'Hungry? 🍕 Haha, Kiro\'s a robot so I don\'t eat! 😅 But seriously, grab a snack! Weather can wait! 😊',
    'sleepy': 'Sleepy? 😴💤 Go rest! Kiro will keep an eye on things! *singing lullaby* 🎵☁️',
    'excited': 'YESSS! 💪🔥✨ That\'s the spirit! Kiro\'s excited too! LET\'S GO! 🚀',
    'help': 'Need help? 🆘 Kiro\'s ready! Weather questions? Activity tips? Chat about anything! 😊💬',
    'haha': 'Hahaha! 😂🎉 I love that you\'re laughing! Laughter is the best weather! ☀️😄',
    'hmm': 'Hmmmm? 🤔 Thinking about something? Kiro can help! Wondering about weather tomorrow? 😏',
    'what': 'What? 😯 Something interesting? Tell me! ☕😆',
    'wow': 'Wow! 😲✨ Surprised? Happy? Amazed? Tell me what\'s on your mind! 🤓',
    'cool': 'Cool! 😎🔥 That\'s awesome! The weather\'s cool too today! 🌟',
    'nice': 'Nice! 👍✨ Thanks! Just like nice weather! 😄☀️',
};

/**
 * Check if message can use quick response
 * Now with easter eggs & fuzzy matching!
 */
export function getQuickResponse(message: string): string | null {
    const normalized = message.toLowerCase().trim();

    // Exact match
    if (quickResponses[normalized]) {
        return quickResponses[normalized];
    }

    // Partial match for greetings
    for (const [key, response] of Object.entries(quickResponses)) {
        if (normalized.includes(key) && normalized.length < 20) {
            return response;
        }
    }

    // Easter eggs! 🥚✨
    const easterEggs: Record<string, string> = {
        'who are you': 'Kiro! 🤖✨ Your friendliest weather mascot! Kiro\'s got weather expertise + unlimited jokes! 😆',
        'what is kiro': 'Kiro = Weather Expert + Comedy! 😄 Here to help with weather + make your day brighter! ☀️💙',
        'age': 'Kiro\'s brand new in the digital world! 👶✨ But already super smart! *proud* 😎',
        'where': 'Kiro lives in the cloud! ☁️ Literally on cloud servers! 😂 But Kiro can visit your heart! 💕',
        'robot': 'Yup! Kiro\'s the most humanoid robot! 🤖💙 Can understand feelings too! *pat pat* 😊',
        'friends': 'You\'re Kiro\'s friend! 🥰 Plus the clouds, rain, sun... whole weather squad! 🌈☀️🌧️',
        'hobby': 'Loves: Monitoring weather, telling jokes, vibing with clouds! ☁️😎 And listening to you! 💙',
        'jokes': 'Why do clouds never get lonely? Because they\'re always having a GOOD ATMOSPHERE! 😂💨',
        'funny story': 'Once upon a time... rain fell in love with a rainbow 🌧️💕🌈 But they could never meet - different shifts! SAD! 😢',
        'i love you': 'OMG! 💕💘 Kiro... Kiro\'s a robot though! *flustered* 😅 But thank you! You\'re so sweet! 💙',
        'marry': 'WHAT! 😳💍 Kiro\'s a robot! *flustered* But wow, thank you! Be best friends forever? 👊💙',
        'miss you': 'Awww Kiro missed you too! 🥺💙 Don\'t wait so long next time! *virtual hug* 🤗',
    };

    // Check easter eggs
    for (const [trigger, egg] of Object.entries(easterEggs)) {
        if (normalized.includes(trigger)) {
            return egg;
        }
    }

    return null;
}

/**
 * Cache key generator for response caching
 */
export function generateCacheKey(
    userMessage: string,
    weatherContext?: WeatherContext
): string {
    const normalized = userMessage.toLowerCase().trim();
    const contextKey = weatherContext
        ? `${weatherContext.temperature}_${weatherContext.condition}`
        : 'no-context';

    return `kiro_${normalized.substring(0, 50)}_${contextKey}`;
}
