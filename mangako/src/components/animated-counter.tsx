"use client"

import { useEffect, useRef, useState } from "react"

interface AnimatedCounterProps {
    end: number
    duration?: number
    prefix?: string
    suffix?: string
    className?: string
}

export function AnimatedCounter({
    end,
    duration = 2000,
    prefix = "",
    suffix = "",
    className = ""
}: AnimatedCounterProps) {
    const [count, setCount] = useState(0)
    const countRef = useRef(0)
    const [isVisible, setIsVisible] = useState(false)
    const elementRef = useRef<HTMLSpanElement>(null)

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIsVisible(true)
                }
            },
            { threshold: 0.1 }
        )

        if (elementRef.current) {
            observer.observe(elementRef.current)
        }

        return () => observer.disconnect()
    }, [])

    useEffect(() => {
        if (!isVisible) return

        const startTime = Date.now()
        const endTime = startTime + duration

        const updateCount = () => {
            const now = Date.now()
            const progress = Math.min((now - startTime) / duration, 1)

            // Easing function for smooth animation
            const easeOutQuart = 1 - Math.pow(1 - progress, 4)
            const currentCount = Math.floor(easeOutQuart * end)

            countRef.current = currentCount
            setCount(currentCount)

            if (progress < 1) {
                requestAnimationFrame(updateCount)
            }
        }

        requestAnimationFrame(updateCount)
    }, [end, duration, isVisible])

    return (
        <span ref={elementRef} className={className}>
            {prefix}{count.toLocaleString()}{suffix}
        </span>
    )
}
