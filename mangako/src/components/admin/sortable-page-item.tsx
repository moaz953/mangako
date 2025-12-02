"use client"

import { useState } from "react"
import Image from "next/image"
import {
    GripVertical,
    Trash2,
    Eye,
    AlertTriangle,
    X,
    Check
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { Badge } from "@/components/ui/badge"

interface PagePreview {
    id: string
    url: string
    file?: File
    width?: number
    height?: number
    size?: number
    status?: "pending" | "uploading" | "done" | "error"
    progress?: number
}

interface SortablePageItemProps {
    page: PagePreview
    index: number
    onDelete: (id: string) => void
    onPreview?: (page: PagePreview) => void
}

export function SortablePageItem({
    page,
    index,
    onDelete,
    onPreview
}: SortablePageItemProps) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging
    } = useSortable({ id: page.id })

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1
    }

    // Quality warnings
    const hasLowResolution = page.width && page.width < 1200
    const hasLargeFile = page.size && page.size > 10 * 1024 * 1024
    const aspectRatio = page.width && page.height ? page.width / page.height : null
    const hasWeirdAspectRatio = aspectRatio && (aspectRatio < 0.5 || aspectRatio > 0.8)

    return (
        <div
            ref={setNodeRef}
            style={style}
            className={cn(
                "group relative aspect-[2/3] rounded-lg border-2 overflow-hidden transition-all",
                isDragging ? "border-primary shadow-lg z-50" : "border-border hover:border-primary"
            )}
        >
            {/* Image */}
            <div className="w-full h-full relative bg-muted">
                {page.url ? (
                    <Image
                        src={page.url}
                        alt={`Page ${index + 1}`}
                        fill
                        sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 20vw"
                        className="object-cover"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
                    </div>
                )}
            </div>

            {/* Page Number Badge */}
            <div className="absolute top-2 left-2 bg-black/80 text-white px-2 py-1 rounded text-xs font-bold">
                Page {index + 1}
            </div>

            {/* Status Badge */}
            {page.status && (
                <div className="absolute top-2 right-2">
                    {page.status === "done" && (
                        <div className="bg-green-500 text-white p-1 rounded">
                            <Check className="w-3 h-3" />
                        </div>
                    )}
                    {page.status === "error" && (
                        <div className="bg-red-500 text-white p-1 rounded">
                            <X className="w-3 h-3" />
                        </div>
                    )}
                    {page.status === "uploading" && page.progress !== undefined && (
                        <div className="bg-primary text-primary-foreground px-2 py-0.5 rounded text-xs">
                            {page.progress}%
                        </div>
                    )}
                </div>
            )}

            {/* Quality Warnings */}
            {(hasLowResolution || hasLargeFile || hasWeirdAspectRatio) && (
                <div className="absolute bottom-2 left-2 flex flex-col gap-1">
                    {hasLowResolution && (
                        <Badge variant="destructive" className="text-xs h-5">
                            <AlertTriangle className="w-3 h-3 mr-1" />
                            Low Res
                        </Badge>
                    )}
                    {hasLargeFile && (
                        <Badge variant="secondary" className="text-xs h-5">
                            Large File
                        </Badge>
                    )}
                </div>
            )}

            {/* Hover Actions */}
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/60 transition-all flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
                {onPreview && (
                    <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => onPreview(page)}
                    >
                        <Eye className="w-4 h-4" />
                    </Button>
                )}
                <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => onDelete(page.id)}
                >
                    <Trash2 className="w-4 h-4" />
                </Button>
            </div>

            {/* Drag Handle */}
            <div
                {...attributes}
                {...listeners}
                className="absolute bottom-2 right-2 bg-white/90 p-1 rounded cursor-move opacity-0 group-hover:opacity-100 transition-opacity"
            >
                <GripVertical className="w-4 h-4 text-gray-600" />
            </div>

            {/* Upload Progress Bar */}
            {page.status === "uploading" && page.progress !== undefined && (
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/50">
                    <div
                        className="h-full bg-primary transition-all"
                        style={{ width: `${page.progress}%` }}
                    />
                </div>
            )}
        </div>
    )
}
