"use client"

import { useState, useEffect } from 'react'
import { loadStripe } from '@stripe/stripe-js'
import { Elements } from '@stripe/react-stripe-js'
import { COIN_PACKAGES } from '@/lib/payment'
import { motion } from 'framer-motion'
import { Coins, Sparkles, Shield, Zap, Heart, Check } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { CheckoutForm } from '@/components/checkout-form'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { FloatingElements } from '@/components/floating-elements'

// Initialize Stripe outside of component to avoid recreating stripe object on every render
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

export default function ShopPage() {
    const { data: session } = useSession()
    const router = useRouter()
    const [selectedPackage, setSelectedPackage] = useState<string | null>(null)
    const [clientSecret, setClientSecret] = useState<string | null>(null)
    const [loading, setLoading] = useState(false)

    // Handle package selection
    const handleSelectPackage = async (packageId: string) => {
        if (!session) {
            toast.error("Please login to purchase coins")
            router.push('/login?callbackUrl=/shop')
            return
        }

        if (selectedPackage === packageId && clientSecret) {
            // Already selected, just scroll to checkout
            document.getElementById('checkout-section')?.scrollIntoView({ behavior: 'smooth' })
            return
        }

        setLoading(true)
        setSelectedPackage(packageId)
        setClientSecret(null)

        try {
            const res = await fetch('/api/payment/create-intent', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ packageId }),
            })

            if (!res.ok) throw new Error('Failed to initialize payment')

            const data = await res.json()
            setClientSecret(data.clientSecret)

            // Wait a bit for state update then scroll
            setTimeout(() => {
                document.getElementById('checkout-section')?.scrollIntoView({ behavior: 'smooth' })
            }, 100)
        } catch (error) {
            console.error(error)
            toast.error("Failed to prepare checkout. Please try again.")
            setSelectedPackage(null)
        } finally {
            setLoading(false)
        }
    }

    const appearance = {
        theme: 'night' as const,
        variables: {
            colorPrimary: '#1DBBCC',
            colorBackground: '#1a1a1a',
            colorText: '#ffffff',
            colorDanger: '#df1b41',
            fontFamily: 'ui-sans-serif, system-ui, sans-serif',
            spacingUnit: '4px',
            borderRadius: '8px',
        },
    }

    return (
        <div className="min-h-screen bg-background relative overflow-hidden">
            {/* Background Effects */}
            <div className="absolute inset-0 bg-gradient-manga-vibrant opacity-5 pointer-events-none" />
            <div className="absolute inset-0 bg-grid-pattern opacity-[0.03] pointer-events-none" />
            <FloatingElements />

            <div className="container max-w-6xl mx-auto px-4 py-16 relative z-10">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center mb-16"
                >
                    <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-manga bg-clip-text text-transparent inline-block">
                        Coin Shop
                    </h1>
                    <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                        Unlock premium chapters, support creators, and access exclusive content.
                    </p>
                </motion.div>

                {/* Coin Packages Grid */}
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
                    {COIN_PACKAGES.map((pkg, index) => (
                        <motion.div
                            key={pkg.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="h-full"
                        >
                            <button
                                onClick={() => handleSelectPackage(pkg.id)}
                                className={`
                                    relative w-full h-full p-6 rounded-2xl border-2 transition-all duration-300 text-left flex flex-col
                                    ${selectedPackage === pkg.id
                                        ? 'border-primary bg-primary/5 shadow-lg shadow-primary/20 scale-[1.02]'
                                        : 'border-border/50 bg-card/50 hover:border-primary/50 hover:bg-card hover:shadow-xl hover:-translate-y-1'
                                    }
                                    ${pkg.popular ? 'ring-2 ring-primary/50 ring-offset-2 ring-offset-background' : ''}
                                `}
                            >
                                {pkg.popular && (
                                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-10">
                                        <Badge className="bg-gradient-manga text-white border-0 px-4 py-1 shadow-lg">
                                            Most Popular
                                        </Badge>
                                    </div>
                                )}

                                <div className="text-center space-y-6 flex-1 w-full">
                                    {/* Coins Icon with Glow */}
                                    <div className={`
                                        inline-flex items-center justify-center w-24 h-24 rounded-full 
                                        bg-gradient-to-br from-primary/20 to-secondary/20
                                        ${selectedPackage === pkg.id ? 'animate-float' : ''}
                                    `}>
                                        <Coins className={`w-12 h-12 ${selectedPackage === pkg.id ? 'text-primary' : 'text-muted-foreground'}`} />
                                    </div>

                                    {/* Package Info */}
                                    <div>
                                        <h3 className="text-xl font-bold mb-2">{pkg.name}</h3>
                                        <div className="flex items-baseline justify-center gap-1">
                                            <span className="text-4xl font-bold text-gradient-manga">
                                                {pkg.coins.toLocaleString()}
                                            </span>
                                            <span className="text-sm font-medium text-muted-foreground">coins</span>
                                        </div>

                                        {pkg.bonus > 0 && (
                                            <div className="mt-2 inline-flex items-center gap-1 text-sm font-medium text-green-500 bg-green-500/10 px-2 py-1 rounded-full">
                                                <Sparkles className="w-3 h-3" />
                                                +{pkg.bonus} Bonus
                                            </div>
                                        )}
                                    </div>

                                    {/* Description */}
                                    <p className="text-sm text-muted-foreground">
                                        {pkg.description}
                                    </p>
                                </div>

                                {/* Price Button */}
                                <div className="mt-6 pt-6 border-t border-border/50 w-full">
                                    <div className={`
                                        w-full py-3 rounded-xl font-bold text-center transition-colors
                                        ${selectedPackage === pkg.id
                                            ? 'bg-primary text-primary-foreground'
                                            : 'bg-secondary/20 text-secondary-foreground hover:bg-secondary/30'}
                                    `}>
                                        ${(pkg.price / 100).toFixed(2)}
                                    </div>
                                </div>
                            </button>
                        </motion.div>
                    ))}
                </div>

                {/* Checkout Section */}
                <div id="checkout-section" className="scroll-mt-24">
                    {clientSecret && selectedPackage && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            className="max-w-md mx-auto"
                        >
                            <div className="text-center mb-8">
                                <h2 className="text-2xl font-bold mb-2">Complete Your Purchase</h2>
                                <p className="text-muted-foreground">
                                    You are purchasing <span className="text-primary font-bold">{COIN_PACKAGES.find(p => p.id === selectedPackage)?.name}</span>
                                </p>
                            </div>

                            <Elements options={{ clientSecret, appearance }} stripe={stripePromise}>
                                <CheckoutForm packageId={selectedPackage} />
                            </Elements>
                        </motion.div>
                    )}
                </div>

                {/* Features / Trust Signals */}
                <div className="mt-24 grid md:grid-cols-3 gap-8 border-t border-border/50 pt-16">
                    <div className="text-center space-y-4 p-6 rounded-2xl bg-card/30">
                        <div className="w-12 h-12 mx-auto bg-blue-500/10 rounded-full flex items-center justify-center text-blue-500">
                            <Shield className="w-6 h-6" />
                        </div>
                        <h3 className="font-bold text-lg">Secure Payment</h3>
                        <p className="text-sm text-muted-foreground">
                            Your payment information is processed securely by Stripe. We never store your card details.
                        </p>
                    </div>

                    <div className="text-center space-y-4 p-6 rounded-2xl bg-card/30">
                        <div className="w-12 h-12 mx-auto bg-yellow-500/10 rounded-full flex items-center justify-center text-yellow-500">
                            <Zap className="w-6 h-6" />
                        </div>
                        <h3 className="font-bold text-lg">Instant Delivery</h3>
                        <p className="text-sm text-muted-foreground">
                            Coins are added to your wallet immediately after successful payment. Start reading right away!
                        </p>
                    </div>

                    <div className="text-center space-y-4 p-6 rounded-2xl bg-card/30">
                        <div className="w-12 h-12 mx-auto bg-pink-500/10 rounded-full flex items-center justify-center text-pink-500">
                            <Heart className="w-6 h-6" />
                        </div>
                        <h3 className="font-bold text-lg">Support Creators</h3>
                        <p className="text-sm text-muted-foreground">
                            A portion of every coin spent goes directly to supporting the manga artists and translators.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}
