"use client"

import { useEffect, useState } from 'react'

export function FloatingElements() {
    const [elements] = useState(() => Array.from({ length: 15 }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: Math.random() * 4 + 2,
        duration: Math.random() * 10 + 10,
        delay: Math.random() * 5,
    })))

    return (
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {elements.map((el) => (
                <div
                    key={el.id}
                    className="absolute rounded-full bg-primary/20 animate-float"
                    style={{
                        left: `${el.x}%`,
                        top: `${el.y}%`,
                        width: `${el.size}px`,
                        height: `${el.size}px`,
                        animationDuration: `${el.duration}s`,
                        animationDelay: `${el.delay}s`,
                    }}
                />
            ))}
        </div>
    )
}
