"use client"

import { Settings as SettingsIcon, Trash2, HardDrive } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useState } from "react"
import { clearLocalStorage, getLocalStorageSize } from "@/lib/storage-utils"

export default function SettingsPage() {
    // Use lazy initialization instead of useEffect to avoid cascading renders
    const [storageSize, setStorageSize] = useState(() => getLocalStorageSize())

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-3xl font-bold tracking-tight">Settings</h2>
                <p className="text-muted-foreground">Configure your Mangako site settings.</p>
            </div>

            <div className="grid gap-4 max-w-2xl">
                {/* Storage Management */}
                <Card className="border-zinc-800">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <HardDrive className="w-5 h-5" />
                            Storage Management
                        </CardTitle>
                        <CardDescription>Manage local data storage</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-zinc-900/50 rounded-lg border border-zinc-800">
                            <div>
                                <p className="font-semibold">LocalStorage Usage</p>
                                <p className="text-sm text-zinc-500">Current data size</p>
                            </div>
                            <div className="text-right">
                                <p className="text-2xl font-bold text-primary">{storageSize} KB</p>
                                <p className="text-xs text-zinc-600">of ~5-10 MB limit</p>
                            </div>
                        </div>

                        <div className="border-t border-zinc-800 pt-4">
                            <div className="space-y-2 mb-4">
                                <p className="text-sm font-semibold">Storage includes:</p>
                                <ul className="text-xs text-zinc-500 space-y-1 ml-4">
                                    <li>• Chapter data and images (Base64)</li>
                                    <li>• User ratings and preferences</li>
                                    <li>• Unlocked chapters and coins</li>
                                    <li>• Admin and user authentication</li>
                                </ul>
                            </div>

                            <Button
                                variant="destructive"
                                className="w-full"
                                onClick={clearLocalStorage}
                            >
                                <Trash2 className="w-4 h-4 mr-2" />
                                Clear All Data
                            </Button>
                            <p className="text-xs text-zinc-600 mt-2 text-center">
                                ⚠️ This will delete all chapters, ratings, and settings
                            </p>
                        </div>
                    </CardContent>
                </Card>

                {/* Info Card */}
                <Card className="border-zinc-800 bg-blue-500/5">
                    <CardContent className="pt-6">
                        <div className="flex gap-3">
                            <SettingsIcon className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
                            <div className="space-y-1">
                                <p className="text-sm font-semibold">Storage Limitation</p>
                                <p className="text-xs text-zinc-400">
                                    Base64 images are stored in LocalStorage which has a 5-10MB limit.
                                    For production, consider using a cloud storage service like Cloudinary or AWS S3.
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
