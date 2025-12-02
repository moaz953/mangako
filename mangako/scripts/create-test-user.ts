import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
    const email = 'test@example.com'
    const password = 'password123'
    const hashedPassword = await bcrypt.hash(password, 12)

    try {
        const user = await prisma.user.upsert({
            where: { email },
            update: {
                password: hashedPassword,
                role: 'user',
                coins: 100
            },
            create: {
                email,
                name: 'Test User',
                password: hashedPassword,
                role: 'user',
                coins: 100
            },
        })
        console.log(`User created/updated: ${user.email}`)
        console.log(`Password: ${password}`)
    } catch (e) {
        console.error(e)
        process.exit(1)
    } finally {
        await prisma.$disconnect()
    }
}

main()
