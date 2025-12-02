import { PrismaClient } from '@prisma/client'
import { hashPassword } from '../src/lib/password'

const prisma = new PrismaClient()

async function main() {
    console.log('🔧 Creating admin user...')

    const email = process.env.ADMIN_EMAIL || 'admin@mangako.com'
    const password = process.env.ADMIN_PASSWORD || 'admin123'
    const name = process.env.ADMIN_NAME || 'Admin'

    try {
        // Check if admin already exists
        const existingAdmin = await prisma.user.findUnique({
            where: { email }
        })

        if (existingAdmin) {
            console.log('⚠️  Admin user already exists:', email)
            return
        }

        // Hash password
        const hashedPassword = await hashPassword(password)

        // Create admin user
        const admin = await prisma.user.create({
            data: {
                email,
                password: hashedPassword,
                role: 'admin',
                name,
                coins: 0
            }
        })

        console.log('✅ Admin user created successfully!')
        console.log('📧 Email:', admin.email)
        console.log('👤 Name:', admin.name)
        console.log('🔑 Role:', admin.role)
        console.log('')
        console.log('⚠️  IMPORTANT: Change the default password after first login!')

    } catch (error) {
        console.error('❌ Error creating admin user:', error)
        throw error
    }
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
