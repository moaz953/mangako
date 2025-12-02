"use client"

import { useState } from "react"
import { Lock, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useRouter } from "next/navigation"

export default function AdminLoginPage() {
    const [username, setUsername] = useState("")
    const [password, setPassword] = useState("")
    const [error, setError] = useState("")
    const router = useRouter()

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault()

        // Demo credentials
        if (username === "admin" && password === "admin123") {
            localStorage.setItem("adminAuth", "true")
            router.push("/admin")
        } else {
            setError("اسم المستخدم أو كلمة المرور غير صحيحة")
            setTimeout(() => setError(""), 3000)
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-background p-4">
            <div className="absolute inset-0 z-0 overflow-hidden">
                <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] bg-primary/10 rounded-full blur-[120px]" />
                <div className="absolute bottom-[20%] -right-[10%] w-[40%] h-[40%] bg-purple-500/10 rounded-full blur-[100px]" />
            </div>

            <Card className="w-full max-w-md z-10 border-zinc-800 bg-zinc-900/50 backdrop-blur-md">
                <CardHeader className="space-y-1 text-center">
                    <div className="flex justify-center mb-4">
                        <div className="w-16 h-16 rounded-full bg-primary/10 border-2 border-primary/20 flex items-center justify-center">
                            <Lock className="w-8 h-8 text-primary" />
                        </div>
                    </div>
                    <CardTitle className="text-3xl font-black tracking-tight">
                        Admin Login
                    </CardTitle>
                    <CardDescription>
                        دخول إلى لوحة التحكم
                    </CardDescription>
                </CardHeader>

                <CardContent>
                    <form onSubmit={handleLogin} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="username">اسم المستخدم</Label>
                            <div className="relative">
                                <User className="absolute left-3 top-3 h-4 w-4 text-zinc-500" />
                                <Input
                                    id="username"
                                    placeholder="admin"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    className="pl-10 bg-zinc-950/50 border-zinc-800"
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="password">كلمة المرور</Label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-3 h-4 w-4 text-zinc-500" />
                                <Input
                                    id="password"
                                    type="password"
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="pl-10 bg-zinc-950/50 border-zinc-800"
                                    required
                                />
                            </div>
                        </div>

                        {error && (
                            <div className="text-sm text-red-500 text-center py-2 bg-red-500/10 border border-red-500/20 rounded">
                                {error}
                            </div>
                        )}

                        <Button type="submit" className="w-full">
                            تسجيل الدخول
                        </Button>

                        <div className="text-center text-xs text-zinc-500 mt-4 p-3 bg-zinc-950/50 border border-zinc-800 rounded">
                            <p className="font-semibold mb-1">Demo Credentials:</p>
                            <p>Username: <code className="text-primary">admin</code></p>
                            <p>Password: <code className="text-primary">admin123</code></p>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}
