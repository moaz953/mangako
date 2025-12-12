"use client"

import { cn } from "@/lib/utils"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
    LayoutDashboard,
    BookOpen,
    Book,
    Users,
    FileText,
    Coins,
    Settings,
    LogOut,
    ChevronLeft,
    Menu
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { signOut } from "next-auth/react"
import { useState } from "react"

interface NavItem {
    title: string
    href: string
    icon: React.ElementType
}

const navItems: NavItem[] = [
    {
        title: "Dashboard",
        href: "/admin",
        icon: LayoutDashboard
    },
    {
        title: "Stories",
        href: "/admin/stories",
        icon: Book
    },
    {
        title: "Chapters",
        href: "/admin/chapters",
        icon: BookOpen
    },
    {
        title: "Users",
        href: "/admin/users",
        icon: Users
    },
    {
        title: "Submissions",
        href: "/admin/submissions",
        icon: FileText
    },
    {
        title: "Settings",
        href: "/admin/settings",
        icon: Settings
    }
]

interface AdminSidebarProps {
    className?: string
}

export function AdminSidebar({ className }: AdminSidebarProps) {
    const pathname = usePathname()
    const [isCollapsed, setIsCollapsed] = useState(false)

    const handleLogout = async () => {
        await signOut({ callbackUrl: "/" })
    }

    return (
        <div
            className={cn(
                "flex flex-col h-screen bg-card border-r border-border transition-all duration-300",
                isCollapsed ? "w-16" : "w-64",
                className
            )}
        >
            {/* Header */}
            <div className="p-4 border-b border-border flex items-center justify-between">
                {!isCollapsed && (
                    <h2 className="font-bold text-lg">Admin Panel</h2>
                )}
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setIsCollapsed(!isCollapsed)}
                    className="ml-auto"
                >
                    {isCollapsed ? (
                        <Menu className="h-4 w-4" />
                    ) : (
                        <ChevronLeft className="h-4 w-4" />
                    )}
                </Button>
            </div>

            {/* Navigation */}
            <nav className="flex-1 p-2 space-y-1 overflow-y-auto">
                {navItems.map((item) => {
                    const Icon = item.icon
                    const isActive = pathname === item.href ||
                        (item.href !== "/admin" && pathname?.startsWith(item.href))

                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                "flex items-center gap-3 px-3 py-2 rounded-lg transition-colors",
                                "hover:bg-accent hover:text-accent-foreground",
                                isActive && "bg-primary text-primary-foreground hover:bg-primary/90",
                                isCollapsed && "justify-center"
                            )}
                            title={isCollapsed ? item.title : undefined}
                        >
                            <Icon className="h-5 w-5 flex-shrink-0" />
                            {!isCollapsed && (
                                <span className="font-medium">{item.title}</span>
                            )}
                        </Link>
                    )
                })}
            </nav>

            {/* Logout */}
            <div className="p-2 border-t border-border">
                <Button
                    variant="ghost"
                    className={cn(
                        "w-full justify-start gap-3",
                        isCollapsed && "justify-center px-0"
                    )}
                    onClick={handleLogout}
                >
                    <LogOut className="h-5 w-5" />
                    {!isCollapsed && <span>Logout</span>}
                </Button>
            </div>
        </div>
    )
}
