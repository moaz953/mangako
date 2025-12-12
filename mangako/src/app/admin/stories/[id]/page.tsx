"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { Story, Chapter } from "@prisma/client"
import { ArrowLeft, Plus, Edit, Trash2, Upload, Loader2, GripVertical } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { getStories, getChapters, createChapter, deleteChapter, publishChapter, updateChapter, updateStory, uploadImage, publishStory, deleteStory, reorderChapters } from "@/app/actions"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
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
import { toast } from "sonner"
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragEndEvent,
} from '@dnd-kit/core'
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    useSortable,
    verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'




interface ExtendedChapter extends Omit<Chapter, 'pages'> {
    pages: string[]
}

interface SortableChapterItemProps {
    chapter: ExtendedChapter
    onEdit: (chapter: ExtendedChapter) => void
    onDelete: (id: string) => void
    onPublish: (id: string, status: string) => void
    publishing: string | null
}

function SortableChapterItem({ chapter, onEdit, onDelete, onPublish, publishing }: SortableChapterItemProps) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: chapter.id })

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
    }

    return (
        <div
            ref={setNodeRef}
            style={style}
            className="border rounded-lg p-4 bg-background"
        >
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 flex-1">
                    <div
                        {...attributes}
                        {...listeners}
                        className="cursor-grab active:cursor-grabbing p-1 hover:bg-muted rounded"
                    >
                        <GripVertical className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div className="flex-1">
                        <div className="flex items-center gap-2">
                            <h3 className="font-semibold">
                                Chapter {chapter.number}: {chapter.title || 'Untitled'}
                            </h3>
                            <Badge variant={chapter.status === 'published' ? 'default' : 'secondary'}>
                                {chapter.status}
                            </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                            {chapter.pages.length} pages
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <div className="flex items-center gap-2">
                        <Switch
                            checked={chapter.status === "published"}
                            onCheckedChange={() => onPublish(chapter.id, chapter.status)}
                            disabled={publishing === chapter.id}
                        />
                        <Label className="text-sm">
                            {publishing === chapter.id && (
                                <Loader2 className="h-3 w-3 animate-spin inline mr-1" />
                            )}
                            Publish
                        </Label>
                    </div>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onEdit(chapter)}
                    >
                        <Edit className="h-4 w-4" />
                    </Button>
                    <Link href={`/admin/chapters/${chapter.id}`}>
                        <Button variant="outline" size="sm">
                            <Upload className="h-4 w-4" />
                        </Button>
                    </Link>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onDelete(chapter.id)}
                    >
                        <Trash2 className="h-4 w-4" />
                    </Button>
                </div>
            </div>
        </div>
    )
}


export default function StoryDetailPage({ params }: { params: { id: string } }) {
    const { id: storyId } = params
    const router = useRouter()
    const [story, setStory] = useState<Story | null>(null)
    const [chapters, setChapters] = useState<ExtendedChapter[]>([])
    const [loading, setLoading] = useState(true)
    const [dialogOpen, setDialogOpen] = useState(false)
    const [uploading, setUploading] = useState(false)
    const [updating, setUpdating] = useState(false)
    const [creating, setCreating] = useState(false)
    const [publishing, setPublishing] = useState<string | null>(null)
    const [publishingStory, setPublishingStory] = useState(false)
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
    const [deleteStoryDialogOpen, setDeleteStoryDialogOpen] = useState(false)
    const [chapterToDelete, setChapterToDelete] = useState<string | null>(null)
    const [deleting, setDeleting] = useState(false)
    const [deletingStory, setDeletingStory] = useState(false)
    const [editChapterDialogOpen, setEditChapterDialogOpen] = useState(false)
    const [chapterToEdit, setChapterToEdit] = useState<ExtendedChapter | null>(null)
    const [updatingChapter, setUpdatingChapter] = useState(false)
    const [newChapter, setNewChapter] = useState({
        title: "",
        number: "1"
    })
    const [editDialogOpen, setEditDialogOpen] = useState(false)
    const [editFormData, setEditFormData] = useState({
        title: "",
        author: "",
        description: ""
    })

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    )

    const loadData = async () => {
        setLoading(true)
        const stories = await getStories()
        const found = stories.find((s: Story) => s.id === storyId)
        setStory(found || null)
        if (found) {
            setEditFormData({
                title: found.title || "",
                author: found.author || "",
                description: found.description || ""
            })
        }


        const allChapters = await getChapters() as unknown as ExtendedChapter[]
        const storyChapters = allChapters.filter((ch) => ch.storyId === storyId)

        setChapters(storyChapters.sort((a, b) => a.number - b.number))
        setLoading(false)
    }

    useEffect(() => {
        loadData()
    }, [storyId])

    const handleDragEnd = async (event: DragEndEvent) => {
        const { active, over } = event

        if (!over || active.id === over.id) {
            return
        }

        const oldIndex = chapters.findIndex((ch) => ch.id === active.id)
        const newIndex = chapters.findIndex((ch) => ch.id === over.id)

        const newChapters = arrayMove(chapters, oldIndex, newIndex)

        // Update local state immediately for smooth UX
        setChapters(newChapters)

        // Prepare updates with new chapter numbers
        const updates = newChapters.map((ch, index) => ({
            id: ch.id,
            number: index + 1
        }))

        // Save to backend
        try {
            const result = await reorderChapters(updates)
            if (result.success) {
                toast.success('تم إعادة ترتيب الفصول بنجاح!')
                loadData() // Reload to ensure consistency
            } else {
                toast.error('فشل إعادة الترتيب')
                loadData() // Reload to revert
            }
        } catch (_error) {
            toast.error('حدث خطأ أثناء إعادة الترتيب')
            loadData() // Reload to revert
        }
    }

    const handleCoverUpdate = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        if (!file.type.startsWith('image/')) {
            toast.error('يرجى اختيار ملف صورة')
            return
        }

        if (file.size > 50 * 1024 * 1024) {
            toast.error('حجم الصورة يجب أن يكون أقل من 50MB')
            return
        }

        setUploading(true)
        try {
            const formData = new FormData()
            formData.append("file", file)
            const result = await uploadImage(formData)

            if (result.success && result.url) {
                await updateStory(storyId, { coverImage: result.url })
                if (story) {
                    setStory({ ...story, coverImage: result.url })
                }
                toast.success('تم تحديث صورة الغلاف!')
            } else {
                toast.error('فشل رفع الصورة')
            }
        } catch (_error) {
            toast.error('حدث خطأ أثناء رفع الصورة')
        } finally {
            setUploading(false)
        }
    }

    const handleUpdateStory = async () => {
        if (!editFormData.title.trim()) {
            toast.error('يرجى إدخال العنوان')
            return
        }

        setUpdating(true)
        try {
            const result = await updateStory(storyId, editFormData)

            if (result.success) {
                if (story) {
                    setStory({ ...story, ...editFormData })
                }
                setEditDialogOpen(false)
                toast.success('تم تحديث القصة بنجاح!')
            } else {
                toast.error('فشل تحديث القصة')
            }
        } catch (_error) {
            toast.error('حدث خطأ أثناء التحديث')
        }
        setUpdating(false)
    }

    const handleDeleteStory = async () => {
        setDeletingStory(true)
        try {
            const result = await deleteStory(storyId)
            if (result.success) {
                toast.success('تم حذف القصة بنجاح!')
                router.push('/admin/stories')
            } else {
                toast.error('فشل حذف القصة')
            }
        } catch (_error) {
            toast.error('حدث خطأ أثناء الحذف')
        }
        setDeletingStory(false)
        setDeleteStoryDialogOpen(false)
    }

    const handleCreateChapter = async () => {
        if (!newChapter.title.trim()) {
            toast.error('يرجى إدخال عنوان الفصل')
            return
        }

        const chapterNum = parseInt(newChapter.number)
        if (isNaN(chapterNum) || chapterNum < 1) {
            toast.error('يرجى إدخال رقم فصل صحيح')
            return
        }

        setCreating(true)
        try {
            const result = await createChapter({
                ...newChapter,
                storyId: storyId,
                number: chapterNum,
                price: 0,
                isLocked: false
            })

            if (result.success) {
                setDialogOpen(false)
                setNewChapter({ title: "", number: "1" })
                loadData()
                toast.success('تم إنشاء الفصل بنجاح!')
            } else {
                toast.error('فشل إنشاء الفصل')
            }
        } catch (_error) {
            toast.error('حدث خطأ أثناء الإنشاء')
        }
        setCreating(false)
    }

    const handleEditChapter = (chapter: ExtendedChapter) => {
        setChapterToEdit(chapter)
        setEditChapterDialogOpen(true)
    }

    const handleUpdateChapter = async () => {
        if (!chapterToEdit || !chapterToEdit.title) {
            toast.error('يرجى إدخال عنوان الفصل')
            return
        }

        const chapterNum = typeof chapterToEdit.number === 'string' ? parseFloat(chapterToEdit.number) : chapterToEdit.number
        if (isNaN(chapterNum) || chapterNum < 1) {
            toast.error('يرجى إدخال رقم فصل صحيح')
            return
        }

        setUpdatingChapter(true)
        try {
            const result = await updateChapter(chapterToEdit.id, {
                title: chapterToEdit.title,
                number: chapterNum
            })

            if (result.success) {
                setEditChapterDialogOpen(false)
                setChapterToEdit(null)
                loadData()
                toast.success('تم تحديث الفصل بنجاح!')
            } else {
                toast.error('فشل تحديث الفصل')
            }
        } catch (_error) {
            toast.error('حدث خطأ أثناء التحديث')
        }
        setUpdatingChapter(false)
    }

    const handleDeleteClick = (id: string) => {
        setChapterToDelete(id)
        setDeleteDialogOpen(true)
    }

    const handleDeleteConfirm = async () => {
        if (!chapterToDelete) return

        setDeleting(true)
        try {
            const result = await deleteChapter(chapterToDelete)
            if (result.success) {
                toast.success('تم حذف الفصل')
                loadData()
            } else {
                toast.error('فشل حذف الفصل')
            }
        } catch (_error) {
            toast.error('حدث خطأ أثناء الحذف')
        }
        setDeleting(false)
        setDeleteDialogOpen(false)
        setChapterToDelete(null)
    }

    const handleStoryPublishToggle = async () => {
        if (!story) return
        const publish = story.status !== "published"
        setPublishingStory(true)

        try {
            const result = await publishStory(storyId, publish)
            if (result.success) {
                toast.success(publish ? 'تم نشر القصة!' : 'تم إلغاء نشر القصة')
                if (story) {
                    setStory({ ...story, status: publish ? "published" : "draft" })
                }
            } else {
                toast.error('فشل تحديث حالة النشر')
            }
        } catch (_error) {
            toast.error('حدث خطأ')
        }

        setPublishingStory(false)
    }

    const handlePublishToggle = async (id: string, currentStatus: string) => {
        const publish = currentStatus !== "published"
        setPublishing(id)

        try {
            const result = await publishChapter(id, publish)
            if (result.success) {
                toast.success(publish ? 'تم نشر الفصل!' : 'تم إلغاء نشر الفصل')
                loadData()
            } else {
                toast.error('فشل تحديث حالة النشر')
            }
        } catch (_error) {
            toast.error('حدث خطأ')
        }

        setPublishing(null)
    }

    if (loading || !story) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        )
    }

    return (
        <>
            <div className="space-y-6">
                <div className="flex items-center gap-4">
                    <Link href="/admin/stories">
                        <Button variant="outline" size="icon">
                            <ArrowLeft className="h-4 w-4" />
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-3xl font-bold">{story.title}</h1>
                        <p className="text-muted-foreground">by {story.author}</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="space-y-4">
                        <div className="border rounded-lg p-4 space-y-4">
                            <h3 className="font-semibold">Cover Image</h3>
                            <div className="aspect-[3/4] bg-muted rounded relative">
                                {story.coverImage ? (
                                    <Image
                                        src={story.coverImage}
                                        alt={story.title}
                                        fill
                                        sizes="300px"
                                        className="object-cover rounded"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center">
                                        No cover
                                    </div>
                                )}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="cover-update">Update Cover</Label>
                                <Input
                                    id="cover-update"
                                    type="file"
                                    accept="image/*"
                                    onChange={handleCoverUpdate}
                                    disabled={uploading}
                                />
                                {uploading && (
                                    <p className="text-sm text-muted-foreground flex items-center gap-2">
                                        <Loader2 className="h-3 w-3 animate-spin" />
                                        Uploading...
                                    </p>
                                )}
                            </div>
                        </div>

                        <div className="border rounded-lg p-4 space-y-4">
                            <h3 className="font-semibold">Story Details</h3>
                            <div className="space-y-2 text-sm">
                                <div>
                                    <span className="text-muted-foreground">Status:</span>
                                    <Badge className="ml-2" variant={story.status === "published" ? "default" : "secondary"}>
                                        {story.status}
                                    </Badge>
                                </div>
                                <div>
                                    <span className="text-muted-foreground">Chapters:</span>
                                    <span className="ml-2 font-medium">{chapters.length}</span>
                                </div>
                            </div>
                            <div className="border-t pt-4 space-y-3">
                                <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                                    <div className="flex items-center gap-2">
                                        <Switch
                                            checked={story.status === "published"}
                                            onCheckedChange={handleStoryPublishToggle}
                                            disabled={publishingStory}
                                        />
                                        <div>
                                            <Label className="text-sm font-medium">
                                                {publishingStory && (
                                                    <Loader2 className="h-3 w-3 animate-spin inline mr-1" />
                                                )}
                                                Publish Story
                                            </Label>
                                            <p className="text-xs text-muted-foreground mt-0.5">
                                                {story.status === "published" ? "القصة منشورة للجميع" : "القصة مخفية"}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                                <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
                                    <DialogTrigger asChild>
                                        <Button variant="outline" className="w-full">
                                            <Edit className="h-4 w-4 mr-2" />
                                            Edit Story Info
                                        </Button>
                                    </DialogTrigger>
                                    <DialogContent>
                                        <DialogHeader>
                                            <DialogTitle>Edit Story</DialogTitle>
                                        </DialogHeader>
                                        <div className="space-y-4 py-4">
                                            <div className="space-y-2">
                                                <Label htmlFor="edit-title">Title *</Label>
                                                <Input
                                                    id="edit-title"
                                                    value={editFormData.title}
                                                    onChange={(e) => setEditFormData({ ...editFormData, title: e.target.value })}
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="edit-author">Author</Label>
                                                <Input
                                                    id="edit-author"
                                                    value={editFormData.author}
                                                    onChange={(e) => setEditFormData({ ...editFormData, author: e.target.value })}
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="edit-desc">Description</Label>
                                                <Textarea
                                                    id="edit-desc"
                                                    rows={4}
                                                    value={editFormData.description}
                                                    onChange={(e) => setEditFormData({ ...editFormData, description: e.target.value })}
                                                />
                                            </div>
                                        </div>
                                        <DialogFooter>
                                            <Button variant="outline" onClick={() => setEditDialogOpen(false)} disabled={updating}>
                                                Cancel
                                            </Button>
                                            <Button onClick={handleUpdateStory} disabled={updating}>
                                                {updating ? (
                                                    <>
                                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                        Updating...
                                                    </>
                                                ) : (
                                                    'Save Changes'
                                                )}
                                            </Button>
                                        </DialogFooter>
                                    </DialogContent>
                                </Dialog>
                                <Button
                                    variant="destructive"
                                    className="w-full"
                                    onClick={() => setDeleteStoryDialogOpen(true)}
                                >
                                    <Trash2 className="h-4 w-4 mr-2" />
                                    Delete Story
                                </Button>
                            </div>
                        </div>
                    </div>

                    <div className="md:col-span-2 space-y-4">
                        <div className="flex items-center justify-between">
                            <h2 className="text-2xl font-bold">Chapters</h2>
                            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                                <DialogTrigger asChild>
                                    <Button>
                                        <Plus className="h-4 w-4 mr-2" />
                                        Add Chapter
                                    </Button>
                                </DialogTrigger>
                                <DialogContent>
                                    <DialogHeader>
                                        <DialogTitle>Create New Chapter</DialogTitle>
                                    </DialogHeader>
                                    <div className="space-y-4 py-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="ch-number">Chapter Number *</Label>
                                            <Input
                                                id="ch-number"
                                                type="number"
                                                value={newChapter.number}
                                                onChange={(e) => setNewChapter({ ...newChapter, number: e.target.value })}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="ch-title">Chapter Title *</Label>
                                            <Input
                                                id="ch-title"
                                                value={newChapter.title}
                                                onChange={(e) => setNewChapter({ ...newChapter, title: e.target.value })}
                                                placeholder="Chapter 1: The Beginning"
                                            />
                                        </div>
                                    </div>
                                    <DialogFooter>
                                        <Button variant="outline" onClick={() => setDialogOpen(false)} disabled={creating}>
                                            Cancel
                                        </Button>
                                        <Button onClick={handleCreateChapter} disabled={creating}>
                                            {creating ? (
                                                <>
                                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                    Creating...
                                                </>
                                            ) : (
                                                'Create Chapter'
                                            )}
                                        </Button>
                                    </DialogFooter>
                                </DialogContent>
                            </Dialog>
                        </div>

                        {chapters.length === 0 ? (
                            <div className="border-2 border-dashed rounded-lg p-12 text-center">
                                <p className="text-muted-foreground">No chapters yet</p>
                                <p className="text-sm text-muted-foreground mt-2">Create your first chapter to get started</p>
                            </div>
                        ) : (
                            <DndContext
                                sensors={sensors}
                                collisionDetection={closestCenter}
                                onDragEnd={handleDragEnd}
                            >
                                <SortableContext
                                    items={chapters.map(ch => ch.id)}
                                    strategy={verticalListSortingStrategy}
                                >
                                    <div className="space-y-2">
                                        {chapters.map((chapter) => (
                                            <SortableChapterItem
                                                key={chapter.id}
                                                chapter={chapter}
                                                onEdit={handleEditChapter}
                                                onDelete={handleDeleteClick}
                                                onPublish={handlePublishToggle}
                                                publishing={publishing}
                                            />
                                        ))}
                                    </div>
                                </SortableContext>
                            </DndContext>
                        )}
                    </div>
                </div>
            </div>

            {/* Delete Chapter Dialog */}
            <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>هل أنت متأكد؟</AlertDialogTitle>
                        <AlertDialogDescription>
                            سيتم حذف هذا الفصل نهائياً. لا يمكن التراجع عن هذا الإجراء.
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

            {/* Delete Story Dialog */}
            <AlertDialog open={deleteStoryDialogOpen} onOpenChange={setDeleteStoryDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>حذف القصة بالكامل؟</AlertDialogTitle>
                        <AlertDialogDescription>
                            سيتم حذف القصة وجميع فصولها نهائياً. هذا الإجراء لا يمكن التراجع عنه.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={deletingStory}>إلغاء</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDeleteStory}
                            disabled={deletingStory}
                            className="bg-destructive hover:bg-destructive/90"
                        >
                            {deletingStory ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    جارٍ الحذف...
                                </>
                            ) : (
                                'حذف القصة'
                            )}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* Edit Chapter Dialog */}
            <Dialog open={editChapterDialogOpen} onOpenChange={setEditChapterDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Edit Chapter</DialogTitle>
                        <DialogDescription>
                            تعديل معلومات الفصل
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="edit-ch-number">Chapter Number *</Label>
                            <Input
                                id="edit-ch-number"
                                type="number"
                                value={chapterToEdit?.number || ""}
                                onChange={(e) => {
                                    if (chapterToEdit) {
                                        setChapterToEdit({
                                            ...chapterToEdit,
                                            pages: chapterToEdit.pages || [],
                                            number: parseInt(e.target.value) || 0
                                        })
                                    }
                                }}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="edit-ch-title">Chapter Title *</Label>
                            <Input
                                id="edit-ch-title"
                                value={chapterToEdit?.title || ""}
                                onChange={(e) => {
                                    if (chapterToEdit) {
                                        setChapterToEdit({
                                            ...chapterToEdit,
                                            pages: chapterToEdit.pages || [],
                                            title: e.target.value
                                        })
                                    }
                                }}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setEditChapterDialogOpen(false)} disabled={updatingChapter}>
                            Cancel
                        </Button>
                        <Button onClick={handleUpdateChapter} disabled={updatingChapter}>
                            {updatingChapter ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Updating...
                                </>
                            ) : (
                                'Save Changes'
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    )
}
