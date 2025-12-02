"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { useSession, signOut } from "next-auth/react"
import { usePathname, useRouter } from "next/navigation"
import { Menu, X, User, LogOut, Coins, Home, BookOpen, ShoppingCart, BookText, Send, Heart } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export function NavigationHeader() {
    const pathname = usePathname()
    const router = useRouter()
    const { data: session } = useSession()
    // Cast user to include coins since we haven't updated the type definition globally yet
    const user = session?.user as { name?: string | null, email?: string | null, image?: string | null, coins?: number, role?: string } | undefined
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

    const handleLogout = () => {
        signOut({ callbackUrl: '/' })
    }

    const navItems = [
        { href: "/", label: "Home", icon: Home },
        { href: "/library", label: "My Library", icon: Heart },
        { href: "/wiki", label: "Wiki", icon: BookText },
        { href: "/shop", label: "Shop", icon: ShoppingCart },
        { href: "/submit", label: "Submit", icon: Send },
    ]

    // Don't show on admin pages
    if (pathname?.startsWith("/admin")) {
        return null
    }

    return (
        <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="container mx-auto px-4 md:px-8">
                <div className="flex h-16 items-center justify-between">
                    {/* Logo */}
                    <Link href="/" className="flex items-center group">
                        <Image
                            src="/mangako-logo.png"
                            alt="Mangako"
                            width={140}
                            height={45}
                            className="object-contain transition-transform duration-300 group-hover:scale-105"
                            style={{ height: '40px', width: 'auto' }}
                            priority
                        />
                    </Link>

                    {/* Desktop Navigation */}
                    <nav className="hidden md:flex items-center gap-1">
                        {navItems.map((item) => {
                            const Icon = item.icon
                            const isActive = pathname === item.href
                            return (
                                <Link key={item.href} href={item.href}>
                                    <Button
                                        variant={isActive ? "secondary" : "ghost"}
                                        size="sm"
                                        className="gap-2"
                                    >
                                        <Icon className="h-4 w-4" />
                                        {item.label}
                                    </Button>
                                </Link>
                            )
                        })}
                    </nav>

                    {/* User Menu */}
                    <div className="flex items-center gap-2">
                        {user ? (
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="outline" size="sm" className="gap-2 hover-glow">
                                        <User className="h-4 w-4" />
                                        <span className="hidden sm:inline">{user.name}</span>
                                        <div className="flex items-center gap-1 px-2 py-0.5 bg-gradient-manga rounded-full">
                                            <Coins className="h-3 w-3 text-white" />
                                            <span className="text-xs font-bold text-white">{user.coins}</span>
                                        </div>
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-56">
                                    <DropdownMenuLabel>
                                        <div className="flex flex-col space-y-1">
                                            <p className="text-sm font-medium">{user.name}</p>
                                            <p className="text-xs text-muted-foreground">{user.email}</p>
                                        </div>
                                    </DropdownMenuLabel>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem asChild>
                                        <Link href="/shop" className="cursor-pointer">
                                            <Coins className="mr-2 h-4 w-4 text-yellow-500" />
                                            <span>Buy Coins ({user.coins})</span>
                                        </Link>
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-red-500">
                                        <LogOut className="mr-2 h-4 w-4" />
                                        <span>Logout</span>
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        ) : (
                            <Link href="/login">
                                <Button size="sm" className="gap-2">
                                    <User className="h-4 w-4" />
                                    Login
                                </Button>
                            </Link>
                        )}

                        {/* Mobile Menu Button */}
                        <Button
                            variant="ghost"
                            size="sm"
                            className="md:hidden"
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        >
                            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                        </Button>
                    </div>
                </div>

                {/* Mobile Navigation */}
                {mobileMenuOpen && (
                    <nav className="md:hidden py-4 space-y-2 border-t border-border/40">
                        {navItems.map((item) => {
                            const Icon = item.icon
                            const isActive = pathname === item.href
                            return (
                                <Link key={item.href} href={item.href} onClick={() => setMobileMenuOpen(false)}>
                                    <Button
                                        variant={isActive ? "secondary" : "ghost"}
                                        className="w-full justify-start gap-2"
                                    >
                                        <Icon className="h-4 w-4" />
                                        {item.label}
                                    </Button>
                                </Link>
                            )
                        })}
                    </nav>
                )}
            </div>
        </header>
    )
}
