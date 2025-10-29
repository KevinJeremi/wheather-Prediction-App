/**
 * Expression Types untuk Kiro Mascot
 * Mendefinisikan semua jenis ekspresi dan mapping-nya
 */

export type KiroExpression =
    | 'idle_smile'      // Default, santai
    | 'berpikir'        // Sedang berpikir/processing
    | 'mengetik'        // Sedang mengetik response
    | 'semangat_success'// Response positif/cerah
    | 'hujan'           // Cuaca hujan
    | 'panas'           // Cuaca panas
    | 'dingin'          // Cuaca dingin
    | 'kaget'           // Cuaca ekstrem/alert
    | 'maaf'            // Error/tidak bisa jawab
    | 'thinking2'       // Deep thinking
    | 'penakluk_hujan'  // Cuaca badai
    | 'sedih'           // Sedih
    | 'takut'           // Takut
    | 'marah'           // Marah
    | 'malu'            // Malu
    | 'jatuh_cinta'     // Jatuh cinta
    | 'pray'            // Berdoa
    | 'da'              // Bye/Sampai jumpa
    | 'bingung'         // Bingung

export interface ExpressionResponse {
    expression: KiroExpression
    confidence: number // 0-1, confidence level dari AI
    reason?: string    // Penjelasan singkat kenapa expression ini dipilih
}

export interface ExpressionAnalysisRequest {
    content: string    // Konten respons dari AI
    context?: {
        topic?: string
        sentiment?: string
        userMood?: string
    }
}

/**
 * Mapping ekspresi ke file gambar
 */
export const EXPRESSION_IMAGE_MAP: Record<KiroExpression, string> = {
    'idle_smile': 'idle_smile.png',
    'berpikir': 'berpikir.png',
    'mengetik': 'mengetik.png',
    'semangat_success': 'semangat success.png',
    'hujan': 'hujan.png',
    'panas': 'panas.png',
    'dingin': 'dingin.png',
    'kaget': 'kaget.png',
    'maaf': 'maaf.png',
    'thinking2': 'thinking2.png',
    'penakluk_hujan': 'penakluk_hujan.png',
    'sedih': 'sedih.png',
    'takut': 'takut.png',
    'marah': 'marah.png',
    'malu': 'malu.png',
    'jatuh_cinta': 'jatuh_cinta.png',
    'pray': 'pray.png',
    'da': 'da.png',
    'bingung': 'bingung.png',
}

/**
 * Descriptions for each expression
 */
export const EXPRESSION_DESCRIPTIONS: Record<KiroExpression, string> = {
    'idle_smile': 'Relaxed and happy',
    'berpikir': 'Thinking',
    'mengetik': 'Typing',
    'semangat_success': 'Very happy and enthusiastic',
    'hujan': 'Rainy weather',
    'panas': 'Hot weather',
    'dingin': 'Cold weather',
    'kaget': 'Surprised or alert',
    'maaf': 'Apology or error',
    'thinking2': 'Deep thinking',
    'penakluk_hujan': 'Facing storm/extreme weather',
    'sedih': 'Sad or melancholic',
    'takut': 'Scared or worried',
    'marah': 'Angry or upset',
    'malu': 'Embarrassed or shy',
    'jatuh_cinta': 'In love or charmed',
    'pray': 'Praying or hoping',
    'da': 'Goodbye',
    'bingung': 'Confused or puzzled',
}
