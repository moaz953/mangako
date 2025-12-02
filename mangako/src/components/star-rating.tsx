"use client"

import { Star } from "lucide-react"
import { useState } from "react"

interface StarRatingProps {
    rating: number
    onRate?: (rating: number) => void
    readonly?: boolean
    size?: "sm" | "md" | "lg"
}

export function StarRating({ rating, onRate, readonly = false, size = "md" }: StarRatingProps) {
    const [hoverRating, setHoverRating] = useState(0)

    const sizeClasses = {
        sm: "w-4 h-4",
        md: "w-5 h-5",
        lg: "w-6 h-6",
    }

    const handleClick = (value: number) => {
        if (!readonly && onRate) {
            onRate(value)
        }
    }

    return (
        <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((star) => {
                const isFilled = star <= (hoverRating || rating)
                return (
                    <button
                        key={star}
                        type="button"
                        onClick={() => handleClick(star)}
                        onMouseEnter={() => !readonly && setHoverRating(star)}
                        onMouseLeave={() => !readonly && setHoverRating(0)}
                        disabled={readonly}
                        className={`transition-all ${readonly ? "cursor-default" : "cursor-pointer hover:scale-110"}`}
                    >
                        <Star
                            className={`${sizeClasses[size]} transition-colors ${isFilled
                                ? "fill-yellow-500 text-yellow-500"
                                : "text-zinc-600"
                                }`}
                        />
                    </button>
                )
            })}
        </div>
    )
}
