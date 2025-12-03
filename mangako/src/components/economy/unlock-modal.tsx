"use client"

import { useState } from "react"
import { Coins, Lock, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { unlockChapter } from "@/app/actions"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import Link from "next/link"

interface UnlockModalProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    chapterId: string
    chapterTitle: string
    price: number
    userCoins: number
}

export function UnlockModal({
    open,
    onOpenChange,
    chapterId,
    chapterTitle,
    price,
    userCoins
}: UnlockModalProps) {
    const [loading, setLoading] = useState(false)
    const router = useRouter()
    const canAfford = userCoins >= price

    const handleUnlock = async () => {
        setLoading(true)
        try {
            const result = await unlockChapter(chapterId)
            if (result.success) {
                toast.success("Chapter unlocked!")
                onOpenChange(false)
                router.refresh()
            } else {
                toast.error(result.error || "Failed to unlock chapter")
            }
        } catch (_error) {
            toast.error("An unexpected error occurred")
        } finally {
            setLoading(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Lock className="w-5 h-5 text-yellow-500" />
                        Unlock Chapter
                    </DialogTitle>
                    <DialogDescription>
                        Unlock <strong>{chapterTitle}</strong> to start reading.
                    </DialogDescription>
                </DialogHeader>

                <div className="py-6 flex flex-col items-center gap-4">
                    <div className="flex items-center gap-4 text-lg">
                        <div className="flex flex-col items-center gap-1">
                            <span className="text-sm text-muted-foreground">Price</span>
                            <div className="flex items-center gap-1 font-bold text-red-500">
                                <Coins className="w-5 h-5" />
                                {price}
                            </div>
                        </div>
                        <div className="h-8 w-px bg-border" />
                        <div className="flex flex-col items-center gap-1">
                            <span className="text-sm text-muted-foreground">Your Balance</span>
                            <div className="flex items-center gap-1 font-bold text-yellow-500">
                                <Coins className="w-5 h-5" />
                                {userCoins}
                            </div>
                        </div>
                    </div>

                    {!canAfford && (
                        <div className="text-sm text-red-500 font-medium bg-red-500/10 px-4 py-2 rounded-md">
                            You need {price - userCoins} more coins to unlock this chapter.
                        </div>
                    )}
                </div>

                <DialogFooter className="flex-col sm:flex-row gap-2">
                    {canAfford ? (
                        <Button onClick={handleUnlock} disabled={loading} className="w-full sm:w-auto">
                            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Unlock Now
                        </Button>
                    ) : (
                        <Link href="/shop" className="w-full sm:w-auto">
                            <Button className="w-full">Get More Coins</Button>
                        </Link>
                    )}
                    <Button variant="outline" onClick={() => onOpenChange(false)} className="w-full sm:w-auto">
                        Cancel
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
