"use server"

import { writeFile, mkdir } from "fs/promises"
import { join } from "path"
import prisma from "@/lib/prisma"
import { Submission, Story, Chapter } from "@prisma/client"
import { revalidatePath } from "next/cache"
import { logger } from "@/lib/logger"
import {
    createStorySchema,
    updateStorySchema,
    createChapterSchema,
    updateChapterSchema,
    createSubmissionSchema,
    updateSubmissionStatusSchema,
    updateReadingHistorySchema,
    bookmarkSchema,
    purchaseCoinsSchema,
    unlockChapterSchema,
    tipArtistSchema
} from "@/lib/validations"
import { requireAdmin, requireAuth, getCurrentUser } from "@/lib/auth-helpers"
import { ZodError } from "zod"
import { createClient } from "@supabase/supabase-js"
import type { UploadResult, UploadErrorDetail, MultipleUploadResult } from "@/types/api"
import { MAX_FILE_SIZE, ALLOWED_IMAGE_TYPES } from "@/lib/constants"

// Initialize Supabase Client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
// Use Service Role Key to bypass RLS policies for admin actions
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabase = createClient(supabaseUrl, supabaseKey)


export async function uploadImage(formData: FormData): Promise<UploadResult> {
    try {
        const file = formData.get("file") as File

        // Validate file exists
        if (!file) {
            return { success: false, error: "No file uploaded", errorType: "validation" }
        }

        // Log file details
        const fileSize = file.size
        const fileType = file.type
        const fileName = file.name

        // Validate file size
        if (fileSize > MAX_FILE_SIZE) {
            return {
                success: false,
                error: `File too large: ${(fileSize / 1024 / 1024).toFixed(2)}MB (max 10MB)`,
                errorType: "validation"
            }
        }

        // Validate file type
        if (!ALLOWED_IMAGE_TYPES.includes(fileType)) {
            return {
                success: false,
                error: `Invalid file type: ${fileType}. Allowed: PNG, JPG, WEBP`,
                errorType: "validation"
            }
        }

        // Check if Supabase is configured
        const isSupabaseConfigured = supabaseUrl && supabaseKey && !supabaseUrl.includes('xxxx')

        if (!isSupabaseConfigured) {
            logger.warn("Supabase not configured, falling back to local storage")

            try {
                // Fallback to local storage
                const bytes = await file.arrayBuffer()
                const buffer = Buffer.from(bytes)
                const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1E9)}`
                const filename = `${uniqueSuffix}-${file.name.replace(/[^a-zA-Z0-9.-]/g, "")}`

                const uploadDir = join(process.cwd(), "public", "uploads")

                // Ensure directory exists
                try {
                    await mkdir(uploadDir, { recursive: true })
                } catch (e) {
                    const error = e as Error
                    // Directory might already exist, continue
                }

                // Test write permissions by attempting to write
                const filePath = join(uploadDir, filename)

                try {
                    await writeFile(filePath, buffer)
                } catch (writeError) {
                    const error = writeError as Error
                    throw new Error(`Cannot write to uploads directory: ${error.message}`)
                }

                logger.info("Image uploaded successfully to local storage", { filename, path: filePath })
                return { success: true, url: `/uploads/${filename}`, storageType: "local" }
            } catch (localError) {
                const error = localError as Error
                return {
                    success: false,
                    error: `Local storage error: ${error.message}`,
                    errorType: "storage"
                }
            }
        }

        // Supabase upload path
        try {
            const bytes = await file.arrayBuffer()
            const buffer = Buffer.from(bytes)

            // Generate unique filename
            const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1E9)}`
            const filename = `${uniqueSuffix}-${file.name.replace(/[^a-zA-Z0-9.-]/g, "")}`


            // Upload to Supabase Storage
            const { data, error } = await supabase
                .storage
                .from('uploads')
                .upload(filename, buffer, {
                    contentType: file.type,
                    upsert: false
                })

            if (error) {
                logger.error("Supabase upload error", error)

                // Try to provide more specific error messages
                let errorMessage = error.message
                if (error.message.includes('bucket')) {
                    errorMessage = "Storage bucket not found or not configured. Check Supabase settings."
                } else if (error.message.includes('permission')) {
                    errorMessage = "Permission denied. Check Supabase storage policies."
                } else if (error.message.includes('network')) {
                    errorMessage = "Network error. Check your internet connection."
                }

                return {
                    success: false,
                    error: `Supabase error: ${errorMessage}`,
                    errorType: "supabase"
                }
            }

            // Get Public URL
            const { data: { publicUrl } } = supabase
                .storage
                .from('uploads')
                .getPublicUrl(filename)

            logger.info("Image uploaded successfully to Supabase", { filename, publicUrl })

            return { success: true, url: publicUrl, storageType: "supabase" }
        } catch (supabaseError) {
            const error = supabaseError as Error
            return {
                success: false,
                error: `Supabase operation failed: ${error.message}`,
                errorType: "supabase"
            }
        }
    } catch (error) {
        const err = error as Error
        logger.error("Unexpected upload error", err)
        return {
            success: false,
            error: `Failed to upload: ${err.message}`,
            errorType: "unknown"
        }
    }
}

export async function uploadMultipleImages(formData: FormData): Promise<MultipleUploadResult> {
    try {
        const files = formData.getAll("files") as File[]

        if (!files || files.length === 0) {
            return { success: false, error: "No files provided", urls: [], detailedErrors: [] }
        }


        // Log summary of files
        const totalSize = files.reduce((acc, f) => acc + f.size, 0)

        const urls: string[] = []
        const detailedErrors: UploadErrorDetail[] = []
        let successCount = 0

        for (let i = 0; i < files.length; i++) {
            const file = files[i]

            const fileFormData = new FormData()
            fileFormData.append("file", file)
            const result = await uploadImage(fileFormData)

            if (result.success && result.url) {
                urls.push(result.url)
                successCount++
            } else {
                const errorDetail: UploadErrorDetail = {
                    fileName: file.name,
                    error: result.error || 'Unknown error',
                    errorType: result.errorType
                }
                detailedErrors.push(errorDetail)
            }
        }

        const summary = `Upload complete: ${successCount}/${files.length} successful, ${detailedErrors.length} failed`

        if (detailedErrors.length > 0) {
            logger.error("Some uploads failed", new Error(JSON.stringify(detailedErrors)))
        }


        return {
            success: urls.length > 0,
            urls,
            errors: detailedErrors.length > 0 ? detailedErrors.map(e => `${e.fileName}: ${e.error}`) : undefined,
            detailedErrors: detailedErrors.length > 0 ? detailedErrors : undefined,
            summary: {
                total: files.length,
                successful: successCount,
                failed: detailedErrors.length
            }
        }
    } catch (error) {
        const err = error as Error
        logger.error("Multiple upload error", error as Error)
        return {
            success: false,
            error: err.message || "Upload failed",
            urls: [],
            detailedErrors: []
        }
    }
}

// Submission Management

export async function saveSubmission(submissionData: unknown) {
    try {
        // Validate input
        const validatedData = createSubmissionSchema.parse(submissionData)

        const submission = await prisma.submission.create({
            data: {
                ...validatedData,
                samplePages: JSON.stringify(validatedData.samplePages)
            }
        })

        logger.info("New submission created", { submissionId: submission.id })
        revalidatePath('/admin/submissions')
        return { success: true, id: submission.id }
    } catch (error) {
        if (error instanceof ZodError) {
            return { success: false, error: error.issues[0].message }
        }
        logger.error("Save submission error", error as Error)
        return { success: false, error: "Failed to save submission" }
    }
}

export async function getSubmissions() {
    try {
        const submissions = await prisma.submission.findMany({
            orderBy: { submittedAt: 'desc' }
        })


        return (submissions as unknown as Submission[]).map((sub) => ({
            ...sub,
            samplePages: JSON.parse(sub.samplePages as string) as string[],
            submittedAt: sub.submittedAt.toISOString()
        }))
    } catch (error) {
        logger.error("Get submissions error", error as Error)
        return []
    }
}

export async function updateSubmissionStatus(id: string, status: "approved" | "rejected") {
    try {
        await requireAdmin()

        await prisma.submission.update({
            where: { id },
            data: { status }
        })

        logger.info("Submission status updated", { submissionId: id, status })
        revalidatePath('/admin/submissions')
        return { success: true }
    } catch (error) {
        logger.error("Update status error", error as Error)
        return { success: false, error: "Failed to update status" }
    }
}

export async function deleteSubmission(id: string) {
    try {
        await requireAdmin()

        await prisma.submission.delete({
            where: { id }
        })

        logger.info("Submission deleted", { submissionId: id })
        revalidatePath('/admin/submissions')
        return { success: true }
    } catch (error) {
        logger.error("Delete submission error", error as Error)
        return { success: false, error: "Failed to delete submission" }
    }
}

// Chapter Management

export async function getChapters() {
    try {
        const chapters = await prisma.chapter.findMany({
            orderBy: { number: 'asc' }
        })

        // Parse JSON fields
        interface ChapterFromDB {
            id: string
            storyId: string
            number: number
            title: string | null
            pages: string
            isLocked: boolean
            price: number
            status: string
            releaseDate: Date
            createdAt: Date
            updatedAt: Date
        }

        const parsedChapters = chapters.map((ch: ChapterFromDB) => ({
            ...ch,
            pages: JSON.parse(ch.pages) as string[]
        }))
        logger.debug('getChapters', { count: parsedChapters.length, ids: parsedChapters.map((c) => c.id) })
        return parsedChapters
    } catch (error) {
        logger.error("Get chapters error", error as Error)
        return []
    }
}

export async function getChapter(id: string) {
    try {
        const chapter = await prisma.chapter.findUnique({
            where: { id }
        })
        logger.debug('getChapter', { id, found: !!chapter })

        if (!chapter) return { success: false, error: "Chapter not found in database" }

        try {
            return {
                success: true,
                data: {
                    ...chapter,
                    pages: JSON.parse(chapter.pages)
                }
            }
        } catch (e) {
            logger.error("JSON parse error for chapter pages", e as Error)
            return { success: false, error: "Failed to parse chapter pages" }
        }
    } catch (error) {
        logger.error("Get chapter error", error as Error)
        return { success: false, error: "Database error: " + (error instanceof Error ? error.message : String(error)) }
    }
}

export async function createChapter(chapterData: unknown) {
    try {
        await requireAdmin()

        const validatedData = createChapterSchema.parse(chapterData)

        const chapter = await prisma.chapter.create({
            data: {
                ...validatedData,
                pages: JSON.stringify(validatedData.pages),
                releaseDate: validatedData.releaseDate ? new Date(validatedData.releaseDate) : undefined
            }
        })

        revalidatePath(`/manga/${validatedData.storyId}`)
        revalidatePath('/admin/chapters')

        logger.info("Chapter created", { chapterId: chapter.id, storyId: validatedData.storyId })
        return { success: true, chapter }
    } catch (error) {
        logger.error("FULL CREATE CHAPTER ERROR", error as Error)
        if (error instanceof ZodError) {
            return { success: false, error: error.issues[0].message }
        }
        logger.error("Create chapter error", error as Error)
        return { success: false, error: "Failed to create chapter: " + (error instanceof Error ? error.message : String(error)) }
    }
}

export async function updateChapter(id: string, updates: unknown) {
    try {
        await requireAdmin()

        const validatedUpdates = updateChapterSchema.parse(updates)
        logger.debug('updateChapter', { id, updates: validatedUpdates })

        const chapter = await prisma.chapter.update({
            where: { id },
            data: {
                ...validatedUpdates,
                pages: validatedUpdates.pages ? JSON.stringify(validatedUpdates.pages) : undefined,
                releaseDate: validatedUpdates.releaseDate ? new Date(validatedUpdates.releaseDate) : undefined
            }
        })

        revalidatePath(`/manga/${chapter.storyId}`)
        revalidatePath('/admin/chapters')

        logger.info("Chapter updated", { chapterId: id, storyId: chapter.storyId })
        return { success: true, chapter }
    } catch (error) {
        if (error instanceof ZodError) {
            return { success: false, error: error.issues[0].message }
        }
        logger.error("Update chapter error", error as Error)
        return { success: false, error: "Failed to update chapter" }
    }
}

export async function deleteChapter(id: string) {
    try {
        await requireAdmin()

        await prisma.chapter.delete({
            where: { id }
        })

        logger.info("Chapter deleted", { chapterId: id })
        revalidatePath('/admin/stories')
        return { success: true }
    } catch (error) {
        logger.error("Delete chapter error", error as Error)
        return { success: false, error: "Failed to delete chapter" }
    }
}

export async function publishChapter(id: string, publish: boolean) {
    try {
        await requireAdmin()

        await prisma.chapter.update({
            where: { id },
            data: { status: publish ? "published" : "draft" }
        })

        logger.info("Chapter publish status updated", { chapterId: id, published: publish })
        revalidatePath('/admin/stories')
        return { success: true }
    } catch (error) {
        logger.error("Publish chapter error", error as Error)
        return { success: false, error: "Failed to update publish status" }
    }
}

export async function reorderChapters(updates: { id: string; number: number }[]) {
    try {
        await requireAdmin()

        await prisma.$transaction(
            updates.map(update =>
                prisma.chapter.update({
                    where: { id: update.id },
                    data: { number: update.number }
                })
            )
        )

        logger.info("Chapters reordered", { count: updates.length })
        revalidatePath('/admin/stories')
        return { success: true }
    } catch (error) {
        logger.error("Reorder chapters error", error as Error)
        return { success: false, error: "Failed to reorder chapters" }
    }
}


// Story/Manga Management

export async function getStories() {
    try {
        const stories = await prisma.story.findMany({
            orderBy: { createdAt: 'desc' }
        })
        return stories
    } catch (error) {
        logger.error("Get stories error", error as Error)
        return []
    }
}

export async function createStory(storyData: unknown) {
    try {
        await requireAdmin()

        const validatedData = createStorySchema.parse(storyData)

        const story = await prisma.story.create({
            data: {
                ...validatedData,
                status: 'draft'
            }
        })

        revalidatePath('/admin/stories')
        logger.info("Story created", { storyId: story.id })
        return { success: true, story }
    } catch (error) {
        if (error instanceof ZodError) {
            return { success: false, error: error.issues[0].message }
        }
        logger.error("Create story error", error as Error)
        // Log the full error for debugging
        return { success: false, error: `Failed to create story: ${error instanceof Error ? error.message : 'Unknown error'}` }
    }
}

export async function updateStory(id: string, updates: unknown) {
    try {
        await requireAdmin()

        const validatedUpdates = updateStorySchema.parse(updates)

        const story = await prisma.story.update({
            where: { id },
            data: validatedUpdates
        })

        revalidatePath('/admin/stories')
        revalidatePath(`/manga/${id}`)

        logger.info("Story updated", { storyId: id })
        return { success: true, story }
    } catch (error) {
        if (error instanceof ZodError) {
            return { success: false, error: error.issues[0].message }
        }
        logger.error("Update story error", error as Error)
        return { success: false, error: "Failed to update story" }
    }
}

export async function deleteStory(id: string) {
    try {
        await requireAdmin()

        await prisma.story.delete({
            where: { id }
        })

        logger.info("Story deleted", { storyId: id })
        revalidatePath('/admin/stories')
        return { success: true }
    } catch (error) {
        logger.error("Delete story error", error as Error)
        return { success: false, error: "Failed to delete story" }
    }
}

export async function publishStory(id: string, publish: boolean) {
    try {
        await requireAdmin()

        await prisma.story.update({
            where: { id },
            data: { status: publish ? "published" : "draft" }
        })

        logger.info("Story publish status updated", { storyId: id, published: publish })
        revalidatePath('/admin/stories')
        return { success: true }
    } catch (error) {
        logger.error("Publish story error", error as Error)
        return { success: false, error: "Failed to update publish status" }
    }
}


// ========== Bookmark Management ==========

export async function addBookmark(storyId: string) {
    try {
        // Get the authenticated user from server session
        const user = await getCurrentUser()

        if (!user || !user.id) {
            logger.warn("Add bookmark: User not authenticated")
            return { success: false, error: "Please login to add bookmarks" }
        }

        const validated = bookmarkSchema.parse({ userId: user.id, storyId })

        // Check if already bookmarked
        const existing = await prisma.bookmark.findUnique({
            where: {
                userId_storyId: { userId: user.id, storyId }
            }
        })

        if (existing) {
            logger.info("Bookmark already exists", { userId: user.id, storyId })
            return { success: false, error: "Already bookmarked" }
        }

        await prisma.bookmark.create({
            data: validated
        })

        revalidatePath('/library')
        revalidatePath(`/manga/${storyId}`)
        revalidatePath('/') // Revalidate homepage as well

        logger.info("Bookmark added successfully", { userId: user.id, storyId })
        return { success: true }
    } catch (error) {
        if (error instanceof ZodError) {
            return { success: false, error: error.issues[0].message }
        }
        logger.error("Add bookmark error", error as Error)
        return { success: false, error: "Failed to add bookmark" }
    }
}

export async function removeBookmark(storyId: string) {
    try {
        // Get the authenticated user from server session
        const user = await getCurrentUser()

        if (!user || !user.id) {
            logger.warn("Remove bookmark: User not authenticated")
            return { success: false, error: "Please login to remove bookmarks" }
        }

        const result = await prisma.bookmark.deleteMany({
            where: { userId: user.id, storyId }
        })

        if (result.count === 0) {
            logger.info("Bookmark not found for removal", { userId: user.id, storyId })
            return { success: false, error: "Bookmark not found" }
        }

        revalidatePath('/library')
        revalidatePath(`/manga/${storyId}`)
        revalidatePath('/') // Revalidate homepage as well

        logger.info("Bookmark removed successfully", { userId: user.id, storyId })
        return { success: true }
    } catch (error) {
        logger.error("Remove bookmark error", error as Error)
        return { success: false, error: "Failed to remove bookmark" }
    }
}

export async function getBookmarks(userId: string) {
    try {
        const bookmarks = await prisma.bookmark.findMany({
            where: { userId },
            include: {
                story: {
                    include: {
                        chapters: {
                            where: { status: 'published' },
                            orderBy: { number: 'asc' }
                        }
                    }
                }
            },
            orderBy: { createdAt: 'desc' }
        })

        return bookmarks.map(b => ({
            ...b.story,
            chapters: b.story.chapters.map(c => ({
                ...c,
                pages: JSON.parse(c.pages)
            })),
            bookmarkedAt: b.createdAt
        }))
    } catch (error) {
        logger.error("Get bookmarks error", error as Error)
        return []
    }
}

export async function isBookmarked(storyId: string) {
    try {
        // Get the authenticated user from server session
        const user = await getCurrentUser()

        if (!user || !user.id) {
            return { isBookmarked: false }
        }

        const bookmark = await prisma.bookmark.findUnique({
            where: {
                userId_storyId: { userId: user.id, storyId }
            }
        })
        return { isBookmarked: !!bookmark }
    } catch (error) {
        logger.error("Check bookmark error", error as Error)
        return { isBookmarked: false }
    }
}


// ========== Reading History Management ==========

export async function updateReadingHistory(userId: string, chapterId: string, progress: number) {
    try {
        await requireAuth()

        const validated = updateReadingHistorySchema.parse({ userId, chapterId, progress })

        await prisma.readingHistory.upsert({
            where: {
                userId_chapterId: {
                    userId: validated.userId,
                    chapterId: validated.chapterId
                }
            },
            update: {
                progress: validated.progress,
                updatedAt: new Date()
            },
            create: {
                userId: validated.userId,
                chapterId: validated.chapterId,
                progress: validated.progress
            }
        })

        revalidatePath('/library')
        return { success: true }
    } catch (error) {
        if (error instanceof ZodError) {
            return { success: false, error: error.issues[0].message }
        }
        logger.error("Update reading history error", error as Error)
        return { success: false, error: "Failed to update reading history" }
    }
}

// ========== Admin Stats ==========

export async function getAdminStats() {
    try {
        await requireAdmin()

        const [storiesCount, chaptersCount, usersCount, totalCoins] = await Promise.all([
            prisma.story.count({ where: { status: 'published' } }),
            prisma.chapter.count({ where: { status: 'published' } }),
            prisma.user.count(),
            prisma.user.aggregate({
                _sum: {
                    coins: true
                }
            })
        ])

        return {
            totalStories: storiesCount,
            totalChapters: chaptersCount,
            totalUsers: usersCount,
            totalCoins: totalCoins._sum.coins || 0
        }
    } catch (error) {
        logger.error("Get admin stats error", error as Error)
        return {
            totalStories: 0,
            totalChapters: 0,
            totalUsers: 0,
            totalCoins: 0
        }
    }
}


export async function getReadingHistory(userId: string, storyId?: string) {
    try {
        const history = await prisma.readingHistory.findMany({
            where: {
                userId,
                ...(storyId && {
                    chapter: {
                        storyId
                    }
                })
            },
            include: {
                chapter: {
                    include: {
                        story: true
                    }
                }
            },
            orderBy: { updatedAt: 'desc' }
        })

        return history.map(h => ({
            ...h.chapter,
            progress: h.progress,
            lastReadAt: h.updatedAt,
            story: h.chapter.story
        }))
    } catch (error) {
        logger.error("Get reading history error", error as Error)
        return []
    }
}

export async function getLastRead(userId: string, storyId: string) {
    try {
        const history = await prisma.readingHistory.findFirst({
            where: {
                userId,
                chapter: {
                    storyId
                }
            },
            orderBy: { updatedAt: 'desc' },
            include: {
                chapter: true
            }
        })

        if (!history) return null

        return {
            ...history.chapter,
            progress: history.progress,
            lastReadAt: history.updatedAt
        }
    } catch (error) {
        logger.error("Get last read error", error as Error)
        return null
    }
}

export async function getContinueReading(userId: string, limit: number = 10) {
    try {
        const history = await prisma.readingHistory.findMany({
            where: { userId },
            include: {
                chapter: {
                    include: {
                        story: true
                    }
                }
            },
            orderBy: { updatedAt: 'desc' },
            take: limit
        })

        // Parse pages JSON
        return history.map(h => {
            const chapter = h.chapter
            return {
                ...chapter,
                pages: JSON.parse(chapter.pages),
                progress: h.progress,
                lastReadAt: h.updatedAt,
                story: chapter.story
            }
        })
    } catch (error) {
        logger.error("Get continue reading error", error as Error)
        return []
    }
}

export async function getChapterProgress(userId: string, chapterId: string) {
    try {
        const history = await prisma.readingHistory.findUnique({
            where: {
                userId_chapterId: { userId, chapterId }
            }
        })
        return { progress: history?.progress || 0 }
    } catch (error) {
        logger.error("Get chapter progress error", error as Error)
        return { progress: 0 }
    }
}

export async function getStoryProgress(userId: string, storyId: string) {
    try {
        // Get all chapters for this story
        const chapters = await prisma.chapter.findMany({
            where: { storyId, status: 'published' },
            orderBy: { number: 'asc' }
        })

        if (chapters.length === 0) return {
            progress: 0,
            lastChapter: null,
            storyId,
            totalChapters: 0,
            readChapters: 0
        }

        // Get reading history for this user and story
        const history = await prisma.readingHistory.findMany({
            where: {
                userId,
                chapterId: { in: chapters.map(c => c.id) }
            },
            orderBy: { updatedAt: 'desc' }
        })

        if (history.length === 0) return {
            progress: 0,
            lastChapter: null,
            storyId,
            totalChapters: chapters.length,
            readChapters: 0
        }

        const lastRead = history[0]
        const lastChapter = chapters.find(c => c.id === lastRead.chapterId)
        const chaptersRead = history.length
        const totalChapters = chapters.length
        const progressPercentage = Math.round((chaptersRead / totalChapters) * 100)

        return {
            storyId,
            progress: progressPercentage,
            totalChapters,
            readChapters: chaptersRead,
            lastChapter: lastChapter ? {
                ...lastChapter,
                pages: JSON.parse(lastChapter.pages as string),
                pageProgress: lastRead.progress
            } : undefined
        }
    } catch (error) {
        logger.error("Get story progress error", error as Error)
        return {
            progress: 0,
            lastChapter: null,
            storyId,
            totalChapters: 0,
            readChapters: 0
        }
    }
}

// Economy System Actions

export async function purchaseCoins(amount: number) {
    try {
        const user = await requireAuth()
        const validated = purchaseCoinsSchema.parse({ amount })

        // In a real app, this would integrate with Stripe/PayPal
        // For MVP, we just simulate the purchase

        const updatedUser = await prisma.user.update({
            where: { id: user.id },
            data: {
                coins: { increment: validated.amount },
                transactions: {
                    create: {
                        amount: validated.amount,
                        type: 'PURCHASE',
                        referenceId: 'simulated-payment'
                    }
                }
            }
        })

        revalidatePath('/')
        logger.info("Coins purchased", { userId: user.id, amount: validated.amount })
        return { success: true, coins: updatedUser.coins }
    } catch (error) {
        if (error instanceof ZodError) {
            return { success: false, error: error.issues[0].message }
        }
        logger.error("Purchase coins error", error as Error)
        return { success: false, error: "Failed to purchase coins" }
    }
}

export async function unlockChapter(chapterId: string) {
    try {
        const user = await requireAuth()
        const validated = unlockChapterSchema.parse({ chapterId })

        // Check if already unlocked
        const existingUnlock = await prisma.unlockedChapter.findUnique({
            where: {
                userId_chapterId: {
                    userId: user.id,
                    chapterId: validated.chapterId
                }
            }
        })

        if (existingUnlock) {
            return { success: true, message: "Chapter already unlocked" }
        }

        // Get chapter price
        const chapter = await prisma.chapter.findUnique({
            where: { id: validated.chapterId },
            select: { price: true, title: true }
        })

        if (!chapter) {
            return { success: false, error: "Chapter not found" }
        }

        if (chapter.price === 0) {
            return { success: true, message: "Chapter is free" }
        }

        // Check balance
        const dbUser = await prisma.user.findUnique({
            where: { id: user.id },
            select: { coins: true }
        })

        if (!dbUser || dbUser.coins < chapter.price) {
            return { success: false, error: "Insufficient coins" }
        }

        // Perform transaction
        await prisma.$transaction([
            prisma.user.update({
                where: { id: user.id },
                data: { coins: { decrement: chapter.price } }
            }),
            prisma.unlockedChapter.create({
                data: {
                    userId: user.id,
                    chapterId: validated.chapterId
                }
            }),
            prisma.transaction.create({
                data: {
                    userId: user.id,
                    amount: -chapter.price,
                    type: 'UNLOCK',
                    referenceId: validated.chapterId
                }
            })
        ])

        revalidatePath(`/manga/${validated.chapterId}`) // Note: This might need adjustment based on actual routes
        logger.info("Chapter unlocked", { userId: user.id, chapterId: validated.chapterId })
        return { success: true }
    } catch (error) {
        if (error instanceof ZodError) {
            return { success: false, error: error.issues[0].message }
        }
        logger.error("Unlock chapter error", error as Error)
        return { success: false, error: "Failed to unlock chapter" }
    }
}

export async function tipArtist(storyId: string, amount: number) {
    try {
        const user = await requireAuth()
        const validated = tipArtistSchema.parse({ storyId, amount })

        // Check balance
        const dbUser = await prisma.user.findUnique({
            where: { id: user.id },
            select: { coins: true }
        })

        if (!dbUser || dbUser.coins < validated.amount) {
            return { success: false, error: "Insufficient coins" }
        }

        // Perform transaction
        await prisma.$transaction([
            prisma.user.update({
                where: { id: user.id },
                data: { coins: { decrement: validated.amount } }
            }),
            prisma.transaction.create({
                data: {
                    userId: user.id,
                    amount: -validated.amount,
                    type: 'TIP',
                    referenceId: validated.storyId
                }
            })
        ])

        revalidatePath(`/manga/${validated.storyId}`)
        logger.info("Artist tipped", { userId: user.id, storyId: validated.storyId, amount: validated.amount })
        return { success: true }
    } catch (error) {
        if (error instanceof ZodError) {
            return { success: false, error: error.issues[0].message }
        }
        logger.error("Tip artist error", error as Error)
        return { success: false, error: "Failed to send tip" }
    }
}

