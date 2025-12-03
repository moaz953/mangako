"use client"

import { useState, Suspense } from "react"
import { User, Mail, Lock, UserPlus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useRouter, useSearchParams } from "next/navigation"
import { signIn } from "next-auth/react"
import Link from "next/link"
import { toast } from "sonner"

function LoginPageContent() {
    const [loginEmail, setLoginEmail] = useState("")
    const [loginPassword, setLoginPassword] = useState("")
    const [signupName, setSignupName] = useState("")
    const [signupEmail, setSignupEmail] = useState("")
    const [signupPassword, setSignupPassword] = useState("")
    const [error, setError] = useState("")
    const [loading, setLoading] = useState(false)
    const router = useRouter()
    const searchParams = useSearchParams()
    const callbackUrl = searchParams.get("callbackUrl") || "/"

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault()
        setError("")
        setLoading(true)

        try {
            const result = await signIn("credentials", {
                email: loginEmail,
                password: loginPassword,
                redirect: false,
            })

            if (result?.error) {
                setError("Invalid email or password")
                toast.error("Login failed")
            } else {
                toast.success("Welcome back!")
                router.push(callbackUrl)
                router.refresh()
            }
        } catch (_err) {
            setError("An error occurred. Please try again.")
            toast.error("Login error")
        } finally {
            setLoading(false)
        }
    }

    const handleSignup = async (e: React.FormEvent) => {
        e.preventDefault()
        setError("")
        setLoading(true)

        try {
            // Call signup API
            const response = await fetch("/api/auth/signup", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name: signupName,
                    email: signupEmail,
                    password: signupPassword,
                }),
            })

            const data = await response.json()

            if (!response.ok) {
                setError(data.error || "Failed to create account")
                toast.error(data.error || "Signup failed")
                setLoading(false)
                return
            }

            // Auto-login after signup
            const result = await signIn("credentials", {
                email: signupEmail,
                password: signupPassword,
                redirect: false,
            })

            if (result?.error) {
                setError("Account created but login failed. Please try logging in.")
                toast.error("Please login manually")
            } else {
                toast.success("Account created! 🎁 Welcome bonus: 10 coins!")
                router.push(callbackUrl)
                router.refresh()
            }
        } catch (_err) {
            setError("An error occurred. Please try again.")
            toast.error("Signup error")
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-background p-4">
            <div className="absolute inset-0 z-0 overflow-hidden">
                <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] bg-primary/10 rounded-full blur-[120px]" />
                <div className="absolute bottom-[20%] -right-[10%] w-[40%] h-[40%] bg-purple-500/10 rounded-full blur-[100px]" />
            </div>

            <div className="w-full max-w-md z-10 space-y-4">
                <div className="text-center mb-8">
                    <Link href="/" className="inline-block mb-4">
                        <h1 className="text-4xl font-black tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/50">
                            MANGAKO
                        </h1>
                    </Link>
                    <p className="text-muted-foreground">Sign in to unlock premium chapters</p>
                </div>

                <Tabs defaultValue="login" className="w-full">
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="login">Login</TabsTrigger>
                        <TabsTrigger value="signup">Sign Up</TabsTrigger>
                    </TabsList>

                    <TabsContent value="login">
                        <Card className="border-border/50 bg-card/50 backdrop-blur-md">
                            <CardHeader>
                                <CardTitle>Welcome Back</CardTitle>
                                <CardDescription>Sign in to your account</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <form onSubmit={handleLogin} className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="login-email">Email</Label>
                                        <div className="relative">
                                            <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                            <Input
                                                id="login-email"
                                                type="email"
                                                placeholder="your@email.com"
                                                value={loginEmail}
                                                onChange={(e) => setLoginEmail(e.target.value)}
                                                className="pl-10"
                                                required
                                                disabled={loading}
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="login-password">Password</Label>
                                        <div className="relative">
                                            <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                            <Input
                                                id="login-password"
                                                type="password"
                                                placeholder="••••••••"
                                                value={loginPassword}
                                                onChange={(e) => setLoginPassword(e.target.value)}
                                                className="pl-10"
                                                required
                                                disabled={loading}
                                            />
                                        </div>
                                    </div>

                                    {error && (
                                        <div className="text-sm text-destructive text-center py-2 bg-destructive/10 border border-destructive/20 rounded">
                                            {error}
                                        </div>
                                    )}

                                    <Button type="submit" className="w-full" disabled={loading}>
                                        {loading ? "Signing in..." : "Sign In"}
                                    </Button>
                                </form>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="signup">
                        <Card className="border-border/50 bg-card/50 backdrop-blur-md">
                            <CardHeader>
                                <CardTitle>Create Account</CardTitle>
                                <CardDescription>Get 10 free coins on signup!</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <form onSubmit={handleSignup} className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="signup-name">Name</Label>
                                        <div className="relative">
                                            <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                            <Input
                                                id="signup-name"
                                                placeholder="Your full name"
                                                value={signupName}
                                                onChange={(e) => setSignupName(e.target.value)}
                                                className="pl-10"
                                                required
                                                disabled={loading}
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="signup-email">Email</Label>
                                        <div className="relative">
                                            <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                            <Input
                                                id="signup-email"
                                                type="email"
                                                placeholder="your@email.com"
                                                value={signupEmail}
                                                onChange={(e) => setSignupEmail(e.target.value)}
                                                className="pl-10"
                                                required
                                                disabled={loading}
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="signup-password">Password</Label>
                                        <div className="relative">
                                            <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                            <Input
                                                id="signup-password"
                                                type="password"
                                                placeholder="••••••••"
                                                value={signupPassword}
                                                onChange={(e) => setSignupPassword(e.target.value)}
                                                className="pl-10"
                                                required
                                                disabled={loading}
                                                minLength={6}
                                            />
                                        </div>
                                    </div>

                                    {error && (
                                        <div className="text-sm text-destructive text-center py-2 bg-destructive/10 border border-destructive/20 rounded">
                                            {error}
                                        </div>
                                    )}

                                    <Button type="submit" className="w-full" disabled={loading}>
                                        <UserPlus className="w-4 h-4 mr-2" />
                                        {loading ? "Creating account..." : "Create Account"}
                                    </Button>

                                    <div className="text-center text-xs text-green-500 mt-4 p-3 bg-green-500/10 border border-green-500/20 rounded">
                                        🎁 Welcome Bonus: 10 free coins!
                                    </div>
                                </form>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    )
}

export default function LoginPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <LoginPageContent />
        </Suspense>
    )
}
