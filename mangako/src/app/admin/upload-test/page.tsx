import { UploadDiagnostics } from "@/components/admin/upload-diagnostics"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"

export default function UploadTestPage() {
    return (
        <div className="space-y-6 max-w-4xlmx-auto p-6">
            <div>
                <Link href="/admin/chapters">
                    <Button variant="ghost" className="mb-4">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to Chapters
                    </Button>
                </Link>
                <h1 className="text-3xl font-bold tracking-tight">Upload System Test</h1>
                <p className="text-muted-foreground mt-2">
                    Use this page to diagnose and test the image upload functionality.
                </p>
            </div>

            <UploadDiagnostics />

            <div className="border rounded-lg p-6 space-y-4">
                <h2 className="text-xl font-semibold">How to Use</h2>
                <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground">
                    <li>Click "Run Diagnostics" to test the upload system</li>
                    <li>Check each test result for status (Success/Failed)</li>
                    <li>If tests fail, click "Show details" to see error messages</li>
                    <li>Use this information to fix configuration issues</li>
                </ol>

                <div className="mt-4 p-4 bg-muted rounded-lg">
                    <h3 className="font-semibold mb-2">Common Issues:</h3>
                    <ul className="list-disc list-inside space-y-1 text-sm">
                        <li><strong>Environment Check Failed:</strong> Check .env file for Supabase credentials</li>
                        <li><strong>Local Storage Failed:</strong> Check file permissions on public/uploads directory</li>
                        <li><strong>Upload Test Failed:</strong> Check server logs for detailed error messages</li>
                    </ul>
                </div>
            </div>

            <div className="border rounded-lg p-6 space-y-4 bg-blue-50 dark:bg-blue-950">
                <h2 className="text-xl font-semibold">Server Logs</h2>
                <p className="text-sm text-muted-foreground">
                    Check <code className="bg-muted px-2 py-1 rounded">server-debug.log</code> in the project root for detailed upload logs.
                </p>
                <pre className="text-xs bg-muted p-3 rounded overflow-x-auto">
                    tail -f server-debug.log
                </pre>
            </div>
        </div>
    )
}
