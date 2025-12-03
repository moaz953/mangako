"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { CheckCircle2, XCircle, AlertCircle, Loader2, PlayCircle } from "lucide-react"
import { uploadImage } from "@/app/actions"

interface DiagnosticTest {
    name: string
    status: "idle" | "running" | "success" | "error"
    message?: string
    details?: string
}

export function UploadDiagnostics() {
    const [tests, setTests] = useState<DiagnosticTest[]>([
        { name: "Environment Check", status: "idle" },
        { name: "Local Storage Test", status: "idle" },
        { name: "Upload Test", status: "idle" }
    ])
    const [isRunning, setIsRunning] = useState(false)

    const updateTest = (index: number, updates: Partial<DiagnosticTest>) => {
        setTests(prev => prev.map((test, i) =>
            i === index ? { ...test, ...updates } : test
        ))
    }

    const runDiagnostics = async () => {
        setIsRunning(true)

        // Test 1: Environment Check
        updateTest(0, { status: "running" })
        try {
            const envCheck = {
                hasSupabase: typeof window !== 'undefined' &&
                    process.env.NEXT_PUBLIC_SUPABASE_URL &&
                    !process.env.NEXT_PUBLIC_SUPABASE_URL.includes('xxxx'),
                browser: typeof window !== 'undefined' ? navigator.userAgent : 'Server',
            }

            updateTest(0, {
                status: "success",
                message: envCheck.hasSupabase ? "Supabase configured" : "Using local storage",
                details: JSON.stringify(envCheck, null, 2)
            })
        } catch (_error) {
            updateTest(0, {
                status: "error",
                message: "Environment check failed",
                details: _error instanceof Error ? _error.message : String(_error)
            })
        }

        // Small delay between tests
        await new Promise(resolve => setTimeout(resolve, 500))

        // Test 2: Local Storage Test
        updateTest(1, { status: "running" })
        try {
            const response = await fetch('/api/upload-test', { method: 'GET' })
            const data = await response.json()

            updateTest(1, {
                status: data.canWrite ? "success" : "error",
                message: data.canWrite ? "Local storage is writable" : "Cannot write to local storage",
                details: JSON.stringify(data, null, 2)
            })
        } catch (_error) {
            updateTest(1, {
                status: "error",
                message: "Could not test local storage",
                details: _error instanceof Error ? _error.message : String(_error)
            })
        }

        await new Promise(resolve => setTimeout(resolve, 500))

        // Test 3: Upload Test with sample image
        updateTest(2, { status: "running" })
        try {
            // Create a small test image (1x1 red pixel PNG)
            const testImageData = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8DwHwAFBQIAX8jx0gAAAABJRU5ErkJggg=='
            const blob = await fetch(`data:image/png;base64,${testImageData}`).then(r => r.blob())
            const file = new File([blob], 'test-upload.png', { type: 'image/png' })

            const formData = new FormData()
            formData.append('file', file)

            const result = await uploadImage(formData)

            if (result.success) {
                updateTest(2, {
                    status: "success",
                    message: `Upload successful! (${(result as any).storageType || 'unknown'})`,
                    details: `URL: ${result.url}`
                })
            } else {
                updateTest(2, {
                    status: "error",
                    message: "Upload failed",
                    details: result.error
                })
            }
        } catch (_error) {
            updateTest(2, {
                status: "error",
                message: "Upload test failed",
                details: _error instanceof Error ? _error.message : String(_error)
            })
        }

        setIsRunning(false)
    }

    const getStatusIcon = (status: DiagnosticTest['status']) => {
        switch (status) {
            case "success":
                return <CheckCircle2 className="h-5 w-5 text-green-500" />
            case "error":
                return <XCircle className="h-5 w-5 text-destructive" />
            case "running":
                return <Loader2 className="h-5 w-5 text-primary animate-spin" />
            default:
                return <AlertCircle className="h-5 w-5 text-muted-foreground" />
        }
    }

    const getStatusBadge = (status: DiagnosticTest['status']) => {
        switch (status) {
            case "success":
                return <Badge variant="outline" className="border-green-500 text-green-500">Success</Badge>
            case "error":
                return <Badge variant="destructive">Failed</Badge>
            case "running":
                return <Badge variant="outline" className="border-primary text-primary">Running...</Badge>
            default:
                return <Badge variant="outline">Pending</Badge>
        }
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Upload Diagnostics</CardTitle>
                <CardDescription>
                    Test the upload system to identify any configuration issues
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <Button
                    onClick={runDiagnostics}
                    disabled={isRunning}
                    className="w-full"
                >
                    {isRunning ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Running Diagnostics...
                        </>
                    ) : (
                        <>
                            <PlayCircle className="mr-2 h-4 w-4" />
                            Run Diagnostics
                        </>
                    )}
                </Button>

                <div className="space-y-3">
                    {tests.map((test, index) => (
                        <Alert key={index}>
                            <div className="flex items-start gap-3">
                                {getStatusIcon(test.status)}
                                <div className="flex-1 space-y-1">
                                    <div className="flex items-center justify-between">
                                        <AlertTitle className="mb-0">{test.name}</AlertTitle>
                                        {getStatusBadge(test.status)}
                                    </div>
                                    {test.message && (
                                        <AlertDescription className="text-sm">
                                            {test.message}
                                        </AlertDescription>
                                    )}
                                    {test.details && (
                                        <details className="text-xs text-muted-foreground mt-2">
                                            <summary className="cursor-pointer hover:text-foreground">
                                                Show details
                                            </summary>
                                            <pre className="mt-2 p-2 bg-muted rounded overflow-x-auto">
                                                {test.details}
                                            </pre>
                                        </details>
                                    )}
                                </div>
                            </div>
                        </Alert>
                    ))}
                </div>

                {tests.every(t => t.status !== "idle") && (
                    <Alert>
                        <AlertCircle className="h-4 w-4" />
                        <AlertTitle>Diagnostics Complete</AlertTitle>
                        <AlertDescription>
                            {tests.every(t => t.status === "success")
                                ? "✅ All tests passed! Upload system is working correctly."
                                : "⚠️ Some tests failed. Check the details above for more information."}
                        </AlertDescription>
                    </Alert>
                )}
            </CardContent>
        </Card>
    )
}
