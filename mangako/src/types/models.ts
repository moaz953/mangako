// ========== Database Models ==========

export interface Story {
    id: string
    title: string
    description?: string | null
    author?: string | null
    coverImage?: string | null
    status: 'draft' | 'published'
    createdAt: Date
    updatedAt: Date
    chapters?: Chapter[]
    bookmarks?: Bookmark[]
}

export interface Chapter {
    id: string
    storyId: string
    story?: Story | null
    number: number
    title?: string | null
    pages: string[]  // Array of image URLs
    isLocked: boolean
    price: number
    releaseDate: Date
    status: 'draft' | 'published'
    createdAt: Date
    updatedAt: Date
    readingHistory?: ReadingHistory[]
}

export interface User {
    id: string
    name?: string
    email: string
    password: string
    role: 'user' | 'admin'
    coins: number
    emailVerified?: Date
    image?: string
    createdAt: Date
    updatedAt: Date
}

export interface ReadingHistory {
    id: string
    userId: string
    user?: User
    chapterId: string
    chapter?: Chapter
    progress: number  // Page number (0-indexed)
    createdAt: Date
    updatedAt: Date
}

export interface Bookmark {
    id: string
    userId: string
    user?: User
    storyId: string
    story?: Story
    createdAt: Date
}

export interface Submission {
    id: string
    artistName: string
    email: string
    title: string
    synopsis: string
    portfolioUrl?: string
    samplePages: string[]  // Array of image URLs
    status: 'pending' | 'approved' | 'rejected'
    submittedAt: Date
}

// ========== Extended Types with Relations ==========

export interface StoryWithChapters extends Story {
    chapters: Chapter[]
}

export interface ChapterWithStory extends Chapter {
    story: Story
}

export interface ReadingHistoryWithChapter extends ReadingHistory {
    chapter: ChapterWithStory
}

export interface BookmarkWithStory extends Bookmark {
    story: Story
}

export interface BookmarkedStory extends Story {
    bookmarkedAt: Date
}

export interface SessionUser {
    id: string
    name?: string | null
    email?: string | null
    image?: string | null
    coins: number
    role: UserRole
}

// ========== Input Types (for forms and API) ==========

export interface CreateStoryInput {
    title: string
    description?: string
    author?: string
    coverImage?: string
}

export interface UpdateStoryInput {
    title?: string
    description?: string
    author?: string
    coverImage?: string
    status?: 'draft' | 'published'
}

export interface CreateChapterInput {
    storyId: string
    number: number
    title?: string
    pages: string[]
    isLocked?: boolean
    price?: number
    releaseDate?: Date
}

export interface UpdateChapterInput {
    number?: number
    title?: string
    pages?: string[]
    isLocked?: boolean
    price?: number
    status?: 'draft' | 'published'
    releaseDate?: Date
}

export interface CreateSubmissionInput {
    artistName: string
    email: string
    title: string
    synopsis: string
    portfolioUrl?: string
    samplePages: string[]
}

export interface UpdateReadingHistoryInput {
    userId: string
    chapterId: string
    progress: number
}

// ========== API Response Types ==========

export interface ApiResponse<T = void> {
    success: boolean
    data?: T
    error?: string
    errors?: Array<{ message: string; field?: string }>
}

export interface PaginatedResponse<T> {
    data: T[]
    total: number
    page: number
    pageSize: number
    hasMore: boolean
}

// ========== UI/Display Types ==========

export interface ChapterWithProgress extends Omit<Chapter, 'story'> {
    progress?: number
    pageProgress?: number
    story?: {
        id: string
        title: string
        coverImage?: string
    }
}

export interface StoryProgress {
    storyId: string
    progress: number  // Percentage (0-100)
    lastChapter?: {
        id: string
        number: number
        pageProgress?: number
        pages?: string[]
    }
    totalChapters: number
    readChapters: number
}

export interface ContinueReadingItem {
    id: string
    storyId: string
    number: number
    title?: string | null
    pages: string[]
    progress: number
    story?: {
        id: string
        title: string
        coverImage?: string | null
    } | null
}

// ========== Utility Types ==========

export type StoryStatus = Story['status']
export type ChapterStatus = Chapter['status']
export type UserRole = User['role']
export type SubmissionStatus = Submission['status']
