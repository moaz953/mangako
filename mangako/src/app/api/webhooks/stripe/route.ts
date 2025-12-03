import { headers } from 'next/headers'
import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import getStripeInstance from '@/lib/payment'
import Stripe from 'stripe'
import { logger } from '@/lib/logger'

export async function POST(req: Request) {
    const body = await req.text()
    const signature = (await headers()).get('Stripe-Signature') as string

    let event: Stripe.Event

    try {
        const stripe = getStripeInstance()
        event = stripe.webhooks.constructEvent(
            body,
            signature,
            process.env.STRIPE_WEBHOOK_SECRET!
        )
    } catch (error) {
        const err = error as Error
        logger.error('Stripe webhook error', err)
        return new NextResponse(`Webhook Error: ${err.message}`, { status: 400 })
    }

    const session = event.data.object as Stripe.PaymentIntent

    if (event.type === 'payment_intent.succeeded') {
        const userId = session.metadata.userId
        const coins = parseInt(session.metadata.coins)
        const packageId = session.metadata.packageId

        if (userId && coins) {
            try {
                // Update user balance
                await prisma.user.update({
                    where: { id: userId },
                    data: {
                        coins: {
                            increment: coins
                        }
                    }
                })

                // Create transaction record
                await prisma.transaction.create({
                    data: {
                        userId: userId,
                        amount: coins,
                        type: 'PURCHASE',
                        referenceId: packageId,
                    }
                })

                logger.info('Stripe payment succeeded', { userId, coins, packageId })
            } catch (error) {
                console.error('Error updating user balance:', error)
                return new NextResponse('Database Error', { status: 500 })
            }
        }
    }

    return new NextResponse(null, { status: 200 })
}
