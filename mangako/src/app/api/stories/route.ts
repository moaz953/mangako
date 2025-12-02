import { getStories } from "@/app/actions"
import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams
        const id = searchParams.get('id')

        // If specific story ID requested
        if (id) {
            const story = await prisma.story.findUnique({
                where: { id },
                include: {
                    chapters: {
                        where: { status: 'published' },
                        orderBy: { number: 'asc' }
                    }
                }
            })

            if (!story) {
                return NextResponse.json({ error: "Story not found" }, { status: 404 })
            }

            return NextResponse.json(story)
        }

        // Get all stories
        const stories = await getStories()
        return NextResponse.json(stories)
    } catch (error) {
        console.error("Stories API error:", error)
        return NextResponse.json([], { status: 500 })
    }
}
