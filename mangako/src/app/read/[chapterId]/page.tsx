"use client"

import { useEffect, useState, Suspense } from "react"
import { useParams, useRouter, useSearchParams } from "next/navigation"
import Image from "next/image"

import { ArrowLeft, ArrowRight, Menu, Loader2 } from "lucide-react"
import Link from "next/link"

import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Paywall } from "@/components/paywall"
import { CoinBalance } from "@/components/coin-balance"
import { StarRating } from "@/components/star-rating"
import { useApp } from "@/lib/store"
import { useSession } from "next-auth/react"
import { updateReadingHistory, getChapterProgress, unlockChapter as unlockChapterAction } from "@/app/actions"
import { toast } from "sonner"
import type { Chapter } from "@/types/models"

interface StoryInfo {
    id: string
    title: string
    coverImage: string | null
}

interface ChapterData {
    id: string
    storyId: string
    number: number
    title?: string | null
    pages: string[]
    releaseDate: string | Date | null
    price: number
    status: string
    story?: StoryInfo
}

function ReaderContent() {
    const params = useParams()
    const router = useRouter()
    const searchParams = useSearchParams()
    const initialPageParam = searchParams.get('page')
    const { data: session, update: updateSession } = useSession()
    // Cast user to include coins
    const user = session?.user as { name?: string | null, email?: string | null, image?: string | null, coins?: number, id: string } | undefined

    // We still use useApp for rating for now, but coins/unlocks should be server-side
    const { rateChapter } = useApp()

    const chapterId = params.chapterId as string
    const [chapter, setChapter] = useState<ChapterData | null>(null)
    const [allChapters, setAllChapters] = useState<Chapter[]>([])
    const [loading, setLoading] = useState(true)
    const [nextChapter, setNextChapter] = useState<Chapter | null>(null)
    const [prevChapter, setPrevChapter] = useState<Chapter | null>(null)

    const [isUnlocked, setIsUnlocked] = useState(false)
    const [userRating, setUserRating] = useState<number>(0)
    const [hasRated, setHasRated] = useState(false)
    const [unlocking, setUnlocking] = useState(false)

    // Load chapter data from API
    useEffect(() => {
        const loadChapter = async () => {
            try {
                setLoading(true)

                // Fetch the specific chapter
                const chapterRes = await fetch(`/api/chapters?id=${chapterId}`)
                if (!chapterRes.ok) {
                    toast.error("Failed to load chapter")
                    return
                }

                const chapterData: Chapter = await chapterRes.json()

                // Fetch story info
                const storyRes = await fetch(`/api/stories?id=${chapterData.storyId}`)
                const storyData = storyRes.ok ? await storyRes.json() : null

                setChapter({
                    ...chapterData,
                    story: storyData ? {
                        id: storyData.id,
                        title: storyData.title,
                        coverImage: storyData.coverImage
                    } : undefined
                })

                // Fetch all chapters from the same story for navigation
                const allChaptersRes = await fetch(`/api/chapters?storyId=${chapterData.storyId}`)
                if (allChaptersRes.ok) {
                    const allChaptersData: Chapter[] = await allChaptersRes.json()
                    const sortedChapters = allChaptersData
                        .filter(c => c.status === 'published')
                        .sort((a, b) => a.number - b.number)

                    setAllChapters(sortedChapters)

                    // Find next and previous chapters
                    const currentIndex = sortedChapters.findIndex(c => c.id === chapterId)
                    if (currentIndex > 0) {
                        setPrevChapter(sortedChapters[currentIndex - 1])
                    }
                    if (currentIndex < sortedChapters.length - 1) {
                        setNextChapter(sortedChapters[currentIndex + 1])
                    }
                }

            } catch (_error) {
                console.error("Failed to load chapter:", _error)
                toast.error("Failed to load chapter")
            } finally {
                setLoading(false)
            }
        }

        loadChapter()
    }, [chapterId])

    useEffect(() => {
        if (chapter) {
            // Check if unlocked
            // Note: In a real app, we should check this from the server side or passed props
            // For now, we rely on the initial check from the server or if price is 0
            const unlocked = chapter.price === 0 || isUnlocked // We'll update isUnlocked from server check later if needed
            if (chapter.price === 0) setIsUnlocked(true)

            // Check if user has already rated this chapter
            const ratedChapters = JSON.parse(localStorage.getItem("ratedChapters") || "{}")
            if (ratedChapters[chapter.id]) {
                setHasRated(true)
                setUserRating(ratedChapters[chapter.id])
            }

            // Track reading progress
            if (session?.user?.id) {
                updateReadingHistory(session.user.id, chapter.id, 0)
            }
        }
    }, [chapter, session])

    // Restore scroll position
    useEffect(() => {
        const restoreProgress = async () => {
            if (session?.user?.id && chapter && isUnlocked) {
                let targetPage = 0

                if (initialPageParam) {
                    targetPage = parseInt(initialPageParam)
                } else {
                    const { progress } = await getChapterProgress(session.user.id, chapter.id)
                    targetPage = progress
                }

                if (targetPage > 0) {
                    setTimeout(() => {
                        const totalPages = chapter.pages.length
                        const scrollPercentage = targetPage / totalPages
                        const documentHeight = document.documentElement.scrollHeight
                        const scrollPosition = scrollPercentage * documentHeight

                        window.scrollTo({
                            top: scrollPosition,
                            behavior: 'smooth'
                        })

                        if (!initialPageParam) {
                            toast.success(`Resumed at page ${targetPage + 1}`)
                        }
                    }, 500)
                }
            }
        }

        restoreProgress()
    }, [session, chapter, isUnlocked, initialPageParam])

    // Track scroll progress
    useEffect(() => {
        if (!session?.user?.id || !chapter || !isUnlocked) return

        const handleScroll = () => {
            const scrollPosition = window.scrollY + window.innerHeight
            const documentHeight = document.documentElement.scrollHeight
            const scrollPercentage = scrollPosition / documentHeight

            const totalPages = chapter.pages.length
            const currentPage = Math.min(
                Math.floor(scrollPercentage * totalPages),
                totalPages - 1
            )

            if (currentPage > 0) {
                updateReadingHistory(session.user.id, chapter.id, currentPage)
            }
        }

        window.addEventListener('scroll', handleScroll)
        return () => window.removeEventListener('scroll', handleScroll)
    }, [session, chapter, isUnlocked])

    const handleRate = (rating: number) => {
        if (!hasRated && chapter) {
            rateChapter(chapter.id, rating)
            setUserRating(rating)
            setHasRated(true)

            const ratedChapters = JSON.parse(localStorage.getItem("ratedChapters") || "{}")
            ratedChapters[chapter.id] = rating
            localStorage.setItem("ratedChapters", JSON.stringify(ratedChapters))
        }
    }

    const handleUnlock = async () => {
        if (!chapter || !user) {
            toast.error("Please login to unlock chapters")
            router.push("/login")
            return
        }

        if ((user.coins || 0) < chapter.price) {
            toast.error("Insufficient coins. Please purchase more.")
            router.push("/shop")
            return
        }

        setUnlocking(true)
        try {
            const result = await unlockChapterAction(chapter.id)
            if (result.success) {
                toast.success("Chapter unlocked!")
                setIsUnlocked(true)
                // Update session to reflect new coin balance
                await updateSession()
            } else {
                toast.error(result.error || "Failed to unlock chapter")
            }
        } catch (_error) {
            console.error(_error)
            toast.error("An error occurred")
        } finally {
            setUnlocking(false)
        }
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-black text-white flex items-center justify-center">
                <div className="text-center">
                    <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4 text-primary" />
                    <p className="text-muted-foreground">Loading chapter...</p>
                </div>
            </div>
        )
    }

    if (!chapter) {
        return (
            <div className="min-h-screen bg-black text-white flex items-center justify-center">
                <div className="text-center">
                    <p className="text-xl mb-4">Chapter not found</p>
                    <Link href="/">
                        <Button>Go Home</Button>
                    </Link>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-black text-white flex flex-col">
            {/* Top Bar */}
            <header className="sticky top-0 z-50 flex items-center justify-between p-4 bg-black/80 backdrop-blur-md border-b border-white/10">
                <div className="flex items-center gap-4">
                    <Link href="/">
                        <Button variant="ghost" size="icon" className="text-white hover:bg-white/10">
                            <ArrowLeft className="w-5 h-5" />
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-sm font-bold text-white/90">{chapter.story?.title || "Unknown Story"}</h1>
                        <div className="flex items-center gap-2">
                            <p className="text-xs text-white/50">Chapter {chapter.number}: {chapter.title}</p>
                            {chapter.releaseDate && (
                                <>
                                    <span className="text-white/30">•</span>
                                    <span className="text-xs text-white/40">
                                        {new Date(chapter.releaseDate).toLocaleDateString()}
                                    </span>
                                </>
                            )}
                            {chapter.releaseDate && new Date(chapter.releaseDate) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) && (
                                <span className="text-xs bg-primary/20 text-primary px-2 py-0.5 rounded-full font-semibold">NEW</span>
                            )}
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <CoinBalance balance={user?.coins || 0} />

                    <Sheet>
                        <SheetTrigger asChild>
                            <Button variant="ghost" size="icon" className="text-white hover:bg-white/10">
                                <Menu className="w-5 h-5" />
                            </Button>
                        </SheetTrigger>
                        <SheetContent side="right" className="bg-zinc-900 border-l-zinc-800 text-white">
                            <div className="py-4">
                                <h2 className="text-lg font-bold mb-4">Chapters</h2>
                                <ScrollArea className="h-[calc(100vh-100px)]">
                                    <div className="space-y-2">
                                        {allChapters.map((c) => (
                                            <Link key={c.id} href={`/read/${c.id}`}>
                                                <div className={`p-3 rounded-lg transition-colors ${c.id === chapterId
                                                    ? "bg-primary text-primary-foreground"
                                                    : "hover:bg-white/5 text-zinc-400"
                                                    }`}>
                                                    <div className="flex justify-between items-center">
                                                        <span className="text-sm font-medium">Chapter {c.number}</span>
                                                        {c.price > 0 && !isUnlocked && c.id !== chapterId && ( // Simplified check
                                                            <span className="text-xs bg-zinc-800 px-1.5 py-0.5 rounded text-zinc-500">Locked</span>
                                                        )}
                                                    </div>
                                                    <p className="text-xs opacity-70 truncate">{c.title || `Chapter ${c.number}`}</p>
                                                </div>
                                            </Link>
                                        ))}
                                    </div>
                                </ScrollArea>
                            </div>
                        </SheetContent>
                    </Sheet>
                </div>
            </header>

            {/* Reader Content */}
            <main className="flex-1 max-w-3xl mx-auto w-full">
                {isUnlocked ? (
                    <div className="flex flex-col">
                        {chapter.pages.map((page, index) => (
                            <div key={index} className="w-full relative bg-zinc-900 mb-1">
                                {page.startsWith('data:') ? (
                                    <img
                                        src={page}
                                        alt={`Page ${index + 1}`}
                                        className="w-full h-auto"
                                        loading="lazy"
                                    />
                                ) : (
                                    <Image
                                        src={page}
                                        alt={`Page ${index + 1}`}
                                        width={800}
                                        height={1200}
                                        className="w-full h-auto"
                                        loading="lazy"
                                        unoptimized={page.includes('supabase.co')}
                                    />
                                )}
                            </div>
                        ))}

                        {/* Navigation Footer */}
                        <div className="p-8 flex flex-col items-center gap-6 pb-20">
                            {/* Rating Section */}
                            <div className="w-full max-w-md bg-zinc-900/50 border border-zinc-800 rounded-lg p-6 mb-4">
                                <div className="text-center space-y-4">
                                    <h3 className="text-lg font-bold">Rate this Chapter</h3>

                                    <div className="flex flex-col items-center gap-3">
                                        <StarRating
                                            rating={userRating}
                                            onRate={handleRate}
                                            readonly={hasRated}
                                            size="lg"
                                        />
                                        {hasRated && (
                                            <p className="text-sm text-green-500">Thanks for rating!</p>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <p className="text-zinc-500 text-sm">End of Chapter {chapter.number}</p>
                            <div className="flex gap-4 w-full justify-center">
                                {prevChapter && (
                                    <Link href={`/read/${prevChapter.id}`}>
                                        <Button variant="outline" className="w-32 border-zinc-700 text-zinc-300 hover:bg-zinc-800 hover:text-white">
                                            Previous
                                        </Button>
                                    </Link>
                                )}
                                {nextChapter ? (
                                    <Link href={`/read/${nextChapter.id}`}>
                                        <Button className="w-32 bg-primary text-primary-foreground hover:bg-primary/90">
                                            Next
                                            <ArrowRight className="ml-2 w-4 h-4" />
                                        </Button>
                                    </Link>
                                ) : (
                                    <Button disabled className="w-32">No More</Button>
                                )}
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="flex-1 flex items-center justify-center min-h-[60vh]">
                        <Paywall
                            chapterTitle={chapter.title}
                            price={chapter.price}
                            isUnlocking={unlocking}
                            onUnlock={handleUnlock}
                        />
                    </div>
                )}
            </main>
        </div>
    )
}

export default function ReaderPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-black text-white flex items-center justify-center">
                <div className="text-center">
                    <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4 text-primary" />
                    <p className="text-muted-foreground">Loading chapter...</p>
                </div>
            </div>
        }>
            <ReaderContent />
        </Suspense>
    )
}
