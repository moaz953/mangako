import { MetadataRoute } from 'next'
import { getStories } from './actions'

type StoryFromDB = Awaited<ReturnType<typeof getStories>>[0]

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'

    // Get all published stories
    const stories = await getStories()
    const publishedStories = stories.filter((story: StoryFromDB) => story.status === 'published')

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

    // Dynamic manga pages
    const mangaPages = publishedStories.map((story: StoryFromDB) => ({
        url: `${baseUrl}/manga/${story.id}`,
        lastModified: new Date(story.updatedAt || story.createdAt || new Date()),
        changeFrequency: 'weekly' as const,
        priority: 0.9,
    }))

    return [...staticPages, ...mangaPages]
}
