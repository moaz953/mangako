import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { createPaymentIntent } from '@/lib/payment'
import { z } from 'zod'

const requestSchema = z.object({
    packageId: z.string()
})

export async function POST(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions)

        if (!session?.user?.id) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            )
        }

        const body = await req.json()
        const result = requestSchema.safeParse(body)

        if (!result.success) {
            return NextResponse.json(
                { error: 'Invalid request body' },
                { status: 400 }
            )
        }

        const { packageId } = result.data
        const paymentIntent = await createPaymentIntent(packageId, session.user.id)

        return NextResponse.json(paymentIntent)
    } catch (error) {
        console.error('Payment intent creation error:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}
