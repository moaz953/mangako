"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { BookOpen, ArrowLeft, Heart, Play } from "lucide-react"
import { ProgressBar } from "@/components/progress-bar"
import { addBookmark, removeBookmark, isBookmarked, getStoryProgress } from "@/app/actions"
import { toast } from "sonner"

import { Story, Chapter, StoryProgress } from "@/types/models"

export default function MangaDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { data: session } = useSession()
    const [story, setStory] = useState<Story | null>(null)
    const [chapters, setChapters] = useState<Chapter[]>([])
    const [loading, setLoading] = useState(true)
    const [storyId, setStoryId] = useState<string>("")
    const [bookmarked, setBookmarked] = useState(false)
    const [bookmarkLoading, setBookmarkLoading] = useState(false)
    const [progress, setProgress] = useState<StoryProgress | null>(null)

    useEffect(() => {
        const loadData = async () => {
            try {
                // Await params in Next.js 16+
                const resolvedParams = await params
                setStoryId(resolvedParams.id)

                const storiesRes = await fetch('/api/stories')
                const chaptersRes = await fetch('/api/chapters')

                if (storiesRes.ok && chaptersRes.ok) {
                    const stories = await storiesRes.json()
                    const allChapters = await chaptersRes.json()

                    const foundStory = stories.find((s: Story) => s.id === resolvedParams.id)
                    setStory(foundStory || null)

                    const storyChapters = allChapters.filter(
                        (ch: Chapter) => ch.storyId === resolvedParams.id && ch.status === 'published'
                    )
                    setChapters(storyChapters.sort((a: Chapter, b: Chapter) => a.number - b.number))

                    // Check if bookmarked
                    if (session?.user?.id) {
                        const result = await isBookmarked(resolvedParams.id)
                        setBookmarked(result.isBookmarked)

                        // Check reading progress
                        const progressData = await getStoryProgress(session.user.id, resolvedParams.id)
                        if (progressData.lastChapter) {
                            setProgress(progressData)
                        }
                    }
                }
            } catch (error) {
                console.error("Failed to load data:", error)
            }
            setLoading(false)
        }
        loadData()
    }, [session])

    const handleBookmarkToggle = async () => {
        if (!session?.user?.id) {
            toast.error("Please login to bookmark")
            return
        }

        setBookmarkLoading(true)
        try {
            if (bookmarked) {
                const result = await removeBookmark(storyId)
                if (result.success) {
                    setBookmarked(false)
                    toast.success("Removed from favorites")
                } else {
                    toast.error(result.error || "Failed to remove bookmark")
                }
            } else {
                const result = await addBookmark(storyId)
                if (result.success) {
                    setBookmarked(true)
                    toast.success("Added to favorites")
                } else {
                    toast.error(result.error || "Failed to add bookmark")
                }
            }
        } catch (error) {
            console.error("Bookmark error:", error)
            toast.error("Failed to update bookmark")
        } finally {
            setBookmarkLoading(false)
        }
    }

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        )
    }

    if (!story) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <p className="text-muted-foreground mb-4">Manga not found</p>
                    <Link href="/">
                        <Button>Back to Home</Button>
                    </Link>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-background">
            <main className="container mx-auto px-4 md:px-8 py-12">
                <Link href="/">
                    <Button variant="ghost" className="mb-6">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to Home
                    </Button>
                </Link>

                {/* Story Info */}
                <div className="grid md:grid-cols-[300px_1fr] gap-8 mb-12">
                    <div className="aspect-[3/4] bg-muted rounded-lg overflow-hidden shadow-lg relative">
                        {story.coverImage ? (
                            <Image
                                src={story.coverImage}
                                alt={story.title}
                                fill
                                sizes="300px"
                                className="object-cover"
                                priority
                            />
                        ) : (
                            <div className="flex items-center justify-center h-full">
                                <BookOpen className="w-16 h-16 text-muted-foreground" />
                            </div>
                        )}
                    </div>

                    <div className="space-y-6">
                        <div>
                            <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-2">
                                {story.title}
                            </h1>
                            {story.author && (
                                <p className="text-xl text-muted-foreground">by {story.author}</p>
                            )}
                        </div>

                        {story.description && (
                            <p className="text-lg text-muted-foreground leading-relaxed">
                                {story.description}
                            </p>
                        )}

                        {/* Reading Progress Bar - More prominent position */}
                        {progress && progress.progress > 0 && (
                            <div className="space-y-2 p-4 bg-muted/30 rounded-lg border border-border/50">
                                <div className="flex justify-between items-center text-sm">
                                    <span className="font-semibold text-foreground">Reading Progress</span>
                                    <span className="text-muted-foreground">{progress.progress}% Complete</span>
                                </div>
                                <ProgressBar
                                    current={progress.progress}
                                    total={100}
                                    showText={false}
                                    className="h-2.5"
                                />
                                <p className="text-xs text-muted-foreground">
                                    Last read: Chapter {progress.lastChapter?.number}
                                    {progress.lastChapter?.pageProgress !== undefined &&
                                        ` • Page ${progress.lastChapter.pageProgress + 1} of ${progress.lastChapter.pages?.length || 0}`
                                    }
                                </p>
                            </div>
                        )}

                        <div className="flex gap-4">
                            {progress?.lastChapter ? (
                                <Link href={`/read/${progress.lastChapter.id}?page=${progress.lastChapter.pageProgress || 0}`}>
                                    <Button size="lg" className="px-8 gap-2">
                                        <Play className="h-5 w-5" />
                                        Continue Reading
                                        <span className="text-xs opacity-80 ml-1">
                                            (Ch. {progress.lastChapter.number})
                                        </span>
                                    </Button>
                                </Link>
                            ) : (
                                chapters.length > 0 && (
                                    <Link href={`/read/${chapters[0].id}`}>
                                        <Button size="lg" className="px-8">
                                            <BookOpen className="mr-2 h-5 w-5" />
                                            Start Reading
                                        </Button>
                                    </Link>
                                )
                            )}

                            <Button
                                size="lg"
                                variant={bookmarked ? "default" : "outline"}
                                onClick={handleBookmarkToggle}
                                disabled={bookmarkLoading}
                            >
                                <Heart
                                    className={`mr-2 h-5 w-5 ${bookmarked ? 'fill-current' : ''}`}
                                />
                                {bookmarked ? "In Favorites" : "Add to Favorites"}
                            </Button>
                        </div>
                    </div>
                </div>


                {/* Chapters List */}
                <div className="max-w-4xl">
                    <h2 className="text-2xl font-bold mb-6">Chapters ({chapters.length})</h2>

                    {chapters.length === 0 ? (
                        <div className="border-2 border-dashed rounded-lg p-12 text-center">
                            <p className="text-muted-foreground">No chapters published yet</p>
                        </div>
                    ) : (
                        <div className="space-y-2">
                            {chapters.map((chapter) => (
                                <Link
                                    key={chapter.id}
                                    href={`/read/${chapter.id}`}
                                    className="group"
                                >
                                    <div className="border rounded-lg p-4 hover:border-primary hover:shadow-md transition-all">
                                        <div className="flex items-center justify-between">
                                            <div className="space-y-1">
                                                <div className="flex items-center gap-3">
                                                    <span className="text-sm font-semibold text-muted-foreground">
                                                        Chapter {chapter.number}
                                                    </span>
                                                    {chapter.isLocked && (
                                                        <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full font-medium">
                                                            {chapter.price} coins
                                                        </span>
                                                    )}
                                                </div>
                                                <h3 className="text-lg font-semibold group-hover:text-primary transition-colors">
                                                    {chapter.title}
                                                </h3>
                                                <p className="text-sm text-muted-foreground">
                                                    {chapter.pages?.length || 0} pages
                                                </p>
                                            </div>
                                            <Button variant="ghost" size="icon" className="group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                                                <BookOpen className="h-5 w-5" />
                                            </Button>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}
                </div>
            </main >
        </div >
    )
}
