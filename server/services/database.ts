import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

/**
 * Save audio chunk to database
 */
export async function saveChunk(
    sessionId: string,
    sequence: number,
    audioData: Buffer,
    transcript?: string
): Promise<void> {
    try {
        await prisma.audioChunk.create({
            data: {
                sessionId,
                sequence,
                audioData,
                transcript,
            },
        })
    } catch (error) {
        console.error("[Database] Error saving chunk:", error)
        throw error
    }
}

/**
 * Update session metadata
 */
export async function updateSession(
    sessionId: string,
    data: {
        status?: string
        duration?: number
        transcript?: string
        summary?: string
        completedAt?: Date
    }
): Promise<void> {
    try {
        await prisma.recordingSession.update({
            where: { id: sessionId },
            data,
        })
    } catch (error) {
        console.error("[Database] Error updating session:", error)
        throw error
    }
}

/**
 * Get full transcript from all chunks
 */
export async function getFullTranscript(sessionId: string): Promise<string> {
    try {
        const chunks = await prisma.audioChunk.findMany({
            where: { sessionId },
            orderBy: { sequence: "asc" },
            select: { transcript: true },
        })

        return chunks.map((chunk) => chunk.transcript).join(" ")
    } catch (error) {
        console.error("[Database] Error getting full transcript:", error)
        throw error
    }
}

/**
 * Update chunk with transcript
 */
export async function updateChunkTranscript(
    sessionId: string,
    sequence: number,
    transcript: string
): Promise<void> {
    try {
        await prisma.audioChunk.updateMany({
            where: {
                sessionId,
                sequence,
            },
            data: {
                transcript,
            },
        })
    } catch (error) {
        console.error("[Database] Error updating chunk transcript:", error)
        throw error
    }
}

// Cleanup on module unload
process.on("beforeExit", async () => {
    await prisma.$disconnect()
})
