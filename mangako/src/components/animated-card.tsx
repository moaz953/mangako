"use client"

import { ReactNode } from 'react'

interface AnimatedCardProps {
    children: ReactNode
    delay?: number
    className?: string
}

export function AnimatedCard({ children, delay = 0, className = '' }: AnimatedCardProps) {
    return (
        <div
            className={`animate-slide-up ${className}`}
            style={{ animationDelay: `${delay}s` }}
        >
            {children}
        </div>
    )
}
