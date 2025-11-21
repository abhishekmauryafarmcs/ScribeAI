import { GoogleGenerativeAI } from "@google/generative-ai"

// Log API key status (first 10 chars only for security)
const apiKey = process.env.GEMINI_API_KEY
console.log("[Gemini] API Key loaded:", apiKey ? `${apiKey.substring(0, 10)}...` : "MISSING")

if (!apiKey) {
    throw new Error("GEMINI_API_KEY environment variable is not set")
}

const genAI = new GoogleGenerativeAI(apiKey)

/**
 * Transcribe audio chunk with optional context overlap
 * @param audioBuffer - Audio data as Buffer
 * @param includeContext - Whether to maintain speaker context from previous segment
 * @returns Transcribed text
 */
export async function transcribeAudioChunk(
    audioBuffer: Buffer,
    includeContext: boolean = false
): Promise<string> {
    try {
        // Skip empty or very small buffers (less than 1KB likely has no meaningful audio)
        if (!audioBuffer || audioBuffer.length < 1000) {
            console.log(`[Gemini] Skipping small audio chunk (${audioBuffer?.length || 0} bytes)`)
            return ""
        }

        console.log(`[Gemini] Transcribing audio chunk: ${audioBuffer.length} bytes`)

        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" })

        const prompt = includeContext
            ? "Continue transcribing this audio. Maintain speaker context from the previous segment. If multiple speakers are present, identify them as Speaker 1, Speaker 2, etc."
            : "Transcribe this audio accurately. If multiple speakers are present, identify them as Speaker 1, Speaker 2, etc."

        // Check if buffer starts with WebM signature (0x1A 0x45 0xDF 0xA3)
        const isValidWebM = audioBuffer[0] === 0x1A && audioBuffer[1] === 0x45 && 
                           audioBuffer[2] === 0xDF && audioBuffer[3] === 0xA3
        
        if (!isValidWebM) {
            console.log(`[Gemini] Invalid WebM format detected (header: ${audioBuffer.slice(0, 4).toString("hex")})`)
            return ""
        }

        const result = await model.generateContent([
            {
                inlineData: {
                    mimeType: "audio/webm",
                    data: audioBuffer.toString("base64"),
                },
            },
            { text: prompt },
        ])

        const response = result.response
        const text = response.text()
        console.log(`[Gemini] Transcription result: ${text?.substring(0, 100) || "(empty)"}`)
        return text || ""
    } catch (error: any) {
        console.error("[Gemini] Transcription error:", error?.message || error)
        // Return empty string instead of throwing to allow recording to continue
        return ""
    }
}

/**
 * Generate meeting summary from full transcript
 * @param transcript - Full meeting transcript
 * @returns Formatted summary with key points, decisions, and action items
 */
export async function generateSummary(transcript: string): Promise<string> {
    try {
        console.log(`[Gemini] generateSummary called with transcript length: ${transcript?.length || 0}`)
        
        // If transcript is empty or too short, return a default message
        if (!transcript || transcript.trim().length < 10) {
            console.log("[Gemini] Transcript too short, returning default message")
            return "No transcript available to summarize."
        }

        console.log(`[Gemini] Calling Gemini API for summary...`)
        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" })

        const prompt = `
Analyze this meeting transcript and provide a comprehensive summary in the following format:

## Key Discussion Points
- List 3-5 main topics discussed

## Decisions Made
- List all decisions that were made during the meeting

## Action Items
- List all action items with responsible person (if mentioned) and deadline (if mentioned)

## Overall Summary
Provide a 2-3 sentence summary of the entire meeting.

Transcript:
${transcript}

Format your response in Markdown.
`

        const result = await model.generateContent(prompt)
        const response = result.response
        const summaryText = response.text()
        console.log(`[Gemini] Summary generated successfully, length: ${summaryText.length}`)
        return summaryText
    } catch (error: any) {
        console.error("[Gemini] Summary generation error:", error?.message || error)
        // Return a fallback summary instead of throwing
        const fallback = `## Summary\n\nTranscript: ${transcript.substring(0, 500)}${transcript.length > 500 ? "..." : ""}`
        console.log(`[Gemini] Returning fallback summary`)
        return fallback
    }
}
