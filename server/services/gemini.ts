import { GoogleGenerativeAI } from "@google/generative-ai"

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)

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
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" })

        const prompt = includeContext
            ? "Continue transcribing this audio. Maintain speaker context from the previous segment. If multiple speakers are present, identify them as Speaker 1, Speaker 2, etc."
            : "Transcribe this audio accurately. If multiple speakers are present, identify them as Speaker 1, Speaker 2, etc. Include timestamps if possible."

        const result = await model.generateContent([
            {
                inlineData: {
                    mimeType: "audio/webm",
                    data: audioBuffer.toString("base64"),
                },
            },
            { text: prompt },
        ])

        const response = await result.response
        return response.text()
    } catch (error) {
        console.error("[Gemini] Transcription error:", error)
        throw new Error("Failed to transcribe audio chunk")
    }
}

/**
 * Generate meeting summary from full transcript
 * @param transcript - Full meeting transcript
 * @returns Formatted summary with key points, decisions, and action items
 */
export async function generateSummary(transcript: string): Promise<string> {
    try {
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" })

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
        const response = await result.response
        return response.text()
    } catch (error) {
        console.error("[Gemini] Summary generation error:", error)
        throw new Error("Failed to generate summary")
    }
}
