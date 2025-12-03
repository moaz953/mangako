"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { useDropzone } from "react-dropzone"
import Image from "next/image"
import { ArrowLeft, Upload, Save, AlertTriangle, Eye, Send, CheckCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { getChapters, updateChapter, uploadMultipleImages, deleteChapter, getChapter } from "@/app/actions"
import { DragDropZone } from "@/components/admin/drag-drop-zone"
import { SortablePageItem } from "@/components/admin/sortable-page-item"
import { UploadProgressTracker } from "@/components/admin/upload-progress-tracker"
import { DndContext, closestCenter, DragEndEvent } from "@dnd-kit/core"
import {
    SortableContext,
    arrayMove,
    rectSortingStrategy,
    verticalListSortingStrategy,
} from "@dnd-kit/sortable"
import { toast } from "sonner"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog"

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

interface FileUploadStatus {
    id: string
    name: string
    size: number
    status: "pending" | "uploading" | "done" | "error"
    progress: number
    error?: string
}

import { useParams } from "next/navigation"

interface Chapter {
    id: string
    storyId: string
    number: number
    title: string
    pages: string[]
    releaseDate: string | Date | null
    price: number
    status: string
}

export default function ChapterEditorPage() {
    const params = useParams()
    const router = useRouter()
    const chapterId = params?.id as string
    const [chapter, setChapter] = useState<Chapter | null>(null)
    const [loading, setLoading] = useState(true)
    const [pages, setPages] = useState<PagePreview[]>([])
    const [uploadFiles, setUploadFiles] = useState<FileUploadStatus[]>([])
    const [uploading, setUploading] = useState(false)
    const [validationWarnings, setValidationWarnings] = useState<string[]>([])
    const [error, setError] = useState<string | null>(null)
    const [uploadErrors, setUploadErrors] = useState<Array<{ fileName: string, error: string, errorType?: string }>>([])
    const [showPublishDialog, setShowPublishDialog] = useState(false)
    const [publishing, setPublishing] = useState(false)

    // Load chapter
    useEffect(() => {
        const loadChapter = async () => {
            try {
                setLoading(true)

                const result = await getChapter(chapterId)

                if (result && result.success && result.data) {
                    const found = result.data
                    setChapter(found as Chapter)

                    // Convert saved URLs to PagePreview objects
                    const savedPages: PagePreview[] = Array.isArray(found.pages)
                        ? found.pages.map((url, index) => ({
                            id: `saved-${index}-${Date.now()}`,
                            url: url as string,
                            status: "done" as const,
                            progress: 100
                        }))
                        : []

                    setPages(savedPages)
                } else {
                    setError(result?.error || "Chapter not found")
                }
            } catch (err) {
                console.error("Error loading chapter:", err)
                setError("Failed to load chapter: " + (err instanceof Error ? err.message : String(err)))
            } finally {
                setLoading(false)
            }
        }
        loadChapter()
    }, [chapterId])

    // Auto-save to localStorage
    useEffect(() => {
        if (pages.length > 0 && !uploading) {
            localStorage.setItem(`draft-chapter-${chapterId}`, JSON.stringify(pages))
        }
    }, [pages, chapterId, uploading])

    // Restore from localStorage
    useEffect(() => {
        const draft = localStorage.getItem(`draft-chapter-${chapterId}`)
        if (draft && pages.length === 0) {
            const saved = JSON.parse(draft)
            if (saved.length > 0 && confirm('Continue from where you left off?')) {
                setPages(saved)
            }
        }
    }, [chapterId])

    // Keyboard shortcuts
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            // Delete selected (for future enhancement with selection)
            if (e.key === 'Delete' && !e.target || (e.target as HTMLElement).tagName !== 'INPUT') {
                // TODO: Implement multi-select
            }

            // Save with Ctrl+S / Cmd+S
            if ((e.ctrlKey || e.metaKey) && e.key === 's') {
                e.preventDefault()
                handleSavePages()
            }
        }

        window.addEventListener('keydown', handleKeyDown)
        return () => window.removeEventListener('keydown', handleKeyDown)
    }, [pages])

    // Validate image
    const validateImage = async (file: File): Promise<string[]> => {
        const warnings: string[] = []

        // Check size
        if (file.size > 10 * 1024 * 1024) {
            warnings.push(`${file.name}: File too large (${(file.size / 1024 / 1024).toFixed(1)}MB, max 10MB)`)
        }

        // Check type
        if (!['image/png', 'image/jpeg', 'image/webp'].includes(file.type)) {
            warnings.push(`${file.name}: Invalid format (use PNG, JPG, or WEBP)`)
        }

        // Check resolution
        try {
            const img = await createImageBitmap(file)
            if (img.width < 800) {
                warnings.push(`${file.name}: Low resolution (${img.width}x${img.height}, recommended: 1600x2400)`)
            }
            const ratio = img.width / img.height
            if (ratio < 0.5 || ratio > 0.8) {
                warnings.push(`${file.name}: Unusual aspect ratio for manga page`)
            }
        } catch (err) {
            warnings.push(`${file.name}: Could not read image dimensions`)
        }

        return warnings
    }

    // Handle files selected
    const handleFilesSelected = async (files: File[]) => {
        const warnings: string[] = []

        // Validate all files
        for (const file of files) {
            const fileWarnings = await validateImage(file)
            warnings.push(...fileWarnings)
        }

        setValidationWarnings(warnings)

        // Create preview pages
        const newPages: PagePreview[] = await Promise.all(
            files.map(async (file, index) => {
                const url = URL.createObjectURL(file)
                const img = await createImageBitmap(file)

                return {
                    id: `new-${Date.now()}-${index}`,
                    url,
                    file,
                    width: img.width,
                    height: img.height,
                    size: file.size,
                    status: "pending" as const,
                    progress: 0
                }
            })
        )

        setPages(prev => [...prev, ...newPages])

        // Upload files
        await handleUpload(newPages)
    }

    // Use ref to access latest pages state in async functions
    const pagesRef = useRef<PagePreview[]>([])

    // Update ref whenever pages changes
    useEffect(() => {
        pagesRef.current = pages
    }, [pages])

    // Upload files
    const handleUpload = async (newPages: PagePreview[]) => {
        setUploading(true)

        const fileStatuses: FileUploadStatus[] = newPages.map((page, i) => ({
            id: page.id,
            name: page.file?.name || `Page ${i + 1}`,
            size: page.size || 0,
            status: "pending" as const,
            progress: 0,
            error: undefined
        }))

        setUploadFiles(fileStatuses)

        try {
            const formData = new FormData()
            newPages.forEach(page => {
                if (page.file) {
                    formData.append("files", page.file)
                }
            })

            // Simulate progress (in real app, use upload progress API)
            const uploadPromise = uploadMultipleImages(formData)

            // Update progress simulation
            const progressInterval = setInterval(() => {
                setUploadFiles(prev => prev.map(f => ({
                    ...f,
                    status: f.status === "pending" ? "uploading" as const : f.status,
                    progress: f.status === "uploading" ? Math.min(f.progress + 10, 90) : f.progress
                })))
            }, 300)

            const result = await uploadPromise
            clearInterval(progressInterval)

            if (result.success && result.urls && result.urls.length > 0) {
                // Use ref to get the absolute latest pages (including the ones we just added in handleFilesSelected)
                const currentPages = pagesRef.current

                // Construct new pages with final URLs
                const updatedPages = currentPages.map((page: PagePreview) => {
                    // Check if this page is one of the ones we just uploaded
                    // We match by ID
                    const uploadIndex = newPages.findIndex((p: PagePreview) => p.id === page.id)

                    if (uploadIndex !== -1 && uploadIndex < result.urls.length) {
                        return {
                            ...page,
                            url: result.urls[uploadIndex],
                            status: "done" as const,
                            progress: 100
                        }
                    }
                    return page
                })

                setPages(updatedPages)

                setUploadFiles(prev => prev.map((f, idx) => {
                    if (idx < result.urls.length) {
                        return {
                            ...f,
                            status: "done" as const,
                            progress: 100
                        }
                    }
                    return f
                }))

                // Show summary toast
                const summary = (result as any).summary
                if (summary) {
                    if (summary.failed > 0) {
                        toast.warning(`${summary.successful}/${summary.total} pages uploaded. ${summary.failed} failed.`)
                    } else {
                        toast.success(`${summary.successful} pages uploaded successfully!`)
                    }
                } else {
                    toast.success(`${result.urls.length} pages uploaded successfully`)
                }

                // Store detailed errors if any
                if ((result as any).detailedErrors) {
                    setUploadErrors((result as any).detailedErrors)
                }

                // Save to DB immediately with the new URLs
                const pageUrls = updatedPages.map(p => p.url)

                await updateChapter(chapterId, { pages: pageUrls })
                setChapter(prev => prev ? { ...prev, pages: pageUrls } : null)
                localStorage.removeItem(`draft-chapter-${chapterId}`)
                toast.success("Pages saved to database!")
            } else {
                // No files uploaded successfully
                const errorMessage = result.error || "Upload failed"
                toast.error(errorMessage)

                // Mark all files as error
                setUploadFiles(prev => prev.map(f => ({
                    ...f,
                    status: "error" as const,
                    error: errorMessage
                })))

                // Store detailed errors
                if ((result as any).detailedErrors) {
                    setUploadErrors((result as any).detailedErrors)
                }
            }
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : "Upload failed"
            toast.error(errorMessage)
            setUploadFiles(prev => prev.map(f => ({
                ...f,
                status: "error" as const,
                error: errorMessage
            })))
        } finally {
            setUploading(false)
        }
    }

    // Retry failed uploads
    const handleRetryUpload = async () => {
        if (uploadErrors.length === 0) return

        toast.info("Retrying failed uploads...")

        // Find pages that failed
        const failedPages = pages.filter(page =>
            page.file && uploadErrors.some(err => err.fileName === page.file?.name)
        )

        if (failedPages.length > 0) {
            setUploadErrors([])
            await handleUpload(failedPages)
        }
    }

    // Handle drag end (reorder)
    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event

        if (over && active.id !== over.id) {
            setPages((items) => {
                const oldIndex = items.findIndex(i => i.id === active.id)
                const newIndex = items.findIndex(i => i.id === over.id)
                return arrayMove(items, oldIndex, newIndex)
            })

            toast.success("Pages reordered")
        }
    }

    // Delete page
    const handleDeletePage = (id: string) => {
        setPages(prev => prev.filter(p => p.id !== id))
        toast.success("Page removed")
    }

    // Save pages
    const handleSavePages = async () => {
        if (!chapter) {
            toast.error("Chapter not loaded")
            return
        }

        const pageUrls = pages.map(p => p.url)

        // Filter out blob URLs (pending uploads)
        const validUrls = pageUrls.filter(url => !url.startsWith('blob:'))

        if (validUrls.length !== pageUrls.length) {
            toast.warning("Some pages are still uploading. Only completed uploads will be saved.")
        }

        const result = await updateChapter(chapterId, { pages: validUrls })

        if (result.success) {
            setChapter({ ...chapter, pages: validUrls })
            localStorage.removeItem(`draft-chapter-${chapterId}`)
            toast.success("Pages saved!")
        } else {
            toast.error("Failed to save pages: " + result.error)
        }
    }

    // Update metadata
    const handleUpdateMetadata = async () => {
        if (!chapter) {
            toast.error("Chapter not loaded")
            return
        }

        await updateChapter(chapterId, {
            title: chapter.title,
            number: chapter.number,
            price: chapter.price,
            releaseDate: chapter.releaseDate
        })
        toast.success("Metadata updated!")
    }

    // Preview chapter
    const handlePreview = () => {
        if (!chapter) return
        window.open(`/read/${chapterId}`, '_blank')
    }

    // Publish chapter
    const handlePublish = async () => {
        if (!chapter) {
            toast.error("Chapter not loaded")
            return
        }

        if (pages.length === 0) {
            toast.error("Cannot publish a chapter without pages")
            return
        }

        setPublishing(true)

        try {
            // Save pages first
            const pageUrls = pages.map(p => p.url).filter(url => !url.startsWith('blob:'))

            // Update chapter status to published
            const result = await updateChapter(chapterId, {
                pages: pageUrls,
                status: 'published'
            })

            if (result.success) {
                setChapter({ ...chapter, status: 'published', pages: pageUrls })
                toast.success("Chapter published successfully! 🎉")
                setShowPublishDialog(false)
            } else {
                toast.error("Failed to publish: " + result.error)
            }
        } catch (error) {
            toast.error("Failed to publish chapter")
        } finally {
            setPublishing(false)
        }
    }

    // Unpublish chapter
    const handleUnpublish = async () => {
        if (!chapter) return

        const result = await updateChapter(chapterId, { status: 'draft' })
        if (result.success) {
            setChapter({ ...chapter, status: 'draft' })
            toast.success("Chapter unpublished")
        } else {
            toast.error("Failed to unpublish")
        }
    }

    const onDrop = useCallback((acceptedFiles: File[]) => {
        handleFilesSelected(acceptedFiles)
    }, [handleFilesSelected])

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: {
            'image/*': ['.png', '.jpg', '.jpeg', '.webp']
        },
        multiple: true
    })

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        )
    }

    if (!chapter) {
        return (
            <div className="text-center py-12">
                <p className="text-muted-foreground">{error || "Chapter not found"}</p>
                <Link href="/admin/chapters">
                    <Button className="mt-4">Back to Chapters</Button>
                </Link>
            </div>
        )
    }

    const isPublished = chapter.status === 'published'

    return (
        <div className="space-y-6 max-w-6xl mx-auto">
            <div>
                <Link href="/admin/chapters">
                    <Button variant="ghost" className="mb-4">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to Chapters
                    </Button>
                </Link>
                <div className="flex items-start justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Edit Chapter</h1>
                        <p className="text-muted-foreground">Chapter #{chapter.number}: {chapter.title}</p>
                    </div>
                    <div className="flex items-center gap-2">
                        {isPublished ? (
                            <div className="flex items-center gap-2 px-3 py-1.5 bg-green-500/10 text-green-600 rounded-full border border-green-500/20">
                                <CheckCircle className="h-4 w-4" />
                                <span className="text-sm font-medium">Published</span>
                            </div>
                        ) : (
                            <div className="px-3 py-1.5 bg-yellow-500/10 text-yellow-600 rounded-full border border-yellow-500/20">
                                <span className="text-sm font-medium">Draft</span>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Metadata */}
            <div className="border rounded-lg p-6 space-y-4">
                <h2 className="text-xl font-semibold">Metadata</h2>
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label>Chapter Title</Label>
                        <Input
                            value={chapter.title}
                            onChange={(e) => setChapter({ ...chapter, title: e.target.value })}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label>Chapter Number</Label>
                        <Input
                            type="number"
                            value={chapter.number}
                            onChange={(e) => setChapter({ ...chapter, number: parseInt(e.target.value) })}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label>Price (Coins)</Label>
                        <Input
                            type="number"
                            value={chapter.price}
                            onChange={(e) => setChapter({ ...chapter, price: parseInt(e.target.value) })}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label>Release Date</Label>
                        <Input
                            type="date"
                            value={chapter.releaseDate instanceof Date
                                ? chapter.releaseDate.toISOString().split('T')[0]
                                : (chapter.releaseDate as string) || ''}
                            onChange={(e) => setChapter({ ...chapter, releaseDate: e.target.value })}
                        />
                    </div>
                </div>
                <Button onClick={handleUpdateMetadata}>
                    <Save className="mr-2 h-4 w-4" />
                    Save Metadata
                </Button>
            </div>

            {/* Pages */}
            <div className="border rounded-lg p-6 space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-xl font-semibold">Pages ({pages.length})</h2>
                        <p className="text-sm text-muted-foreground">
                            Drag & drop to upload, drag pages to reorder
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        {pages.length > 0 && (
                            <>
                                <Button variant="outline" onClick={handlePreview}>
                                    <Eye className="mr-2 h-4 w-4" />
                                    Preview
                                </Button>
                                <Button onClick={handleSavePages} disabled={uploading}>
                                    <Save className="mr-2 h-4 w-4" />
                                    Save Draft
                                </Button>
                                {isPublished ? (
                                    <Button variant="outline" onClick={handleUnpublish}>
                                        Unpublish
                                    </Button>
                                ) : (
                                    <Button
                                        onClick={() => setShowPublishDialog(true)}
                                        disabled={uploading || pages.length === 0}
                                        className="bg-green-600 hover:bg-green-700"
                                    >
                                        <Send className="mr-2 h-4 w-4" />
                                        Publish Chapter
                                    </Button>
                                )}
                            </>
                        )}
                    </div>
                </div>

                {/* Validation Warnings */}
                {validationWarnings.length > 0 && (
                    <Alert>
                        <AlertTriangle className="h-4 w-4" />
                        <AlertTitle>Quality Issues Detected</AlertTitle>
                        <AlertDescription>
                            <ul className="list-disc pl-4 space-y-1 text-xs">
                                {validationWarnings.map((w, i) => (
                                    <li key={i}>{w}</li>
                                ))}
                            </ul>
                        </AlertDescription>
                    </Alert>
                )}

                {/* Upload Progress */}
                {uploadFiles.length > 0 && (
                    <UploadProgressTracker files={uploadFiles} />
                )}

                {/* Detailed Upload Errors */}
                {uploadErrors.length > 0 && (
                    <Alert variant="destructive">
                        <AlertTriangle className="h-4 w-4" />
                        <AlertTitle>Upload Errors ({uploadErrors.length} file(s) failed)</AlertTitle>
                        <AlertDescription>
                            <ul className="list-disc pl-4 space-y-1 text-sm mt-2">
                                {uploadErrors.map((err, i) => (
                                    <li key={i}>
                                        <strong>{err.fileName}</strong>: {err.error}
                                        {err.errorType && (
                                            <span className="text-xs ml-2 opacity-75">
                                                ({err.errorType})
                                            </span>
                                        )}
                                    </li>
                                ))}
                            </ul>
                            <Button
                                variant="outline"
                                size="sm"
                                className="mt-3"
                                onClick={handleRetryUpload}
                                disabled={uploading}
                            >
                                Retry Failed Uploads
                            </Button>
                        </AlertDescription>
                    </Alert>
                )}

                {/* Drag & Drop Zone */}
                {!uploading && (
                    <DragDropZone
                        onFilesSelected={handleFilesSelected}
                        disabled={uploading}
                    />
                )}

                {/* Pages Grid with Drag-to-Reorder */}
                {pages.length > 0 && (
                    <DndContext
                        collisionDetection={closestCenter}
                        onDragEnd={handleDragEnd}
                    >
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                            <SortableContext items={pages.map(p => p.id)} strategy={rectSortingStrategy}>
                                {pages.map((page, index) => (
                                    <SortablePageItem
                                        key={page.id}
                                        page={page}
                                        index={index}
                                        onDelete={() => handleDeletePage(page.id)}
                                    />
                                ))}
                            </SortableContext>

                            {/* Upload Placeholder */}
                            <div
                                {...getRootProps()}
                                className={`aspect-[2/3] border-2 border-dashed rounded-lg flex flex-col items-center justify-center cursor-pointer transition-colors
                                    ${isDragActive ? 'border-primary bg-primary/10' : 'border-muted-foreground/25 hover:border-primary hover:bg-muted/50'}`}
                            >
                                <input {...getInputProps()} />
                                <Upload className="h-8 w-8 text-muted-foreground mb-2" />
                                <span className="text-sm text-muted-foreground font-medium">Add Pages</span>
                            </div>
                        </div>
                    </DndContext>
                )}
            </div>

            {/* Publish Confirmation Dialog */}
            <AlertDialog open={showPublishDialog} onOpenChange={setShowPublishDialog}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Publish Chapter?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This will make Chapter {chapter.number} publicly available. Make sure you've:
                            <ul className="list-disc pl-6 mt-2 space-y-1">
                                <li>Uploaded all pages ({pages.length} pages ready)</li>
                                <li>Set the correct chapter number and title</li>
                                <li>Previewed the chapter</li>
                            </ul>
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handlePublish}
                            disabled={publishing}
                            className="bg-green-600 hover:bg-green-700"
                        >
                            {publishing ? "Publishing..." : "Publish"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    )
}
