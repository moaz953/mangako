"use client"

import { useState, useEffect } from "react"
import { getAdminStats } from "../actions"
import { AdminOverview } from "@/components/admin/admin-overview"
import { Skeleton } from "@/components/ui/skeleton"

interface AdminStats {
    totalStories: number
    totalChapters: number
    totalUsers: number
    totalCoins: number
}

export default function AdminDashboard() {
    const [stats, setStats] = useState<AdminStats>({
        totalStories: 0,
        totalChapters: 0,
        totalUsers: 0,
        totalCoins: 0
    })
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const loadStats = async () => {
            try {
                const data = await getAdminStats()
                setStats(data)
            } catch (_error) {
                console.error("Failed to load admin stats:", _error)
            }
            setLoading(false)
        }

        loadStats()
    }, [])

    if (loading) {
        return (
            <div className="space-y-8">
                <div>
                    <Skeleton className="h-10 w-64 mb-2" />
                    <Skeleton className="h-5 w-96" />
                </div>
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                    {Array.from({ length: 4 }).map((_, i) => (
                        <Skeleton key={i} className="h-32" />
                    ))}
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl md:text-4xl font-bold tracking-tight">Dashboard</h1>
                <p className="text-muted-foreground mt-2">
                    Welcome to Mangako Admin Panel. Manage your manga platform efficiently.
                </p>
            </div>

            <AdminOverview stats={stats} />
        </div>
    )
}
