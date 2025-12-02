
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    const stories = await prisma.story.findMany()
    const chapters = await prisma.chapter.findMany()

    console.log("Stories:", JSON.stringify(stories, null, 2))
    console.log("Chapters:", JSON.stringify(chapters, null, 2))
}

main()
    .catch(e => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
