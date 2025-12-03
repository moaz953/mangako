import { getChapters, getChapter } from "@/app/actions"
import { NextRequest, NextResponse } from "next/server"
import { logger } from "@/lib/logger"

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams
        const id = searchParams.get('id')
        const storyId = searchParams.get('storyId')

        // If specific chapter ID requested
        if (id) {
            const result = await getChapter(id)
            if (result.success && result.data) {
                return NextResponse.json(result.data)
            }
            return NextResponse.json({ error: result.error || "Chapter not found" }, { status: 404 })
        }

        // Get all chapters
        const chapters = await getChapters()

        // Filter by storyId if provided
        if (storyId) {
            const filtered = chapters.filter((c: any) => c.storyId === storyId)
            return NextResponse.json(filtered)
        }

        return NextResponse.json(chapters)
    } catch (error) {
        logger.error("Chapters API error", error as Error)
        return NextResponse.json([], { status: 500 })
    }
}
