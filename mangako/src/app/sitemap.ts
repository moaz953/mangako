import { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || process.env.NEXTAUTH_URL || 'https://mangako.vercel.app'

    // Static pages only - dynamic pages will be added by ISR
    return [
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
}
