import { MetadataRoute } from 'next'
import { getStories } from './actions'

type StoryFromDB = Awaited<ReturnType<typeof getStories>>[0]

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || process.env.NEXTAUTH_URL || 'http://localhost:3000'

    // Static pages
    const staticPages = [
        {
            url: baseUrl,
            lastModified: new Date(),
            changeFrequency: 'daily' as const,
            priority: 1,
        },
        {
            url: `${baseUrl}/shop`,
            lastModified: new Date(),
            changeFrequency: 'weekly' as const,
            priority: 0.8,
        },
        {
            url: `${baseUrl}/submit`,
            lastModified: new Date(),
            changeFrequency: 'monthly' as const,
            priority: 0.5,
        },
        {
            url: `${baseUrl}/wiki`,
            lastModified: new Date(),
            changeFrequency: 'weekly' as const,
            priority: 0.7,
        },
        {
            url: `${baseUrl}/login`,
            lastModified: new Date(),
            changeFrequency: 'monthly' as const,
            priority: 0.5,
        },
    ]

    // Try to get published stories, but don't fail build if DB is unavailable
    try {
        const stories = await getStories()
        const publishedStories = stories.filter((story: StoryFromDB) => story.status === 'published')

        // Dynamic manga pages
        const mangaPages = publishedStories.map((story: StoryFromDB) => ({
            url: `${baseUrl}/manga/${story.id}`,
            lastModified: new Date(story.updatedAt || story.createdAt || new Date()),
            changeFrequency: 'weekly' as const,
            priority: 0.9,
        }))

        return [...staticPages, ...mangaPages]
    } catch (error) {
        // If database is not available during build, return only static pages
        console.warn('Unable to fetch stories for sitemap, returning static pages only:', error)
        return staticPages
    }
}
