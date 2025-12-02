"use client"

import { useState, useCallback, DragEvent } from "react"
import { Upload, Image as ImageIcon } from "lucide-react"
import { cn } from "@/lib/utils"

interface DragDropZoneProps {
    onFilesSelected: (files: File[]) => void
    accept?: string
    maxSize?: number // in MB
    disabled?: boolean
}

export function DragDropZone({
    onFilesSelected,
    accept = "image/*",
    maxSize = 10,
    disabled = false
}: DragDropZoneProps) {
    const [isDragging, setIsDragging] = useState(false)

    const handleDrag = useCallback((e: DragEvent<HTMLDivElement>) => {
        e.preventDefault()
        e.stopPropagation()
    }, [])

    const handleDragIn = useCallback((e: DragEvent<HTMLDivElement>) => {
        e.preventDefault()
        e.stopPropagation()
        if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
            setIsDragging(true)
        }
    }, [])

    const handleDragOut = useCallback((e: DragEvent<HTMLDivElement>) => {
        e.preventDefault()
        e.stopPropagation()
        setIsDragging(false)
    }, [])

    const handleDrop = useCallback((e: DragEvent<HTMLDivElement>) => {
        e.preventDefault()
        e.stopPropagation()
        setIsDragging(false)

        if (disabled) return

        const files = Array.from(e.dataTransfer.files)
        const validFiles = files.filter(file => {
            // Check file type
            if (accept && !file.type.match(accept.replace('*', '.*'))) {
                return false
            }
            // Check file size
            if (maxSize && file.size > maxSize * 1024 * 1024) {
                return false
            }
            return true
        })

        if (validFiles.length > 0) {
            onFilesSelected(validFiles)
        }
    }, [onFilesSelected, accept, maxSize, disabled])

    const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            onFilesSelected(Array.from(e.target.files))
        }
    }

    return (
        <div
            onDragEnter={handleDragIn}
            onDragLeave={handleDragOut}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            className={cn(
                "border-2 border-dashed rounded-xl p-12 transition-all duration-300 cursor-pointer",
                isDragging
                    ? "border-primary bg-primary/10 scale-[1.02]"
                    : "border-border hover:border-primary/50 hover:bg-primary/5",
                disabled && "opacity-50 cursor-not-allowed"
            )}
        >
            <input
                type="file"
                multiple
                accept={accept}
                onChange={handleFileInput}
                className="hidden"
                id="file-input"
                disabled={disabled}
            />

            <label
                htmlFor="file-input"
                className="cursor-pointer flex flex-col items-center gap-4"
            >
                {/* Icon */}
                <div className={cn(
                    "w-16 h-16 rounded-full flex items-center justify-center transition-colors",
                    isDragging ? "bg-primary text-primary-foreground" : "bg-primary/10 text-primary"
                )}>
                    {isDragging ? (
                        <ImageIcon className="w-8 h-8" />
                    ) : (
                        <Upload className="w-8 h-8" />
                    )}
                </div>

                {/* Text */}
                <div className="text-center space-y-2">
                    <p className="text-lg font-semibold">
                        {isDragging ? "Drop files here" : "Drag & Drop Chapter Pages"}
                    </p>
                    <p className="text-sm text-muted-foreground">
                        or click to browse files
                    </p>
                </div>

                {/* Requirements */}
                <div className="flex flex-wrap justify-center gap-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                        ✓ PNG, JPG, WEBP
                    </span>
                    <span className="flex items-center gap-1">
                        ✓ Max {maxSize}MB each
                    </span>
                    <span className="flex items-center gap-1">
                        ✓ Recommended: 1600x2400px
                    </span>
                </div>
            </label>
        </div>
    )
}
