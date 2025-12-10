"use client"

import { useState, useEffect } from "react"
import { Plus, Edit, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { getChapters, createChapter, deleteChapter, publishChapter, getStories } from "@/app/actions"
import Link from "next/link"
import type { Story } from "@prisma/client"

interface Chapter {
    id: string
    storyId: string
    number: number
    title: string | null
    pages: string[]
    status: string
}

export default function AdminChaptersPage() {
    const [chapters, setChapters] = useState<Chapter[]>([])
    const [loading, setLoading] = useState(true)
    const [dialogOpen, setDialogOpen] = useState(false)
    const [selectedChapters, setSelectedChapters] = useState<Set<string>>(new Set())
    const [isProcessing, setIsProcessing] = useState(false)
    const [stories, setStories] = useState<Story[]>([])
    const [newChapter, setNewChapter] = useState({
        title: "",
        number: "1",
        price: "0",
        releaseDate: new Date().toISOString().split("T")[0],
        storyId: ""
    })

    const loadData = async () => {
        const [chaptersData, storiesData] = await Promise.all([
            getChapters(),
            getStories()
        ])
        setChapters(chaptersData)
        setStories(storiesData)
        setLoading(false)
    }

    useEffect(() => {
        loadData()
    }, [])

    const handleCreateChapter = async () => {
        const result = await createChapter({
            title: newChapter.title,
            number: parseInt(newChapter.number),
            price: parseInt(newChapter.price),
            releaseDate: new Date(newChapter.releaseDate).toISOString(),
            isLocked: parseInt(newChapter.price) > 0,
            storyId: newChapter.storyId,
            pages: []
        })

        if (result.success) {
            setDialogOpen(false)
            setNewChapter({
                title: "",
                number: "1",
                price: "0",
                releaseDate: new Date().toISOString().split("T")[0],
                storyId: ""
            })
            loadData()
        }
    }

    const handleDelete = async (id: string) => {
        if (confirm("Are you sure you want to delete this chapter?")) {
            await deleteChapter(id)
            loadData()
        }
    }

    const handlePublishToggle = async (id: string, currentStatus: string) => {
        const publish = currentStatus !== "published"
        await publishChapter(id, publish)
        loadData()
    }

    // Bulk Actions
    const handleSelectAll = () => {
        if (selectedChapters.size === chapters.length) {
            setSelectedChapters(new Set())
        } else {
            setSelectedChapters(new Set(chapters.map(c => c.id)))
        }
    }

    const handleToggleSelect = (id: string) => {
        const newSelected = new Set(selectedChapters)
        if (newSelected.has(id)) {
            newSelected.delete(id)
        } else {
            newSelected.add(id)
        }
        setSelectedChapters(newSelected)
    }

    const handleBulkPublish = async (publish: boolean) => {
        setIsProcessing(true)
        try {
            for (const id of selectedChapters) {
                await publishChapter(id, publish)
            }
            await loadData()
            setSelectedChapters(new Set())
        } finally {
            setIsProcessing(false)
        }
    }

    const handleBulkDelete = async () => {
        if (!confirm(`Are you sure you want to delete ${selectedChapters.size} chapter(s)?`)) {
            return
        }
        setIsProcessing(true)
        try {
            for (const id of selectedChapters) {
                await deleteChapter(id)
            }
            await loadData()
            setSelectedChapters(new Set())
        } finally {
            setIsProcessing(false)
        }
    }

    const [searchQuery, setSearchQuery] = useState("")
    const [selectedStoryFilter, setSelectedStoryFilter] = useState<string>("all")

    const filteredChapters = chapters.filter(chapter => {
        const matchesSearch =
            (chapter.title?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false) ||
            chapter.number.toString().includes(searchQuery)

        const matchesStory = selectedStoryFilter === "all" || chapter.storyId === selectedStoryFilter

        return matchesSearch && matchesStory
    })

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Chapters</h1>
                    <p className="text-muted-foreground">Manage your manga chapters</p>
                </div>

                <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                    <DialogTrigger asChild>
                        <Button className="gap-2">
                            <Plus className="h-4 w-4" />
                            New Chapter
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Create New Chapter</DialogTitle>
                            <DialogDescription>
                                Add a new chapter. You can upload pages after creating it.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                            <div className="space-y-2">
                                <Label htmlFor="title">Chapter Title</Label>
                                <Input
                                    id="title"
                                    placeholder="The Awakening"
                                    value={newChapter.title}
                                    onChange={(e) => setNewChapter({ ...newChapter, title: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="story">Story</Label>
                                <select
                                    id="story"
                                    className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                    value={newChapter.storyId}
                                    onChange={(e) => setNewChapter({ ...newChapter, storyId: e.target.value })}
                                >
                                    <option value="" disabled>Select a story</option>
                                    {stories.map((story) => (
                                        <option key={story.id} value={story.id}>
                                            {story.title}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="number">Chapter Number</Label>
                                    <Input
                                        id="number"
                                        type="number"
                                        placeholder="1"
                                        value={newChapter.number}
                                        onChange={(e) => setNewChapter({ ...newChapter, number: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="price">Price (Coins)</Label>
                                    <Input
                                        id="price"
                                        type="number"
                                        placeholder="1"
                                        value={newChapter.price}
                                        onChange={(e) => setNewChapter({ ...newChapter, price: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="date">Release Date</Label>
                                <Input
                                    id="date"
                                    type="date"
                                    value={newChapter.releaseDate}
                                    onChange={(e) => setNewChapter({ ...newChapter, releaseDate: e.target.value })}
                                />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
                            <Button onClick={handleCreateChapter}>Create Chapter</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1 max-w-sm">
                    <Input
                        placeholder="Search chapters..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-4"
                    />
                </div>
                <div className="w-full sm:w-[200px]">
                    <select
                        className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        value={selectedStoryFilter}
                        onChange={(e) => setSelectedStoryFilter(e.target.value)}
                    >
                        <option value="all">All Stories</option>
                        {stories.map((story) => (
                            <option key={story.id} value={story.id}>
                                {story.title}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Bulk Actions Bar */}
            {selectedChapters.size > 0 && (
                <div className="flex items-center justify-between p-4 bg-primary/10 rounded-lg border border-primary/20">
                    <div className="flex items-center gap-2">
                        <span className="font-semibold">{selectedChapters.size} chapter(s) selected</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleBulkPublish(true)}
                            disabled={isProcessing}
                        >
                            Publish Selected
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleBulkPublish(false)}
                            disabled={isProcessing}
                        >
                            Unpublish Selected
                        </Button>
                        <Button
                            variant="destructive"
                            size="sm"
                            onClick={handleBulkDelete}
                            disabled={isProcessing}
                        >
                            Delete Selected
                        </Button>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setSelectedChapters(new Set())}
                        >
                            Clear Selection
                        </Button>
                    </div>
                </div>
            )}

            {filteredChapters.length === 0 ? (
                <div className="border-2 border-dashed rounded-lg p-12 text-center">
                    <p className="text-muted-foreground mb-4">No chapters found matching your criteria.</p>
                    {chapters.length === 0 && (
                        <Button onClick={() => setDialogOpen(true)}>
                            <Plus className="h-4 w-4 mr-2" />
                            Create First Chapter
                        </Button>
                    )}
                </div>
            ) : (
                <div className="border rounded-lg">
                    <table className="w-full">
                        <thead className="bg-muted/50">
                            <tr>
                                <th className="text-left p-4 w-12">
                                    <input
                                        type="checkbox"
                                        checked={selectedChapters.size === filteredChapters.length && filteredChapters.length > 0}
                                        onChange={handleSelectAll}
                                        className="w-4 h-4 rounded border-border"
                                    />
                                </th>
                                <th className="text-left p-4 font-semibold">Chapter</th>
                                <th className="text-left p-4 font-semibold">Title</th>
                                <th className="text-left p-4 font-semibold">Story</th>
                                <th className="text-left p-4 font-semibold">Pages</th>
                                <th className="text-left p-4 font-semibold">Status</th>
                                <th className="text-left p-4 font-semibold">Published</th>
                                <th className="text-right p-4 font-semibold">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredChapters.map((chapter) => {
                                const story = stories.find(s => s.id === chapter.storyId)
                                return (
                                    <tr key={chapter.id} className="border-t hover:bg-muted/20">
                                        <td className="p-4">
                                            <input
                                                type="checkbox"
                                                checked={selectedChapters.has(chapter.id)}
                                                onChange={() => handleToggleSelect(chapter.id)}
                                                className="w-4 h-4 rounded border-border"
                                            />
                                        </td>
                                        <td className="p-4 font-medium">#{chapter.number}</td>
                                        <td className="p-4">{chapter.title}</td>
                                        <td className="p-4 text-muted-foreground">{story?.title || '-'}</td>
                                        <td className="p-4 text-muted-foreground">{chapter.pages?.length || 0} pages</td>
                                        <td className="p-4">
                                            <Badge variant={chapter.status === "published" ? "default" : "secondary"}>
                                                {chapter.status}
                                            </Badge>
                                        </td>
                                        <td className="p-4">
                                            <Switch
                                                checked={chapter.status === "published"}
                                                onCheckedChange={() => handlePublishToggle(chapter.id, chapter.status)}
                                            />
                                        </td>
                                        <td className="p-4">
                                            <div className="flex items-center justify-end gap-2">
                                                <Link href={`/admin/chapters/${chapter.id}`}>
                                                    <Button variant="ghost" size="sm">
                                                        <Edit className="h-4 w-4" />
                                                    </Button>
                                                </Link>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => handleDelete(chapter.id)}
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                )
                            })}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    )
}
