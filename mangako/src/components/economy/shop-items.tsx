"use client"

import { useState } from "react"
import { Coins, CreditCard, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { purchaseCoins } from "@/app/actions"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

const COIN_PACKAGES = [
    { amount: 100, price: 0, label: "Starter Pack" },
    { amount: 500, price: 0, label: "Reader Pack" },
    { amount: 1000, price: 0, label: "Otaku Pack" },
    { amount: 5000, price: 0, label: "Whale Pack" },
]

export function ShopItems() {
    const [loading, setLoading] = useState<number | null>(null)
    const router = useRouter()

    const handlePurchase = async (amount: number) => {
        setLoading(amount)
        try {
            const result = await purchaseCoins(amount)
            if (result.success) {
                toast.success(`Successfully purchased ${amount} coins!`)
                router.refresh()
            } else {
                toast.error(result.error || "Failed to purchase coins")
            }
        } catch (_error) {
            toast.error("An unexpected error occurred")
        } finally {
            setLoading(null)
        }
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {COIN_PACKAGES.map((pkg) => (
                <Card key={pkg.amount} className="relative overflow-hidden border-2 hover:border-primary/50 transition-colors">
                    <CardHeader className="text-center pb-2">
                        <CardTitle className="text-xl">{pkg.label}</CardTitle>
                        <CardDescription>Get {pkg.amount} Coins</CardDescription>
                    </CardHeader>
                    <CardContent className="flex flex-col items-center justify-center py-6 gap-4">
                        <div className="p-4 bg-yellow-500/10 rounded-full">
                            <Coins className="w-12 h-12 text-yellow-500" />
                        </div>
                        <div className="text-3xl font-bold text-yellow-500">
                            {pkg.amount}
                        </div>
                    </CardContent>
                    <CardFooter>
                        <Button
                            className="w-full gap-2"
                            onClick={() => handlePurchase(pkg.amount)}
                            disabled={loading !== null}
                        >
                            {loading === pkg.amount ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                                <CreditCard className="w-4 h-4" />
                            )}
                            {pkg.price === 0 ? "Free (Test)" : `$${pkg.price}`}
                        </Button>
                    </CardFooter>
                </Card>
            ))}
        </div>
    )
}
