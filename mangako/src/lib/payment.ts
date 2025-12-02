import Stripe from 'stripe'
import { env } from './env'

// Initialize Stripe with the secret key from validated environment
const stripe = new Stripe(env.STRIPE_SECRET_KEY, {
    apiVersion: '2025-11-17.clover',
    typescript: true,
})

export interface CoinPackage {
    id: string
    name: string
    coins: number
    price: number // Price in cents
    bonus: number
    popular?: boolean
    description?: string
}

export const COIN_PACKAGES: CoinPackage[] = [
    {
        id: 'starter',
        name: 'Starter Pack',
        coins: 100,
        price: 99, // $0.99
        bonus: 0,
        description: 'Perfect for reading a few chapters'
    },
    {
        id: 'popular',
        name: 'Popular Pack',
        coins: 550,
        price: 499, // $4.99
        bonus: 50,
        popular: true,
        description: 'Best value for casual readers'
    },
    {
        id: 'pro',
        name: 'Pro Pack',
        coins: 1150,
        price: 999, // $9.99
        bonus: 150,
        description: 'For the avid manga fan'
    },
    {
        id: 'ultimate',
        name: 'Ultimate Pack',
        coins: 6000,
        price: 4999, // $49.99
        bonus: 1000,
        description: 'Unlock everything you want'
    },
]

export async function createPaymentIntent(packageId: string, userId: string) {
    const pkg = COIN_PACKAGES.find(p => p.id === packageId)
    if (!pkg) throw new Error('Invalid package')

    const paymentIntent = await stripe.paymentIntents.create({
        amount: pkg.price,
        currency: 'usd',
        metadata: {
            userId,
            packageId,
            coins: (pkg.coins + pkg.bonus).toString(),
            type: 'coin_purchase'
        },
        automatic_payment_methods: {
            enabled: true,
        },
    })

    return {
        clientSecret: paymentIntent.client_secret,
        id: paymentIntent.id
    }
}

export async function verifyPayment(paymentIntentId: string) {
    try {
        const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId)
        return paymentIntent.status === 'succeeded'
    } catch (error) {
        console.error('Error verifying payment:', error)
        return false
    }
}

export default stripe
