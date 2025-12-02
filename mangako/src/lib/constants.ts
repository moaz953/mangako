// File Upload
export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
export const ALLOWED_IMAGE_TYPES = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'];

// Status Enums
export enum StoryStatus {
    DRAFT = 'draft',
    PUBLISHED = 'published'
}

export enum ChapterStatus {
    DRAFT = 'draft',
    PUBLISHED = 'published'
}

export enum SubmissionStatus {
    PENDING = 'pending',
    APPROVED = 'approved',
    REJECTED = 'rejected'
}

export enum TransactionType {
    PURCHASE = 'PURCHASE',
    UNLOCK = 'UNLOCK',
    TIP = 'TIP'
}

// User Roles
export enum UserRole {
    USER = 'user',
    ADMIN = 'admin'
}

// Pagination
export const DEFAULT_PAGE_SIZE = 20;
export const MAX_PAGE_SIZE = 100;
