import type { Chapter, Story } from '@prisma/client';

// API Response Types
export type ApiResponse<T = void> =
    | { success: true; data: T }
    | { success: false; error: string };

// Upload Result
export interface UploadResult {
    success: boolean;
    url?: string;
    error?: string;
    errorType?: 'validation' | 'storage' | 'supabase' | 'unknown';
    storageType?: 'local' | 'supabase';
}

// Chapter with Story
export interface ChapterWithStory extends Chapter {
    story: {
        id: string;
        title: string;
        coverImage: string | null;
    };
}

// Story with Chapter Count
export interface StoryWithChapterCount extends Story {
    _count?: {
        chapters: number;
    };
    chapterCount?: number;
}

// Pagination
export interface PaginationParams {
    page: number;
    pageSize: number;
}

export interface PaginatedResponse<T> {
    data: T[];
    pagination: {
        page: number;
        pageSize: number;
        total: number;
        totalPages: number;
    };
}

// Upload Error Detail
export interface UploadErrorDetail {
    fileName: string;
    error: string;
    errorType?: 'validation' | 'storage' | 'supabase' | 'unknown';
}

// Multiple Upload Result
export interface MultipleUploadResult {
    success: boolean;
    urls: string[];
    error?: string;
    errors?: string[];
    detailedErrors?: UploadErrorDetail[];
    summary?: {
        total: number;
        successful: number;
        failed: number;
    };
}
