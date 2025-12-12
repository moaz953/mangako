"use client"

import { useEffect, useState } from "react"
import { usePathname, useRouter } from "next/navigation"
import { AdminSidebar } from "@/components/admin/admin-sidebar"
import { Button } from "@/components/ui/button"
import { Menu, X } from "lucide-react"
import { Sheet, SheetContent } from "@/components/ui/sheet"

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const pathname = usePathname()
    const router = useRouter()
    const [isAuthenticated, setIsAuthenticated] = useState(false)
    const [isLoading, setIsLoading] = useState(true)
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

    useEffect(() => {
        // Check authentication (skip for login page)
        if (pathname === "/admin/login") {
            return
        }

        const auth = localStorage.getItem("adminAuth")
        if (auth === "true") {
            if (!isAuthenticated) setIsAuthenticated(true)
        } else {
            router.push("/admin/login")
        }
        setIsLoading(false)
    }, [pathname, router])

    // Loading state
    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        )
    }

    // Login page doesn't need layout
    if (pathname === "/admin/login") {
        return <>{children}</>
    }

    // Protected content
    if (!isAuthenticated) {
        return null
    }

    return (
        <div className="flex min-h-screen bg-background">
            {/* Desktop Sidebar */}
            <div className="hidden md:block">
                <AdminSidebar />
            </div>

            {/* Mobile Menu Button */}
            <div className="md:hidden fixed top-4 left-4 z-50">
                <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setMobileMenuOpen(true)}
                >
                    <Menu className="h-5 w-5" />
                </Button>
            </div>

            {/* Mobile Sidebar Sheet */}
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
                <SheetContent side="left" className="p-0 w-64">
                    <AdminSidebar />
                </SheetContent>
            </Sheet>

            {/* Main Content */}
            <main className="flex-1 overflow-auto">
                <div className="p-4 md:p-8 max-w-7xl mx-auto">
                    {children}
                </div>
            </main>
        </div>
    )
}
