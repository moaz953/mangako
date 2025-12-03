"use client"

import { useState } from "react"
import { Coins, Heart, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { tipArtist } from "@/app/actions"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import Link from "next/link"

interface TipButtonProps {
    storyId: string
    artistName?: string
    userCoins: number
}

const TIP_AMOUNTS = [10, 50, 100, 500]

export function TipButton({
    storyId,
    artistName = "the artist",
    userCoins
}: TipButtonProps) {
    const [open, setOpen] = useState(false)
    const [loading, setLoading] = useState<number | null>(null)
    const router = useRouter()

    const handleTip = async (amount: number) => {
        if (userCoins < amount) {
            toast.error("Insufficient coins")
            return
        }

        setLoading(amount)
        try {
            const result = await tipArtist(storyId, amount)
            if (result.success) {
                toast.success(`Sent ${amount} coins to ${artistName}!`)
                setOpen(false)
                router.refresh()
            } else {
                toast.error(result.error || "Failed to send tip")
            }
        } catch (_error) {
            toast.error("An unexpected error occurred")
        } finally {
            setLoading(null)
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="secondary" size="sm" className="gap-2">
                    <Heart className="w-4 h-4 text-red-500 fill-red-500/20" />
                    Tip Artist
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Heart className="w-5 h-5 text-red-500 fill-red-500" />
                        Support {artistName}
                    </DialogTitle>
                    <DialogDescription>
                        Send coins to show your appreciation for their work.
                    </DialogDescription>
                </DialogHeader>

                <div className="py-4">
                    <div className="flex items-center justify-between mb-4 px-2">
                        <span className="text-sm text-muted-foreground">Your Balance</span>
                        <div className="flex items-center gap-1 font-bold text-yellow-500">
                            <Coins className="w-4 h-4" />
                            {userCoins}
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        {TIP_AMOUNTS.map((amount) => (
                            <Button
                                key={amount}
                                variant="outline"
                                className="h-16 flex flex-col gap-1 hover:border-yellow-500 hover:bg-yellow-500/5"
                                onClick={() => handleTip(amount)}
                                disabled={loading !== null || userCoins < amount}
                            >
                                {loading === amount ? (
                                    <Loader2 className="w-6 h-6 animate-spin text-yellow-500" />
                                ) : (
                                    <Coins className="w-6 h-6 text-yellow-500" />
                                )}
                                <span className="font-bold">{amount} Coins</span>
                            </Button>
                        ))}
                    </div>

                    {userCoins < 10 && (
                        <div className="mt-4 text-center">
                            <Link href="/shop">
                                <Button variant="link" className="text-yellow-500">
                                    Get more coins
                                </Button>
                            </Link>
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    )
}
