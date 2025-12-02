export interface Chapter {
    id: string
    number: number
    title: string
    isLocked: boolean
    pages: string[] // URLs
    releaseDate?: string // ISO date string
    ratings?: {
        total: number
        count: number
        average: number
    }
    status?: string // draft, published
}

export const mangaData = {
    title: "Mangako",
    description: "When the last star fades, the hunt begins.",
    chapters: [
        {
            id: "1",
            number: 1,
            title: "The Awakening",
            isLocked: false,
            pages: Array(10).fill("/placeholder-page.png"), // Mock pages
        },
        {
            id: "2",
            number: 2,
            title: "Shadows",
            isLocked: false,
            pages: Array(10).fill("/placeholder-page.png"),
        },
        {
            id: "3",
            number: 3,
            title: "The Choice",
            isLocked: false,
            pages: Array(10).fill("/placeholder-page.png"),
        },
        {
            id: "4",
            number: 4,
            title: "Behind the Veil",
            isLocked: true, // Paywall starts here
            pages: Array(10).fill("/placeholder-page.png"),
        },
        {
            id: "5",
            number: 5,
            title: "Consequences",
            isLocked: true,
            pages: Array(10).fill("/placeholder-page.png"),
        },
    ] as Chapter[],
}
