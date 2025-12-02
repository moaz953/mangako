"use client"

import { BookOpen, Users, TrendingUp, Zap } from "lucide-react"
import { AnimatedCounter } from "./animated-counter"
import { Card } from "./ui/card"

interface LiveStatsProps {
    totalStories: number
    totalChapters: number
    totalReaders?: number
    newThisWeek?: number
}

export function LiveStats({
    totalStories,
    totalChapters,
    totalReaders = 0,
    newThisWeek = 0
}: LiveStatsProps) {
    const stats = [
        {
            icon: BookOpen,
            label: "Manga Series",
            value: totalStories,
            color: "text-blue-500"
        },
        {
            icon: TrendingUp,
            label: "Total Chapters",
            value: totalChapters,
            color: "text-green-500"
        },
        {
            icon: Users,
            label: "Active Readers",
            value: totalReaders,
            color: "text-purple-500",
            suffix: "+"
        },
        {
            icon: Zap,
            label: "New This Week",
            value: newThisWeek,
            color: "text-yellow-500"
        }
    ]

    return (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {stats.map((stat, index) => {
                const Icon = stat.icon
                return (
                    <Card
                        key={index}
                        className="p-6 bg-card/50 backdrop-blur-sm border-border/50 hover:border-primary/50 transition-all duration-300"
                    >
                        <div className="flex flex-col items-center text-center space-y-2">
                            <div className={`p-3 rounded-full bg-primary/10 ${stat.color}`}>
                                <Icon className="w-6 h-6" />
                            </div>
                            <div className="text-3xl md:text-4xl font-black tracking-tight">
                                <AnimatedCounter
                                    end={stat.value}
                                    duration={2000}
                                    suffix={stat.suffix || ""}
                                />
                            </div>
                            <p className="text-sm text-muted-foreground font-medium">
                                {stat.label}
                            </p>
                        </div>
                    </Card>
                )
            })}
        </div>
    )
}
