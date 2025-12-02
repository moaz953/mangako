"use client"

import { useState, useEffect } from 'react'
import { useStripe, useElements, PaymentElement } from '@stripe/react-stripe-js'
import { Button } from '@/components/ui/button'
import { Loader2, Lock } from 'lucide-react'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'

export function CheckoutForm({ packageId, onSuccess }: { packageId: string, onSuccess?: () => void }) {
    const stripe = useStripe()
    const elements = useElements()
    const [loading, setLoading] = useState(false)
    const [errorMessage, setErrorMessage] = useState<string | null>(null)
    const router = useRouter()

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!stripe || !elements) return

        setLoading(true)
        setErrorMessage(null)

        try {
            const { error } = await stripe.confirmPayment({
                elements,
                confirmParams: {
                    return_url: `${window.location.origin}/shop/success`,
                },
            })

            if (error) {
                setErrorMessage(error.message || 'An unexpected error occurred.')
                toast.error(error.message || 'Payment failed')
            } else {
                // This point will only be reached if there is an immediate error when
                // confirming the payment. Otherwise, your customer will be redirected to
                // your `return_url`.
                if (onSuccess) onSuccess()
            }
        } catch (e) {
            console.error(e)
            setErrorMessage('An unexpected error occurred.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-6 p-6 bg-card border border-border/50 rounded-2xl shadow-lg">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold">Secure Checkout</h3>
                <Lock className="w-4 h-4 text-muted-foreground" />
            </div>

            <PaymentElement />

            {errorMessage && (
                <div className="p-3 text-sm text-red-500 bg-red-500/10 rounded-md">
                    {errorMessage}
                </div>
            )}

            <Button
                type="submit"
                className="w-full bg-gradient-manga hover:opacity-90 transition-opacity"
                disabled={!stripe || loading}
            >
                {loading ? (
                    <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Processing Securely...
                    </>
                ) : (
                    'Pay Now'
                )}
            </Button>

            <p className="text-xs text-muted-foreground text-center flex items-center justify-center gap-1">
                <Lock className="w-3 h-3" />
                Payments are processed securely by Stripe
            </p>
        </form>
    )
}
