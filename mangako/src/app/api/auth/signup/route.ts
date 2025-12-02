import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { hashPassword } from '@/lib/password'

export async function POST(req: Request) {
    try {
        const { name, email, password } = await req.json()

        // Validation
        if (!email || !password || !name) {
            return NextResponse.json(
                { error: 'All fields are required' },
                { status: 400 }
            )
        }

        if (password.length < 6) {
            return NextResponse.json(
                { error: 'Password must be at least 6 characters' },
                { status: 400 }
            )
        }

        // Check if user already exists
        const existingUser = await prisma.user.findUnique({
            where: { email }
        })

        if (existingUser) {
            return NextResponse.json(
                { error: 'This email is already registered' },
                { status: 400 }
            )
        }

        // Hash password and create user with welcome bonus
        const hashedPassword = await hashPassword(password)

        const user = await prisma.user.create({
            data: {
                name,
                email,
                password: hashedPassword,
                role: 'user',
                coins: 10 // Welcome bonus
            },
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                coins: true,
                createdAt: true
            }
        })

        return NextResponse.json(
            { message: 'Account created successfully', user },
            { status: 201 }
        )
    } catch (error) {
        console.error('Signup error:', error)
        return NextResponse.json(
            { error: 'An error occurred while creating the account' },
            { status: 500 }
        )
    }
}
