"use client"

import { useEffect, useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { CheckCircle2, BookOpen } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { FloatingElements } from '@/components/floating-elements'
import { loadStripe } from '@stripe/stripe-js'
import { useSession } from 'next-auth/react'

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

function SuccessContent() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const payment_intent_client_secret = searchParams.get('payment_intent_client_secret')
    const [status, setStatus] = useState<'loading' | 'success' | 'processing' | 'error'>('loading')
    const { update: updateSession } = useSession()

    useEffect(() => {
        if (!payment_intent_client_secret) {
            router.push('/shop')
            return
        }

        stripePromise.then(async (stripe) => {
            if (!stripe) return

            const { paymentIntent } = await stripe.retrievePaymentIntent(payment_intent_client_secret)

            switch (paymentIntent?.status) {
                case 'succeeded':
                    setStatus('success')
                    // Update session to reflect new coins
                    updateSession()
                    break
                case 'processing':
                    setStatus('processing')
                    break
                case 'requires_payment_method':
                    setStatus('error')
                    break
                default:
                    setStatus('error')
                    break
            }
        })
    }, [payment_intent_client_secret, router, updateSession])

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-card border border-border/50 rounded-2xl p-8 text-center shadow-2xl"
        >
            {status === 'loading' || status === 'processing' ? (
                <div className="py-12">
                    <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                    <h2 className="text-xl font-bold">Processing Payment...</h2>
                    <p className="text-muted-foreground">Please wait while we confirm your transaction.</p>
                </div>
            ) : status === 'success' ? (
                <>
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", stiffness: 200, damping: 10 }}
                        className="w-20 h-20 bg-green-500/10 text-green-500 rounded-full flex items-center justify-center mx-auto mb-6"
                    >
                        <CheckCircle2 className="w-10 h-10" />
                    </motion.div>

                    <h1 className="text-3xl font-bold mb-2 bg-gradient-manga bg-clip-text text-transparent">
                        Payment Successful!
                    </h1>
                    <p className="text-muted-foreground mb-8">
                        Thank you for your purchase. Your coins have been added to your wallet.
                    </p>

                    <div className="space-y-3">
                        <Button
                            className="w-full bg-gradient-manga hover:opacity-90 gap-2"
                            onClick={() => router.push('/')}
                        >
                            <BookOpen className="w-4 h-4" />
                            Start Reading
                        </Button>
                        <Button
                            variant="outline"
                            className="w-full gap-2"
                            onClick={() => router.push('/shop')}
                        >
                            Return to Shop
                        </Button>
                    </div>
                </>
            ) : (
                <>
                    <div className="w-20 h-20 bg-red-500/10 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
                        <CheckCircle2 className="w-10 h-10 rotate-45" />
                    </div>

                    <h1 className="text-2xl font-bold mb-2">Payment Failed</h1>
                    <p className="text-muted-foreground mb-8">
                        Something went wrong with your payment. Please try again.
                    </p>

                    <Button
                        className="w-full"
                        onClick={() => router.push('/shop')}
                    >
                        Try Again
                    </Button>
                </>
            )}
        </motion.div>
    )
}

export default function SuccessPage() {
    return (
        <div className="min-h-screen bg-background flex items-center justify-center relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-manga-vibrant opacity-5 pointer-events-none" />
            <div className="absolute inset-0 bg-grid-pattern opacity-[0.03] pointer-events-none" />
            <FloatingElements />

            <div className="container max-w-md mx-auto px-4 relative z-10">
                <Suspense fallback={
                    <div className="bg-card border border-border/50 rounded-2xl p-8 text-center shadow-2xl">
                        <div className="py-12">
                            <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                            <h2 className="text-xl font-bold">Loading...</h2>
                        </div>
                    </div>
                }>
                    <SuccessContent />
                </Suspense>
            </div>
        </div>
    )
}
