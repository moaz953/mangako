
import { PrismaClient } from '@prisma/client'
import fs from 'fs/promises'
import path from 'path'

const prisma = new PrismaClient()

async function migrate() {
    console.log('Starting migration...')

    // Migrate Stories
    try {
        const storiesPath = path.join(process.cwd(), 'data', 'stories.json')
        const storiesData = await fs.readFile(storiesPath, 'utf-8')
        const stories = JSON.parse(storiesData)

        console.log(`Found ${stories.length} stories. Migrating...`)

        for (const story of stories) {
            await prisma.story.create({
                data: {
                    id: story.id,
                    title: story.title,
                    description: story.description,
                    author: story.author,
                    coverImage: story.coverImage,
                    status: story.status || 'draft',
                    createdAt: story.createdAt ? new Date(story.createdAt) : new Date(),
                    updatedAt: new Date()
                }
            })
        }
        console.log('Stories migrated successfully.')
    } catch (error) {
        console.log('No stories found or error migrating stories:', error)
    }

    // Migrate Chapters
    try {
        const chaptersPath = path.join(process.cwd(), 'data', 'chapters.json')
        const chaptersData = await fs.readFile(chaptersPath, 'utf-8')
        const chapters = JSON.parse(chaptersData)

        console.log(`Found ${chapters.length} chapters. Migrating...`)

        for (const chapter of chapters) {
            if (!chapter.storyId) {
                console.warn(`Skipping chapter ${chapter.id} because it has no storyId.`)
                continue
            }

            // Check if story exists first to avoid foreign key errors
            const storyExists = await prisma.story.findUnique({ where: { id: chapter.storyId } })

            if (storyExists) {
                await prisma.chapter.create({
                    data: {
                        id: chapter.id,
                        storyId: chapter.storyId,
                        number: parseFloat(chapter.number),
                        title: chapter.title,
                        pages: JSON.stringify(chapter.pages || []),
                        isLocked: chapter.isLocked || false,
                        price: chapter.price || 0,
                        releaseDate: chapter.releaseDate ? new Date(chapter.releaseDate) : new Date(),
                        status: chapter.status || 'draft',
                        createdAt: chapter.createdAt ? new Date(chapter.createdAt) : new Date(),
                        updatedAt: new Date()
                    }
                })
            } else {
                console.warn(`Skipping chapter ${chapter.id} because story ${chapter.storyId} does not exist.`)
            }
        }
        console.log('Chapters migrated successfully.')
    } catch (error) {
        console.log('No chapters found or error migrating chapters:', error)
    }

    // Migrate Submissions
    try {
        const submissionsPath = path.join(process.cwd(), 'data', 'submissions.json')
        const submissionsData = await fs.readFile(submissionsPath, 'utf-8')
        const submissions = JSON.parse(submissionsData)

        console.log(`Found ${submissions.length} submissions. Migrating...`)

        for (const sub of submissions) {
            await prisma.submission.create({
                data: {
                    id: sub.id,
                    artistName: sub.artistName || "Unknown Artist",
                    email: sub.email || "no-email@example.com",
                    title: sub.title || sub.mangaTitle || "Untitled Submission", // Handle potential field name mismatch
                    synopsis: sub.synopsis || "",
                    genre: sub.genre || "Unknown",
                    portfolioUrl: sub.portfolioUrl,
                    samplePages: JSON.stringify(sub.samplePages || []),
                    status: sub.status || 'pending',
                    submittedAt: sub.submittedAt ? new Date(sub.submittedAt) : new Date()
                }
            })
        }
        console.log('Submissions migrated successfully.')
    } catch (error) {
        console.log('No submissions found or error migrating submissions:', error)
    }

    console.log('Migration completed.')
}

migrate()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
