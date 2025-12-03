"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { BookOpen, Heart, X, ChevronRight, Play } from "lucide-react"
import { getBookmarks, removeBookmark, getContinueReading } from "@/app/actions"
import { ProgressBar } from "@/components/progress-bar"
import { toast } from "sonner"

import { Story, ContinueReadingItem, BookmarkedStory } from "@/types/models"

export default function LibraryPage() {
    const { data: session } = useSession()
    const [bookmarks, setBookmarks] = useState<BookmarkedStory[]>([])
    const [continueReading, setContinueReading] = useState<ContinueReadingItem[]>([])
    const [loading, setLoading] = useState(true)
    const [removingId, setRemovingId] = useState<string | null>(null)

    useEffect(() => {
        const loadData = async () => {
            if (!session?.user?.id) {
                setLoading(false)
                return
            }

            try {
                // Load bookmarks and continue reading in parallel
                const [bookmarksData, continueReadingData] = await Promise.all([
                    getBookmarks(session.user.id),
                    getContinueReading(session.user.id, 6)
                ])

                setBookmarks(bookmarksData as BookmarkedStory[])
                setContinueReading(continueReadingData)
            } catch (_error) {
                toast.error("Failed to load library data")
            } finally {
                setLoading(false)
            }
        }

        loadData()
    }, [session])

    const handleRemoveBookmark = async (e: React.MouseEvent, storyId: string, storyTitle: string) => {
        e.preventDefault() // منع التنقل للصفحة
        e.stopPropagation()

        if (!session?.user?.id) return

        setRemovingId(storyId)
        try {
            const result = await removeBookmark(storyId)
            if (result.success) {
                setBookmarks(bookmarks.filter(b => b.id !== storyId))
                toast.success(`Removed "${storyTitle}" from favorites`)
            } else {
                toast.error(result.error || "Failed to remove from favorites")
            }
        } catch (error) {
            console.error("Remove bookmark error:", error)
            toast.error("Failed to remove from favorites")
        } finally {
            setRemovingId(null)
        }
    }

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        )
    }

    if (!session) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <div className="text-center space-y-4">
                    <Heart className="w-16 h-16 mx-auto text-muted-foreground" />
                    <h2 className="text-2xl font-bold">Login Required</h2>
                    <p className="text-muted-foreground">Please login to view your favorites</p>
                    <Link href="/login">
                        <Button>Login</Button>
                    </Link>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-background">
            <main className="container mx-auto px-4 md:px-8 py-12">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-2 flex items-center gap-3">
                        <Heart className="w-10 h-10 text-primary fill-current" />
                        My Library
                    </h1>
                    <p className="text-muted-foreground">
                        {bookmarks.length === 0
                            ? "Your favorite manga collection is empty"
                            : `${bookmarks.length} manga in your collection`
                        }
                    </p>
                </div>

                {/* Continue Reading Section */}
                {continueReading.length > 0 && (
                    <div className="mb-12">
                        <div className="mb-6">
                            <h2 className="text-2xl md:text-3xl font-bold tracking-tight flex items-center gap-2">
                                <Play className="w-6 h-6 text-primary" />
                                Continue Reading
                            </h2>
                            <p className="text-muted-foreground mt-1">Pick up where you left off</p>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 animate-slide-up">
                            {continueReading.map((chapter) => (
                                <Link
                                    key={chapter.id}
                                    href={`/read/${chapter.id}?page=${chapter.progress}`}
                                    className="group"
                                >
                                    <div className="bg-card/50 border border-border/50 rounded-xl overflow-hidden hover:border-primary/50 transition-all duration-300 hover:shadow-lg hover:shadow-primary/10">
                                        <div className="flex gap-4 p-4">
                                            <div className="w-20 h-28 flex-shrink-0 rounded-md overflow-hidden bg-muted relative">
                                                {chapter.story?.coverImage ? (
                                                    <Image
                                                        src={chapter.story.coverImage}
                                                        alt={chapter.story.title}
                                                        fill
                                                        sizes="80px"
                                                        className="object-cover"
                                                    />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center bg-secondary">
                                                        <BookOpen className="w-6 h-6 text-muted-foreground" />
                                                    </div>
                                                )}
                                            </div>

                                            <div className="flex-1 min-w-0">
                                                <h3 className="font-semibold line-clamp-1 group-hover:text-primary transition-colors">
                                                    {chapter.story?.title}
                                                </h3>
                                                <p className="text-sm text-muted-foreground">
                                                    Chapter {chapter.number}{chapter.title ? `: ${chapter.title}` : ''}
                                                </p>

                                                {/* Progress Bar */}
                                                <div className="mt-2">
                                                    <ProgressBar
                                                        current={chapter.progress + 1}
                                                        total={chapter.pages.length}
                                                        size="sm"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>
                )}

                {/* Bookmarks Section */}
                <div>
                    <div className="mb-6">
                        <h2 className="text-2xl md:text-3xl font-bold tracking-tight flex items-center gap-2">
                            <Heart className="w-6 h-6 text-primary fill-current" />
                            Favorites
                        </h2>
                        <p className="text-muted-foreground mt-1">Your bookmarked manga</p>
                    </div>

                    {bookmarks.length === 0 ? (
                        <div className="border-2 border-dashed rounded-xl p-12 text-center space-y-4 bg-muted/20">
                            <Heart className="w-16 h-16 mx-auto text-muted-foreground" />
                            <h3 className="text-xl font-semibold">No favorites yet</h3>
                            <p className="text-muted-foreground">
                                Start adding manga to your favorites by clicking the heart icon!
                            </p>
                            <Link href="/">
                                <Button size="lg" className="gap-2">
                                    <BookOpen className="w-5 h-5" />
                                    Browse Manga
                                </Button>
                            </Link>
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6 animate-slide-up">
                            {bookmarks.map((story) => (
                                <div
                                    key={story.id}
                                    className="group space-y-3"
                                >
                                    <Link
                                        href={`/manga/${story.id}`}
                                        className="block"
                                    >
                                        <div className="aspect-[3/4] rounded-xl overflow-hidden bg-muted relative shadow-md group-hover:shadow-xl group-hover:shadow-primary/20 transition-all duration-300">
                                            {story.coverImage ? (
                                                <Image
                                                    src={story.coverImage}
                                                    alt={story.title}
                                                    fill
                                                    sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 20vw"
                                                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center bg-secondary">
                                                    <BookOpen className="w-12 h-12 text-muted-foreground/50" />
                                                </div>
                                            )}

                                            {/* Bookmark Badge */}
                                            <div className="absolute top-2 right-2">
                                                <div className="bg-red-500/90 backdrop-blur-sm rounded-full p-2">
                                                    <Heart className="w-4 h-4 text-white fill-current" />
                                                </div>
                                            </div>

                                            {/* Remove Button - Shows on Hover */}
                                            <button
                                                onClick={(e) => handleRemoveBookmark(e, story.id, story.title)}
                                                disabled={removingId === story.id}
                                                className="absolute top-2 left-2 bg-black/70 hover:bg-red-500/90 backdrop-blur-sm rounded-full p-2 opacity-0 group-hover:opacity-100 transition-all duration-300 disabled:opacity-50"
                                                aria-label="Remove from favorites"
                                            >
                                                {removingId === story.id ? (
                                                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                                                ) : (
                                                    <X className="w-4 h-4 text-white" />
                                                )}
                                            </button>

                                            {/* Hover Overlay - Similar to Homepage */}
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
                                                <Button size="sm" className="w-full gap-2">
                                                    Read Now <ChevronRight className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    </Link>

                                    <div>
                                        <h3 className="font-bold leading-tight line-clamp-1 group-hover:text-primary transition-colors">
                                            {story.title}
                                        </h3>
                                        {story.author && (
                                            <p className="text-xs text-muted-foreground line-clamp-1">
                                                {story.author}
                                            </p>
                                        )}
                                        <p className="text-xs text-muted-foreground mt-1">
                                            {story.chapters?.length || 0} chapters
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </main>
        </div>
    )
}
