"use client"

import { Check, X, Loader2, AlertCircle } from "lucide-react"
import { Progress } from "@/components/ui/progress"
import { Card } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface FileUploadStatus {
    id: string
    name: string
    size: number
    status: "pending" | "uploading" | "done" | "error"
    progress: number
    error?: string
}

interface UploadProgressTrackerProps {
    files: FileUploadStatus[]
    uploadSpeed?: number // bytes per second
    estimatedTime?: number // seconds
}

export function UploadProgressTracker({
    files,
    uploadSpeed = 0,
    estimatedTime = 0
}: UploadProgressTrackerProps) {
    const totalFiles = files.length
    const uploadedFiles = files.filter(f => f.status === "done").length
    const failedFiles = files.filter(f => f.status === "error").length
    const uploadingFiles = files.filter(f => f.status === "uploading").length

    const totalSize = files.reduce((acc, f) => acc + f.size, 0)
    const uploadedSize = files
        .filter(f => f.status === "done")
        .reduce((acc, f) => acc + f.size, 0)
    const currentUploadingSize = files
        .filter(f => f.status === "uploading")
        .reduce((acc, f) => acc + (f.size * f.progress / 100), 0)

    const totalProgress = totalSize > 0
        ? ((uploadedSize + currentUploadingSize) / totalSize) * 100
        : 0

    const formatSize = (bytes: number) => {
        if (bytes === 0) return '0 Bytes'
        const k = 1024
        const sizes = ['Bytes', 'KB', 'MB', 'GB']
        const i = Math.floor(Math.log(bytes) / Math.log(k))
        return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
    }

    const formatSpeed = (bytesPerSec: number) => {
        return `${formatSize(bytesPerSec)}/s`
    }

    const formatTime = (seconds: number) => {
        if (seconds < 60) return `${Math.round(seconds)}s`
        const minutes = Math.floor(seconds / 60)
        const secs = Math.round(seconds % 60)
        return `${minutes}m ${secs}s`
    }

    if (files.length === 0) return null

    return (
        <Card className="p-4 space-y-4">
            {/* Overall Progress */}
            <div className="space-y-2">
                <div className="flex justify-between text-sm font-medium">
                    <span>
                        Uploading {uploadingFiles > 0 ? `(${uploadingFiles} active)` : ''}
                    </span>
                    <span>{Math.round(totalProgress)}%</span>
                </div>
                <Progress value={totalProgress} className="h-2" />

                {/* Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs text-muted-foreground">
                    <div>
                        <span className="font-medium text-foreground">{uploadedFiles}</span> / {totalFiles} files
                    </div>
                    {uploadSpeed > 0 && (
                        <div>
                            Speed: <span className="font-medium text-foreground">{formatSpeed(uploadSpeed)}</span>
                        </div>
                    )}
                    {estimatedTime > 0 && (
                        <div>
                            ETA: <span className="font-medium text-foreground">{formatTime(estimatedTime)}</span>
                        </div>
                    )}
                    <div>
                        <span className="font-medium text-foreground">{formatSize(uploadedSize + currentUploadingSize)}</span> / {formatSize(totalSize)}
                    </div>
                </div>
            </div>

            {/* Failed Files Alert */}
            {failedFiles > 0 && (
                <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                        {failedFiles} file(s) failed to upload. Check the list below for details.
                    </AlertDescription>
                </Alert>
            )}

            {/* File List */}
            <div className="space-y-1 max-h-48 overflow-y-auto">
                {files.map(file => (
                    <div
                        key={file.id}
                        className="flex items-center gap-2 text-sm p-2 rounded hover:bg-muted/50"
                    >
                        {/* Status Icon */}
                        <div className="flex-shrink-0">
                            {file.status === "done" && (
                                <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center">
                                    <Check className="w-3 h-3 text-white" />
                                </div>
                            )}
                            {file.status === "uploading" && (
                                <Loader2 className="w-5 h-5 text-primary animate-spin" />
                            )}
                            {file.status === "error" && (
                                <div className="w-5 h-5 rounded-full bg-destructive flex items-center justify-center">
                                    <X className="w-3 h-3 text-destructive-foreground" />
                                </div>
                            )}
                            {file.status === "pending" && (
                                <div className="w-5 h-5 rounded-full border-2 border-muted-foreground" />
                            )}
                        </div>

                        {/* File Name */}
                        <span className="flex-1 truncate text-xs">
                            {file.name}
                        </span>

                        {/* Progress/Size */}
                        <span className="flex-shrink-0 text-xs text-muted-foreground">
                            {file.status === "uploading" && `${file.progress}%`}
                            {file.status === "done" && formatSize(file.size)}
                            {file.status === "error" && file.error}
                        </span>
                    </div>
                ))}
            </div>
        </Card>
    )
}
