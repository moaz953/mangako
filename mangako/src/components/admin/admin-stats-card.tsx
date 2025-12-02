"use client"

import { TrendingUp, TrendingDown } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"

interface AdminStatsCardProps {
    title: string
    value: string | number
    icon: React.ReactNode
    trend?: {
        value: number
        isPositive: boolean
    }
    description?: string
}

export function AdminStatsCard({
    title,
    value,
    icon,
    trend,
    description
}: AdminStatsCardProps) {
    return (
        <Card className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
                <div className="flex items-center justify-between space-x-4">
                    <div className="flex-1">
                        <p className="text-sm font-medium text-muted-foreground mb-1">
                            {title}
                        </p>
                        <p className="text-3xl font-bold tracking-tight">
                            {value}
                        </p>
                        {trend && (
                            <div className="flex items-center gap-1 mt-2">
                                {trend.isPositive ? (
                                    <TrendingUp className="h-4 w-4 text-green-500" />
                                ) : (
                                    <TrendingDown className="h-4 w-4 text-red-500" />
                                )}
                                <span className={cn(
                                    "text-sm font-medium",
                                    trend.isPositive ? "text-green-500" : "text-red-500"
                                )}>
                                    {trend.value}%
                                </span>
                                <span className="text-sm text-muted-foreground">
                                    vs last month
                                </span>
                            </div>
                        )}
                        {description && (
                            <p className="text-xs text-muted-foreground mt-2">
                                {description}
                            </p>
                        )}
                    </div>
                    <div className="p-3 bg-primary/10 rounded-full">
                        {icon}
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}
