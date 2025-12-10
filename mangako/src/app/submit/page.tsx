"use client"

import { useState, useCallback } from "react"
import { ArrowLeft, Upload, FileText, User, Mail, Link as LinkIcon, Send, X, Loader2 } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useRouter } from "next/navigation"
import { useDropzone } from "react-dropzone"
import { toast } from "sonner"

import { uploadMultipleImages, saveSubmission } from "../actions"

export default function SubmitPage() {
    const router = useRouter()
    const [formData, setFormData] = useState({
        artistName: "",
        email: "",
        mangaTitle: "",
        genre: "",
        synopsis: "",
        portfolioLink: "",
    })
    const [files, setFiles] = useState<File[]>([])
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [statusMessage, setStatusMessage] = useState("")

    const onDrop = useCallback((acceptedFiles: File[]) => {
        setFiles(prev => [...prev, ...acceptedFiles])
    }, [])

    const removeFile = (index: number) => {
        setFiles(prev => prev.filter((_, i) => i !== index))
    }

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: {
            'image/*': ['.png', '.jpg', '.jpeg', '.webp']
        },
        multiple: true
    })

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (files.length === 0) {
            toast.error("Please upload at least one sample page")
            return
        }

        setIsSubmitting(true)
        setStatusMessage("Uploading images...")

        try {
            // Upload images first
            let samplePageUrls: string[] = []

            const uploadFormData = new FormData()
            files.forEach(file => {
                uploadFormData.append("files", file)
            })

            const uploadResult = await uploadMultipleImages(uploadFormData)
            if (!uploadResult.success) {
                throw new Error(uploadResult.error || "Failed to upload images")
            }
            samplePageUrls = uploadResult.urls

            // Create new submission
            setStatusMessage("Saving submission...")
            const submissionData = {
                artistName: formData.artistName,
                email: formData.email,
                title: formData.mangaTitle, // Map mangaTitle to title
                genre: formData.genre,
                synopsis: formData.synopsis,
                portfolioUrl: formData.portfolioLink || "", // Ensure empty string if not provided
                samplePages: samplePageUrls,
            }

            const saveResult = await saveSubmission(submissionData)

            if (!saveResult.success) {
                throw new Error(saveResult.error)
            }

            setIsSubmitting(false)
            setStatusMessage("Done!")
            toast.success("Submission successful! We'll review your work and get back to you soon.")
            router.push("/")
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : "Please try again."
            toast.error(`Error submitting: ${errorMessage}`)
            setIsSubmitting(false)
            setStatusMessage("")
        }
    }

    return (
        <div className="min-h-screen bg-background p-8">
            <div className="max-w-3xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <Link href="/">
                        <Button variant="ghost" className="mb-4">
                            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Home
                        </Button>
                    </Link>

                    <div className="text-center space-y-2 mb-8">
                        <h1 className="text-5xl font-black tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/50">
                            Submit Your Work
                        </h1>
                        <p className="text-muted-foreground text-lg">
                            Share your manga with the world through Mangako
                        </p>
                    </div>
                </div>

                {/* Form Card */}
                <Card className="border-zinc-800 bg-zinc-900/50 backdrop-blur-md">
                    <CardHeader>
                        <CardTitle className="text-2xl">Artist Submission Form</CardTitle>
                        <CardDescription>
                            Tell us about your manga and let&apos;s bring your story to life
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Artist Name */}
                            <div className="space-y-2">
                                <Label htmlFor="artistName">Artist Name / Pen Name</Label>
                                <div className="relative">
                                    <User className="absolute left-3 top-3 h-4 w-4 text-zinc-500" />
                                    <Input
                                        id="artistName"
                                        placeholder="Your name or alias"
                                        value={formData.artistName}
                                        onChange={(e) => setFormData({ ...formData, artistName: e.target.value })}
                                        className="pl-10 bg-zinc-950/50 border-zinc-800"
                                        required
                                    />
                                </div>
                            </div>

                            {/* Email */}
                            <div className="space-y-2">
                                <Label htmlFor="email">Contact Email</Label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-3 h-4 w-4 text-zinc-500" />
                                    <Input
                                        id="email"
                                        type="email"
                                        placeholder="your@email.com"
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        className="pl-10 bg-zinc-950/50 border-zinc-800"
                                        required
                                    />
                                </div>
                            </div>

                            {/* Manga Title */}
                            <div className="space-y-2">
                                <Label htmlFor="mangaTitle">Manga Title</Label>
                                <div className="relative">
                                    <FileText className="absolute left-3 top-3 h-4 w-4 text-zinc-500" />
                                    <Input
                                        id="mangaTitle"
                                        placeholder="The name of your manga"
                                        value={formData.mangaTitle}
                                        onChange={(e) => setFormData({ ...formData, mangaTitle: e.target.value })}
                                        className="pl-10 bg-zinc-950/50 border-zinc-800"
                                        required
                                    />
                                </div>
                            </div>

                            {/* Genre */}
                            <div className="space-y-2">
                                <Label htmlFor="genre">Genre</Label>
                                <Input
                                    id="genre"
                                    placeholder="Action, Romance, Fantasy, etc."
                                    value={formData.genre}
                                    onChange={(e) => setFormData({ ...formData, genre: e.target.value })}
                                    className="bg-zinc-950/50 border-zinc-800"
                                    required
                                />
                            </div>

                            {/* Synopsis */}
                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <Label htmlFor="synopsis">Synopsis</Label>
                                    <span className="text-xs text-zinc-500">
                                        {formData.synopsis.length} / 5 minimum
                                    </span>
                                </div>
                                <Textarea
                                    id="synopsis"
                                    placeholder="A brief summary of your manga story (minimum 5 characters)"
                                    value={formData.synopsis}
                                    onChange={(e) => setFormData({ ...formData, synopsis: e.target.value })}
                                    className="min-h-[120px] bg-zinc-950/50 border-zinc-800"
                                    required
                                />
                            </div>

                            {/* Portfolio Link */}
                            <div className="space-y-2">
                                <Label htmlFor="portfolioLink">Portfolio / Social Media Link (Optional)</Label>
                                <div className="relative">
                                    <LinkIcon className="absolute left-3 top-3 h-4 w-4 text-zinc-500" />
                                    <Input
                                        id="portfolioLink"
                                        type="url"
                                        placeholder="https://..."
                                        value={formData.portfolioLink}
                                        onChange={(e) => setFormData({ ...formData, portfolioLink: e.target.value })}
                                        className="pl-10 bg-zinc-950/50 border-zinc-800"
                                    />
                                </div>
                            </div>

                            {/* Sample Pages - Dropzone */}
                            <div className="space-y-2">
                                <Label>Sample Pages (3-5 pages recommended)</Label>
                                <div
                                    {...getRootProps()}
                                    className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
                                        ${isDragActive ? 'border-primary bg-primary/10' : 'border-zinc-800 hover:border-primary/50 bg-zinc-950/30'}`}
                                >
                                    <input {...getInputProps()} />
                                    <Upload className="w-10 h-10 text-zinc-500 mx-auto mb-4" />
                                    <p className="text-sm text-zinc-400 font-medium">
                                        {isDragActive ? "Drop the files here..." : "Drag & drop sample pages here, or click to select"}
                                    </p>
                                    <p className="text-xs text-zinc-600 mt-2">PNG, JPG, WEBP (Max 5MB per file)</p>
                                </div>

                                {/* File List */}
                                {files.length > 0 && (
                                    <div className="grid grid-cols-2 gap-2 mt-4">
                                        {files.map((file, index) => (
                                            <div key={index} className="flex items-center justify-between p-2 bg-zinc-900 rounded border border-zinc-800">
                                                <span className="text-xs truncate max-w-[80%]">{file.name}</span>
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-6 w-6 text-muted-foreground hover:text-destructive"
                                                    onClick={() => removeFile(index)}
                                                >
                                                    <X className="h-3 w-3" />
                                                </Button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Submit Button */}
                            <Button
                                type="submit"
                                className="w-full"
                                size="lg"
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? (
                                    <>
                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                        {statusMessage || "Submitting..."}
                                    </>
                                ) : (
                                    <>
                                        <Send className="w-4 h-4 mr-2" />
                                        Submit for Review
                                    </>
                                )}
                            </Button>

                            <div className="text-center text-xs text-zinc-500 mt-4 p-3 bg-zinc-950/50 border border-zinc-800 rounded">
                                <p>📧 We typically respond within 3-5 business days</p>
                                <p className="mt-1">🎨 All submissions are reviewed by our editorial team</p>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
