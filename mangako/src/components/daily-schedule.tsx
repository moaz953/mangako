"use client"

import { useState } from "react"

import { Badge } from "@/components/ui/badge"
import { Star } from "lucide-react"
import Link from "next/link"

const DAYS = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"]

const GRADIENTS = [
    "from-blue-500 to-purple-600",
    "from-green-500 to-teal-600",
    "from-orange-500 to-red-600",
    "from-pink-500 to-rose-600",
    "from-indigo-500 to-blue-600",
    "from-yellow-500 to-orange-600"
]

// Mock data generator
const generateSchedule = (day: string) => {
    return Array.from({ length: 6 }).map((_, i) => ({
        id: `${day}-${i}`,
        title: `Manga Title ${i + 1}`,
        genre: ["Action", "Romance", "Fantasy", "Drama", "Horror"][i % 5],
        rating: (4.5 + Math.random() * 0.5).toFixed(1),
        gradient: GRADIENTS[i % GRADIENTS.length],
        likes: Math.floor(Math.random() * 10000),
        isNew: Math.random() > 0.7
    }))
}

export function DailySchedule() {
    const [activeDay, setActiveDay] = useState("MON")
    const scheduleData = generateSchedule(activeDay)

    return (
        <div className="w-full space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-2xl md:text-3xl font-bold tracking-tight">Daily Release Schedule</h2>
                <Link href="/schedule" className="text-sm text-primary hover:underline">
                    View All
                </Link>
            </div>

            {/* Day Tabs */}
            <div className="flex w-full border-b border-border/50 overflow-x-auto">
                {DAYS.map((day) => (
                    <button
                        key={day}
                        onClick={() => setActiveDay(day)}
                        className={`flex-1 min-w-[60px] pb-3 text-sm font-semibold transition-colors relative ${activeDay === day ? "text-primary" : "text-muted-foreground hover:text-foreground"
                            }`}
                    >
                        {day}
                        {activeDay === day && (
                            <div
                                className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary transition-all duration-300"
                            />
                        )}
                    </button>
                ))}
            </div>

            {/* Content Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                {scheduleData.map((manga, index) => (
                    <div
                        key={manga.id}
                        className="animate-fade-in"
                        style={{ animationDelay: `${index * 0.05}s`, animationFillMode: 'forwards', opacity: 0 }}
                    >
                        <Link href={`/manga/${manga.id}`} className="group block space-y-3">
                            <div className="relative aspect-[3/4] overflow-hidden rounded-lg bg-gradient-to-br shadow-md group-hover:shadow-xl transition-all duration-300">
                                <div className={`absolute inset-0 bg-gradient-to-br ${manga.gradient}`} />

                                {/* Overlay Pattern */}
                                <div className="absolute inset-0 opacity-20">
                                    <div className="absolute inset-0" style={{
                                        backgroundImage: 'linear-gradient(45deg, rgba(0,0,0,0.1) 25%, transparent 25%, transparent 75%, rgba(0,0,0,0.1) 75%, rgba(0,0,0,0.1)), linear-gradient(45deg, rgba(0,0,0,0.1) 25%, transparent 25%, transparent 75%, rgba(0,0,0,0.1) 75%, rgba(0,0,0,0.1))',
                                        backgroundSize: '20px 20px',
                                        backgroundPosition: '0 0, 10px 10px'
                                    }} />
                                </div>

                                {manga.isNew && (
                                    <Badge className="absolute top-2 left-2 bg-white text-black font-bold shadow-lg z-10">
                                        UP
                                    </Badge>
                                )}

                                <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                                    <div className="flex items-center text-white text-xs font-medium">
                                        <Star className="w-3 h-3 text-yellow-400 mr-1 fill-current" />
                                        {manga.rating}
                                    </div>
                                </div>

                                {/* Center Title Overlay */}
                                <div className="absolute inset-0 flex items-center justify-center p-4">
                                    <p className="text-white font-bold text-center text-sm leading-tight drop-shadow-lg">
                                        {manga.title}
                                    </p>
                                </div>
                            </div>

                            <div className="space-y-1">
                                <h3 className="font-semibold leading-none truncate group-hover:text-primary transition-colors text-sm">
                                    {manga.title}
                                </h3>
                                <p className="text-xs text-muted-foreground">{manga.genre}</p>
                            </div>
                        </Link>
                    </div>
                ))}
            </div>
        </div>
    )
}
