"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { Plus, Edit, Trash2, BookOpen, Loader2, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
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
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { getStories, createStory, deleteStory, publishStory, uploadImage } from "@/app/actions"
import Link from "next/link"
import { toast } from "sonner"
import type { Story } from "@prisma/client"


export default function AdminStoriesPage() {
    const [stories, setStories] = useState<Story[]>([])
    const [loading, setLoading] = useState(true)
    const [dialogOpen, setDialogOpen] = useState(false)
    const [uploading, setUploading] = useState(false)
    const [creating, setCreating] = useState(false)
    const [publishing, setPublishing] = useState<string | null>(null)
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
    const [storyToDelete, setStoryToDelete] = useState<string | null>(null)
    const [deleting, setDeleting] = useState(false)
    const [newStory, setNewStory] = useState({
        title: "",
        description: "",
        author: "",
        coverImage: ""
    })

    const loadStories = async () => {
        setLoading(true)
        const data = await getStories()
        setStories(data)
        setLoading(false)
    }

    useEffect(() => {
        const loadData = async () => {
            setLoading(true)
            try {
                const data = await getStories()
                setStories(data)
            } catch (error) {
                console.error("Failed to load stories:", error)
                toast.error("Failed to load stories")
            } finally {
                setLoading(false)
            }
        }

        loadData()
    }, [])

    const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        // Validate file type
        if (!file.type.startsWith('image/')) {
            toast.error('يرجى اختيار ملف صورة')
            return
        }

        // Validate file size (50MB max)
        if (file.size > 50 * 1024 * 1024) {
            toast.error('حجم الصورة يجب أن يكون أقل من 50 ميجابايت')
            return
        }

        setUploading(true)
        try {
            const formData = new FormData()
            formData.append("file", file)
            const result = await uploadImage(formData)

            if (result.success && result.url) {
                setNewStory({ ...newStory, coverImage: result.url })
                toast.success('تم رفع الصورة بنجاح!')
            } else {
                toast.error('فشل رفع الصورة: ' + (result.error || 'خطأ غير معروف'))
            }
        } catch (error) {
            toast.error('حدث خطأ أثناء رفع الصورة')
        }
        setUploading(false)
    }

    const handleCreateStory = async () => {
        if (!newStory.title.trim()) {
            toast.error('يرجى إدخال عنوان القصة')
            return
        }

        if (!newStory.author.trim()) {
            toast.error('يرجى إدخال اسم المؤلف')
            return
        }

        setCreating(true)
        try {
            const storyData = {
                ...newStory,
                coverImage: newStory.coverImage || undefined
            }
            const result = await createStory(storyData)

            if (result.success) {
                toast.success('تم إنشاء القصة بنجاح!')
                setDialogOpen(false)
                setNewStory({
                    title: "",
                    description: "",
                    author: "",
                    coverImage: ""
                })
                loadStories()
            } else {
                toast.error('فشل إنشاء القصة: ' + (result.error || 'خطأ غير معروف'))
            }
        } catch (error) {
            toast.error('حدث خطأ غير متوقع')
        }
        setCreating(false)
    }

    const handleDeleteClick = (id: string) => {
        setStoryToDelete(id)
        setDeleteDialogOpen(true)
    }

    const handleDeleteConfirm = async () => {
        if (!storyToDelete) return

        setDeleting(true)
        try {
            const result = await deleteStory(storyToDelete)
            if (result.success) {
                toast.success('تم حذف القصة بنجاح')
                loadStories()
            } else {
                toast.error('فشل حذف القصة')
            }
        } catch (error) {
            toast.error('حدث خطأ أثناء الحذف')
        }
        setDeleting(false)
        setDeleteDialogOpen(false)
        setStoryToDelete(null)
    }

    const handlePublishToggle = async (id: string, currentStatus: string) => {
        const publish = currentStatus !== "published"
        setPublishing(id)

        try {
            const result = await publishStory(id, publish)
            if (result.success) {
                toast.success(publish ? 'تم نشر القصة!' : 'تم إلغاء نشر القصة')
                loadStories()
            } else {
                toast.error('فشل تحديث حالة النشر')
            }
        } catch (error) {
            toast.error('حدث خطأ أثناء تحديث الحالة')
        }

        setPublishing(null)
    }

    const [searchQuery, setSearchQuery] = useState("")

    const filteredStories = stories.filter(story =>
        story.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (story.author && story.author.toLowerCase().includes(searchQuery.toLowerCase()))
    )

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        )
    }

    return (
        <>
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Stories / Manga</h1>
                        <p className="text-muted-foreground">Manage your manga series</p>
                    </div>

                    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                        <DialogTrigger asChild>
                            <Button className="gap-2">
                                <Plus className="h-4 w-4" />
                                New Story
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl">
                            <DialogHeader>
                                <DialogTitle>Create New Story</DialogTitle>
                                <DialogDescription>
                                    Add a new manga/story. You can add chapters to it later.
                                </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4 py-4">
                                <div className="space-y-2">
                                    <Label htmlFor="title">Story Title *</Label>
                                    <Input
                                        id="title"
                                        placeholder="My Awesome Manga"
                                        value={newStory.title}
                                        onChange={(e) => setNewStory({ ...newStory, title: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="author">Author *</Label>
                                    <Input
                                        id="author"
                                        placeholder="Author Name"
                                        value={newStory.author}
                                        onChange={(e) => setNewStory({ ...newStory, author: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="description">Description</Label>
                                    <Textarea
                                        id="description"
                                        placeholder="A brief description of your manga..."
                                        rows={4}
                                        value={newStory.description}
                                        onChange={(e) => setNewStory({ ...newStory, description: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Cover Image</Label>
                                    {newStory.coverImage ? (
                                        <div className="relative inline-block w-32 h-48">
                                            <Image
                                                src={newStory.coverImage}
                                                alt="Cover preview"
                                                fill
                                                sizes="128px"
                                                className="object-cover rounded-lg border"
                                            />
                                            <Button
                                                variant="destructive"
                                                size="icon"
                                                className="absolute -top-2 -right-2 h-6 w-6"
                                                onClick={() => setNewStory({ ...newStory, coverImage: "" })}
                                            >
                                                <X className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    ) : (
                                        <div className="flex items-center gap-4">
                                            <Input
                                                id="cover"
                                                type="file"
                                                accept="image/*"
                                                onChange={handleCoverUpload}
                                                disabled={uploading}
                                                className="max-w-xs"
                                            />
                                            {uploading && <Loader2 className="h-4 w-4 animate-spin" />}
                                        </div>
                                    )}
                                </div>
                            </div>
                            <DialogFooter>

                                <Button
                                    variant="outline"
                                    onClick={() => setDialogOpen(false)}
                                    disabled={creating}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    onClick={handleCreateStory}
                                    disabled={creating || uploading}
                                >
                                    {creating ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Creating...
                                        </>
                                    ) : (
                                        'Create Story'
                                    )}
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </div>

                <div className="flex items-center gap-4">
                    <div className="relative flex-1 max-w-sm">
                        <Input
                            placeholder="Search stories..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-4"
                        />
                    </div>
                </div>

                {filteredStories.length === 0 ? (
                    <div className="border-2 border-dashed rounded-lg p-12 text-center">
                        <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                        <p className="text-lg font-medium">No stories found</p>
                        <p className="text-sm text-muted-foreground mt-2">
                            {stories.length === 0 ? "Create your first manga story to get started" : "Try adjusting your search"}
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {filteredStories.map((story) => (
                            <div key={story.id} className="border rounded-lg overflow-hidden hover:shadow-lg transition-shadow">
                                <Link href={`/admin/stories/${story.id}`}>
                                    <div className="aspect-[3/4] bg-muted relative">
                                        {story.coverImage ? (
                                            <Image
                                                src={story.coverImage}
                                                alt={story.title}
                                                fill
                                                sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                                                className="object-cover"
                                            />
                                        ) : (
                                            <div className="flex items-center justify-center h-full">
                                                <BookOpen className="h-12 w-12 text-muted-foreground" />
                                            </div>
                                        )}
                                        <Badge
                                            className="absolute top-2 right-2"
                                            variant={story.status === "published" ? "default" : "secondary"}
                                        >
                                            {story.status}
                                        </Badge>
                                    </div>
                                </Link>
                                <div className="p-4 space-y-3">
                                    <div>
                                        <h3 className="font-semibold line-clamp-1">{story.title}</h3>
                                        {story.author && (
                                            <p className="text-sm text-muted-foreground line-clamp-1">
                                                by {story.author}
                                            </p>
                                        )}
                                    </div>
                                    <div className="flex items-center justify-between gap-2">
                                        <div className="flex items-center gap-2">
                                            <Switch
                                                checked={story.status === "published"}
                                                onCheckedChange={() => handlePublishToggle(story.id, story.status)}
                                                disabled={publishing === story.id}
                                            />
                                            <Label className="text-sm">
                                                {publishing === story.id ? (
                                                    <Loader2 className="h-3 w-3 animate-spin inline mr-1" />
                                                ) : null}
                                                Publish
                                            </Label>
                                        </div>
                                        <div className="flex gap-2">
                                            <Link href={`/admin/stories/${story.id}`}>
                                                <Button variant="outline" size="icon">
                                                    <Edit className="h-4 w-4" />
                                                </Button>
                                            </Link>
                                            <Button
                                                variant="outline"
                                                size="icon"
                                                onClick={() => handleDeleteClick(story.id)}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>هل أنت متأكد؟</AlertDialogTitle>
                        <AlertDialogDescription>
                            سيتم حذف القصة نهائياً. لن يتم حذف الفصول، لكن ستصبح غير مرتبطة بأي قصة.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={deleting}>إلغاء</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDeleteConfirm}
                            disabled={deleting}
                            className="bg-destructive hover:bg-destructive/90"
                        >
                            {deleting ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    جارٍ الحذف...
                                </>
                            ) : (
                                'حذف'
                            )}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    )
}
