"use client"

import { Users as UsersIcon } from "lucide-react"

export default function UsersPage() {
    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-3xl font-bold tracking-tight">Users</h2>
                <p className="text-muted-foreground">Manage your manga readers and subscribers.</p>
            </div>

            <div className="flex flex-col items-center justify-center py-20 border-2 border-dashed border-zinc-800 rounded-lg bg-zinc-900/20">
                <UsersIcon className="w-16 h-16 text-zinc-700 mb-4" />
                <h3 className="text-xl font-semibold text-zinc-400 mb-2">Coming Soon</h3>
                <p className="text-sm text-zinc-600">User management features will be available soon.</p>
            </div>
        </div>
    )
}
