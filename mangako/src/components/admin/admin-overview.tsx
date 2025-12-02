"use client"

import { Book, BookOpen, Users, Coins, Plus, Eye, ArrowRight } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { AdminStatsCard } from "./admin-stats-card"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface AdminStats {
    totalStories: number
    totalChapters: number
    totalUsers: number
    totalCoins: number
}

interface AdminOverviewProps {
    stats: AdminStats
}

export function AdminOverview({ stats }: AdminOverviewProps) {
    const quickActions = [
        { label: "New Story", href: "/admin/stories", icon: Book },
        { label: "New Chapter", href: "/admin/chapters", icon: BookOpen },
        { label: "View Users", href: "/admin/users", icon: Users },
        { label: "Submissions", href: "/admin/submissions", icon: Eye },
    ]

    return (
        <div className="space-y-8">
            {/* Stats Grid */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                <AdminStatsCard
                    title="Total Stories"
                    value={stats.totalStories}
                    icon={<Book className="h-6 w-6 text-primary" />}
                    description="Published manga series"
                />
                <AdminStatsCard
                    title="Total Chapters"
                    value={stats.totalChapters}
                    icon={<BookOpen className="h-6 w-6 text-primary" />}
                    description="All chapters combined"
                />
                <AdminStatsCard
                    title="Total Users"
                    value={stats.totalUsers}
                    icon={<Users className="h-6 w-6 text-primary" />}
                    description="Registered readers"
                />
                <AdminStatsCard
                    title="Total Coins"
                    value={stats.totalCoins.toLocaleString()}
                    icon={<Coins className="h-6 w-6 text-yellow-500" />}
                    description="In circulation"
                />
            </div>

            {/* Quick Actions */}
            <Card>
                <CardHeader>
                    <CardTitle>Quick Actions</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                        {quickActions.map((action) => {
                            const Icon = action.icon
                            return (
                                <Link key={action.href} href={action.href}>
                                    <Button
                                        variant="outline"
                                        className="w-full justify-start gap-2 h-auto py-4"
                                    >
                                        <div className="p-2 bg-primary/10 rounded-md">
                                            <Icon className="h-4 w-4 text-primary" />
                                        </div>
                                        <span>{action.label}</span>
                                        <ArrowRight className="h-4 w-4 ml-auto" />
                                    </Button>
                                </Link>
                            )
                        })}
                    </div>
                </CardContent>
            </Card>

            {/* Navigation Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <Link href="/admin/stories">
                    <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Book className="h-5 w-5" />
                                Manage Stories
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-muted-foreground">
                                Create, edit, and manage manga series
                            </p>
                        </CardContent>
                    </Card>
                </Link>

                <Link href="/admin/chapters">
                    <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <BookOpen className="h-5 w-5" />
                                Manage Chapters
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-muted-foreground">
                                Upload and manage chapter pages
                            </p>
                        </CardContent>
                    </Card>
                </Link>

                <Link href="/admin/users">
                    <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Users className="h-5 w-5" />
                                User Management
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-muted-foreground">
                                View and manage user accounts
                            </p>
                        </CardContent>
                    </Card>
                </Link>
            </div>
        </div>
    )
}
