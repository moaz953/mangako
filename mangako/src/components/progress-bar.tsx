import { cn } from "@/lib/utils"

interface ProgressBarProps {
    current: number
    total: number
    className?: string
    showText?: boolean
    size?: "sm" | "md" | "lg"
    variant?: "default" | "success" | "warning" | "gradient"
    animated?: boolean
}

export function ProgressBar({
    current,
    total,
    className,
    showText = true,
    size = "md",
    variant = "default",
    animated = true
}: ProgressBarProps) {
    const percentage = Math.min(Math.round((current / total) * 100), 100)

    const heightClass = {
        sm: "h-1.5",
        md: "h-2.5",
        lg: "h-4"
    }

    const variantClasses = {
        default: "bg-primary",
        success: "bg-green-500",
        warning: "bg-yellow-500",
        gradient: "bg-gradient-to-r from-primary via-purple-500 to-pink-500"
    }

    return (
        <div className={cn("w-full", className)}>
            {showText && (
                <div className="flex justify-between text-xs text-muted-foreground mb-1.5">
                    <span className="font-medium">Page {current} of {total}</span>
                    <span className="font-semibold">{percentage}%</span>
                </div>
            )}
            <div className={cn(
                "w-full bg-secondary/50 rounded-full overflow-hidden relative",
                heightClass[size]
            )}>
                {/* Background glow effect */}
                {percentage > 0 && (
                    <div
                        className={cn(
                            "absolute inset-0 opacity-20 blur-sm",
                            variantClasses[variant]
                        )}
                        style={{ width: `${percentage}%` }}
                    />
                )}

                {/* Main progress bar */}
                <div
                    className={cn(
                        "h-full relative z-10",
                        variantClasses[variant],
                        animated && "transition-all duration-500 ease-out",
                        percentage > 0 && "shadow-sm"
                    )}
                    style={{ width: `${percentage}%` }}
                >
                    {/* Animated pulse effect for active progress */}
                    {animated && percentage > 0 && percentage < 100 && (
                        <div className="absolute inset-0 bg-white/20 animate-pulse" />
                    )}
                </div>
            </div>
        </div>
    )
}
