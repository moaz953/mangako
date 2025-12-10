import { z } from 'zod'

// ========== Shared Schemas ==========

const pageUrlSchema = z.string().url("Page must be a valid URL")
const idSchema = z.string().cuid("Invalid ID format")

// ========== Story Schemas ==========

export const createStorySchema = z.object({
    title: z.string().min(1, "Title is required").max(200, "Title is too long"),
    description: z.string().max(2000, "Description is too long").optional(),
    author: z.string().max(100, "Author name is too long").optional(),
    coverImage: z.string().url("Cover image must be a valid URL").optional().or(z.literal('')),
})

export const updateStorySchema = createStorySchema.partial().extend({
    status: z.enum(['draft', 'published']).optional(),
})

// ========== Chapter Schemas ==========

export const createChapterSchema = z.object({
    storyId: idSchema,
    number: z.number().min(0, "Chapter number must be positive"),
    title: z.string().optional(),
    pages: z.array(pageUrlSchema).default([]),
    isLocked: z.boolean().default(false),
    price: z.number().min(0).default(0),
    releaseDate: z.string().datetime().optional().or(z.date()),
})

export const updateChapterSchema = createChapterSchema.partial().omit({ storyId: true }).extend({
    status: z.enum(['draft', 'published']).optional(),
})

export const reorderChaptersSchema = z.array(z.object({
    id: idSchema,
    number: z.number(),
}))

// ========== Submission Schemas ==========

export const createSubmissionSchema = z.object({
    artistName: z.string().min(2, "Name is too short"),
    email: z.string().email("Invalid email address"),
    title: z.string().min(1, "Title is required"),
    genre: z.string().min(1, "Genre is required"),
    synopsis: z.string().min(5, "Synopsis must be at least 5 characters"),
    portfolioUrl: z.string()
        .optional()
        .transform(val => val === "" ? undefined : val)
        .pipe(z.string().url("Invalid portfolio URL").optional()),
    samplePages: z.array(pageUrlSchema).min(1, "At least one sample page is required"),
})

export const updateSubmissionStatusSchema = z.object({
    status: z.enum(['approved', 'rejected']),
})

// ========== User/Reading Schemas ==========

export const updateReadingHistorySchema = z.object({
    userId: idSchema,
    chapterId: idSchema,
    progress: z.number().min(0),
})

export const bookmarkSchema = z.object({
    userId: idSchema,
    storyId: idSchema,
})

// ========== Helper Types ==========

export type CreateStoryInput = z.infer<typeof createStorySchema>
export type UpdateStoryInput = z.infer<typeof updateStorySchema>
export type CreateChapterInput = z.infer<typeof createChapterSchema>
export type UpdateChapterInput = z.infer<typeof updateChapterSchema>
export type CreateSubmissionInput = z.infer<typeof createSubmissionSchema>

// ========== Economy Schemas ==========

export const purchaseCoinsSchema = z.object({
    amount: z.number().min(1, "Amount must be positive"),
})

export const unlockChapterSchema = z.object({
    chapterId: idSchema,
})

export const tipArtistSchema = z.object({
    storyId: idSchema,
    amount: z.number().min(1, "Tip amount must be positive"),
})
