import { Button } from "@/components/ui/button"
import { Lock, Loader2, Coins } from "lucide-react"

interface PaywallProps {
    chapterTitle?: string | null
    price?: number
    isUnlocking?: boolean
    onUnlock: () => void
}

export function Paywall({ chapterTitle, price = 1, isUnlocking = false, onUnlock }: PaywallProps) {
    const displayTitle = chapterTitle || "This Chapter"

    return (
        <div className="flex flex-col items-center justify-center p-8 space-y-6 text-center border rounded-xl bg-card/50 backdrop-blur-sm border-border/50 my-8 max-w-md w-full mx-auto shadow-2xl relative overflow-hidden">
            {/* Background Effect */}
            <div className="absolute inset-0 bg-gradient-manga opacity-5 pointer-events-none" />

            <div className="animate-fade-in relative z-10">
                <div className="p-4 bg-primary/10 rounded-full inline-block mb-4 ring-1 ring-primary/20">
                    <Lock className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-2xl font-bold bg-gradient-manga bg-clip-text text-transparent">
                    Unlock Chapter
                </h3>
                <p className="text-muted-foreground mt-2">
                    &quot;{displayTitle}&quot; is locked.
                </p>
                <div className="flex items-center justify-center gap-2 mt-4 text-lg font-medium">
                    <span>Price:</span>
                    <span className="flex items-center gap-1 text-primary font-bold">
                        {price} <Coins className="w-4 h-4" />
                    </span>
                </div>
            </div>

            <Button
                size="lg"
                onClick={onUnlock}
                disabled={isUnlocking}
                className="w-full font-bold text-lg bg-gradient-manga hover:opacity-90 transition-opacity relative z-10"
            >
                {isUnlocking ? (
                    <>
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                        Unlocking...
                    </>
                ) : (
                    <>
                        Unlock Now
                    </>
                )}
            </Button>

            <p className="text-xs text-muted-foreground relative z-10">
                Support the creator and enjoy the story!
            </p>
        </div>
    )
}
