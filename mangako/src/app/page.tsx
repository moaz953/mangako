"use client"

import { useEffect, useState, useMemo } from "react"
import Link from "next/link"
import Image from "next/image"
import { useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { BookOpen, Clock, ChevronRight, Play, Heart } from "lucide-react"
import { ProgressBar } from "@/components/progress-bar"
import { Badge } from "@/components/ui/badge"
import { HeroCarouselNew } from "@/components/hero-carousel-new"
import { HeroCarouselSkeleton } from "@/components/skeletons/hero-carousel-skeleton"
import { MangaGridSkeleton } from "@/components/skeletons/manga-card-skeleton"
import { ChapterListSkeleton } from "@/components/skeletons/chapter-card-skeleton"
import { ContinueReadingListSkeleton } from "@/components/skeletons/continue-reading-skeleton"
import { SearchBar } from "@/components/search-bar"
import { FilterPanel, type FilterOptions } from "@/components/filter-panel"
import { LiveStats } from "@/components/live-stats"
import { getContinueReading, getBookmarks, addBookmark, removeBookmark } from "./actions"
import { Story, Chapter, ContinueReadingItem } from "@/types/models"
import { toast } from "sonner"
import { FloatingElements } from "@/components/floating-elements"

export default function Home() {
  const { data: session } = useSession()
  const [stories, setStories] = useState<Story[]>([])
  const [latestChapters, setLatestChapters] = useState<(Chapter & { storyTitle: string; storyImage: string | null })[]>([])
  const [continueReading, setContinueReading] = useState<ContinueReadingItem[]>([])
  const [bookmarkedStoryIds, setBookmarkedStoryIds] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [latestFilter, setLatestFilter] = useState<"all" | "today" | "week" | "month">("all")
  const [filters, setFilters] = useState<FilterOptions>({
    status: "all",
    sortBy: "newest",
    viewMode: "grid"
  })

  // Filter latest chapters based on time period
  const filteredLatestChapters = useMemo(() => {
    if (latestFilter === "all") return latestChapters

    const now = new Date()
    const filterDate = new Date()

    switch (latestFilter) {
      case "today":
        filterDate.setHours(0, 0, 0, 0)
        break
      case "week":
        filterDate.setDate(now.getDate() - 7)
        break
      case "month":
        filterDate.setMonth(now.getMonth() - 1)
        break
    }

    return latestChapters.filter(chapter =>
      new Date(chapter.releaseDate) >= filterDate
    )
  }, [latestChapters, latestFilter])

  // Filter and search stories
  const filteredStories = useMemo(() => {
    let result = [...stories]

    // Apply search
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      result = result.filter(story =>
        story.title.toLowerCase().includes(query) ||
        story.author?.toLowerCase().includes(query) ||
        story.description?.toLowerCase().includes(query)
      )
    }

    // Apply status filter
    if (filters.status !== "all") {
      if (filters.status === "ongoing") {
        result = result.filter(story => story.status === "published" || story.status === "draft")
      } else if (filters.status === "completed") {
        result = result.filter(story => {
          // Since there's no "completed" status in the Story model yet,
          // we'll treat stories as completed if they have chapters and are published
          // This is a placeholder until the model is updated
          return story.status === "published"
        })
      }
    }

    // Apply sorting
    switch (filters.sortBy) {
      case "newest":
        result.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime())
        break
      case "oldest":
        result.sort((a, b) => new Date(a.createdAt || 0).getTime() - new Date(b.createdAt || 0).getTime())
        break
      case "popular":
        // For now, sort by chapter count as a proxy for popularity
        result.sort((a, b) => (b.chapters?.length || 0) - (a.chapters?.length || 0))
        break
      case "rated":
        // Placeholder for when rating system is implemented
        break
    }

    return result
  }, [stories, searchQuery, filters])

  useEffect(() => {
    const loadData = async () => {
      try {
        const [storiesRes, chaptersRes] = await Promise.all([
          fetch('/api/stories'),
          fetch('/api/chapters')
        ])

        if (storiesRes.ok && chaptersRes.ok) {
          const storiesData = await storiesRes.json()
          const chaptersData = await chaptersRes.json()

          // Process Stories
          const publishedStories = storiesData.filter((s: Story) => s.status === 'published')
          setStories(publishedStories)

          // Process Latest Chapters
          const publishedChapters = chaptersData.filter((c: Chapter) => c.status === 'published')

          // Sort by release date (newest first)
          const sortedChapters = publishedChapters.sort((a: Chapter, b: Chapter) =>
            new Date(b.releaseDate).getTime() - new Date(a.releaseDate).getTime()
          )

          // Map chapters to include story info
          const recentChapters = sortedChapters.slice(0, 8).map((chapter: Chapter) => {
            const story = storiesData.find((s: Story) => s.id === chapter.storyId)
            return {
              ...chapter,
              storyTitle: story?.title || "Unknown Story",
              storyImage: story?.coverImage || null
            }
          })

          setLatestChapters(recentChapters)

          // Load continue reading for logged-in users
          if (session?.user?.id) {
            const continueData = await getContinueReading(session.user.id, 6)
            setContinueReading(continueData)

            const bookmarks = await getBookmarks(session.user.id)
            const bookmarkedStories = bookmarks as Array<{ id: string }>
            setBookmarkedStoryIds(new Set(bookmarkedStories.map((b) => b.id)))
          }
        }
      } catch (_error) {
        console.error("Failed to load data:", error)
      }
      setLoading(false)
    }
    loadData()
  }, [session])

  const handleBookmarkToggle = async (e: React.MouseEvent, storyId: string) => {
    e.preventDefault() // Prevent navigation
    e.stopPropagation()

    if (!session?.user?.id) {
      toast.error("Please login to bookmark")
      return
    }

    const isBookmarked = bookmarkedStoryIds.has(storyId)

    // Optimistic update
    const newBookmarks = new Set(bookmarkedStoryIds)
    if (isBookmarked) {
      newBookmarks.delete(storyId)
    } else {
      newBookmarks.add(storyId)
    }
    setBookmarkedStoryIds(newBookmarks)

    try {
      const result = isBookmarked
        ? await removeBookmark(storyId)
        : await addBookmark(storyId)

      if (!result.success) {
        // Revert on error
        setBookmarkedStoryIds(bookmarkedStoryIds)
        toast.error(result.error || "Failed to update bookmark")
      } else {
        toast.success(isBookmarked ? "Removed from favorites" : "Added to favorites")
      }
    } catch (_error) {
      console.error("Bookmark error:", error)
      // Revert on error
      setBookmarkedStoryIds(bookmarkedStoryIds)
      toast.error("Failed to update bookmark")
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        {/* Hero Skeleton */}
        <div className="container mx-auto px-4 md:px-8 py-8 md:py-12">
          <HeroCarouselSkeleton />
        </div>

        {/* Continue Reading Skeleton (for logged-in users placeholder) */}
        <div className="container mx-auto px-4 md:px-8 pb-12">
          <div className="mb-6">
            <div className="h-8 w-48 bg-muted rounded animate-pulse mb-2" />
            <div className="h-5 w-64 bg-muted rounded animate-pulse" />
          </div>
          <ContinueReadingListSkeleton count={3} />
        </div>

        <main className="container mx-auto px-4 md:px-8 py-8 space-y-16">
          {/* Latest Updates Skeleton */}
          <section className="space-y-6">
            <div className="h-8 w-48 bg-muted rounded animate-pulse" />
            <ChapterListSkeleton count={8} />
          </section>

          {/* All Manga Skeleton */}
          <section className="space-y-6">
            <div className="h-8 w-32 bg-muted rounded animate-pulse" />
            <MangaGridSkeleton count={10} />
          </section>
        </main>
      </div>
    )
  }



  return (
    <div className="min-h-screen bg-background">
      {/* Hero Carousel Section with Enhanced Background */}
      <div className="relative overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0 bg-gradient-manga-vibrant opacity-5" />
        <div className="absolute inset-0 bg-grid-pattern opacity-[0.03]" />
        <FloatingElements />

        <div className="container mx-auto px-4 md:px-8 py-8 md:py-12 relative z-10">
          <HeroCarouselNew stories={stories} />
        </div>
      </div>

      {/* Live Statistics */}
      <div className="container mx-auto px-4 md:px-8 pb-12">
        <LiveStats
          totalStories={stories.length}
          totalChapters={latestChapters.length}
          totalReaders={1250} // Placeholder
          newThisWeek={latestChapters.filter(c => {
            const weekAgo = new Date()
            weekAgo.setDate(weekAgo.getDate() - 7)
            return new Date(c.releaseDate) > weekAgo
          }).length}
        />
      </div>

      {/* Continue Reading Section */}
      {session && continueReading.length > 0 && (
        <div className="container mx-auto px-4 md:px-8 pb-12">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold tracking-tight flex items-center gap-2">
                <Play className="w-6 h-6 text-primary animate-float" />
                <span className="text-gradient-manga">Continue Reading</span>
              </h2>
              <p className="text-muted-foreground mt-1">Pick up where you left off</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {continueReading.map((chapter) => (
              <Link
                key={chapter.id}
                href={`/read/${chapter.id}`}
                className="group"
              >
                <div className="bg-card/50 border border-border/50 rounded-xl overflow-hidden hover:border-primary/50 transition-all duration-300 hover-glow">
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
                        Chapter {chapter.number}: {chapter.title}
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

      <main className="container mx-auto px-4 md:px-8 py-8 space-y-16">

        {/* Latest Updates Section */}
        {latestChapters.length > 0 && (
          <section className="space-y-6 animate-slide-up" id="latest">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h2 className="text-2xl font-bold flex items-center gap-2">
                  <Clock className="w-6 h-6 text-primary" />
                  <span className="text-gradient-manga">Latest Updates</span>
                </h2>
                <p className="text-sm text-muted-foreground mt-1">
                  {filteredLatestChapters.length} chapter{filteredLatestChapters.length !== 1 ? 's' : ''} released
                </p>
              </div>

              {/* Time Filter Tabs */}
              <div className="flex gap-2 flex-wrap">
                {[
                  { value: "all", label: "All" },
                  { value: "today", label: "Today" },
                  { value: "week", label: "This Week" },
                  { value: "month", label: "This Month" }
                ].map(tab => (
                  <Button
                    key={tab.value}
                    variant={latestFilter === tab.value ? "default" : "outline"}
                    size="sm"
                    onClick={() => setLatestFilter(tab.value as "all" | "today" | "week" | "month")}
                  >
                    {tab.label}
                  </Button>
                ))}
              </div>
            </div>

            {filteredLatestChapters.length === 0 ? (
              <div className="border-2 border-dashed rounded-xl p-12 text-center bg-muted/20">
                <Clock className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No chapters released in this period</p>
                <Button
                  variant="outline"
                  className="mt-4"
                  onClick={() => setLatestFilter("all")}
                >
                  View All Updates
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {filteredLatestChapters.map((chapter, index) => (
                  <Link
                    key={chapter.id}
                    href={`/read/${chapter.id}`}
                    className="group relative bg-card/50 border border-border/50 rounded-xl overflow-hidden hover:border-primary/50 transition-all duration-300 hover:shadow-lg hover:shadow-primary/10"
                  >
                    <div className="flex gap-4 p-3">
                      <div className="w-16 h-24 flex-shrink-0 rounded-md overflow-hidden bg-muted relative">
                        {chapter.storyImage ? (
                          <Image
                            src={chapter.storyImage}
                            alt={chapter.storyTitle}
                            fill
                            sizes="64px"
                            className="object-cover group-hover:scale-110 transition-transform duration-500"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-secondary">
                            <BookOpen className="w-6 h-6 text-muted-foreground" />
                          </div>
                        )}
                      </div>

                      <div className="flex flex-col justify-between py-1 min-w-0">
                        <div>
                          <h3 className="font-bold truncate group-hover:text-primary transition-colors">
                            {chapter.storyTitle}
                          </h3>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="secondary" className="text-xs font-normal">
                              Chapter {chapter.number}
                            </Badge>
                            {index < 3 && (
                              <Badge className="text-[10px] px-1.5 h-5 bg-red-500 hover:bg-red-600">NEW</Badge>
                            )}
                          </div>
                        </div>
                        <p className="text-xs text-muted-foreground truncate">
                          {chapter.title || `Chapter ${chapter.number}`}
                        </p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </section>
        )}

        {/* All Manga Grid */}
        <section className="space-y-6 animate-slide-up" style={{ animationDelay: '0.1s' }} id="all-manga">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold flex items-center gap-2">
                <BookOpen className="w-6 h-6 text-primary" />
                <span className="text-gradient-manga">All Manga</span>
              </h2>
              <p className="text-sm text-muted-foreground mt-1">
                {searchQuery || filters.status !== "all" || filters.sortBy !== "newest"
                  ? `${filteredStories.length} result${filteredStories.length !== 1 ? 's' : ''}`
                  : `${stories.length} manga available`}
              </p>
            </div>
          </div>

          {/* Search and Filter Bar */}
          <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
            <SearchBar
              onSearch={setSearchQuery}
              placeholder="Search manga by title, author, or description..."
            />
            <FilterPanel
              filters={filters}
              onFilterChange={setFilters}
            />
          </div>

          {filteredStories.length === 0 ? (
            <div className="border-2 border-dashed rounded-xl p-12 text-center space-y-4 bg-muted/20">
              {searchQuery || filters.status !== "all" ? (
                <>
                  <BookOpen className="w-16 h-16 mx-auto text-muted-foreground" />
                  <p className="text-lg font-semibold">No manga found</p>
                  <p className="text-muted-foreground">Try adjusting your search or filters</p>
                  <Button
                    onClick={() => {
                      setSearchQuery("")
                      setFilters({ status: "all", sortBy: "newest", viewMode: "grid" })
                    }}
                  >
                    Clear Search & Filters
                  </Button>
                </>
              ) : (
                <p className="text-muted-foreground">No manga published yet.</p>
              )}
            </div>
          ) : (
            <div className={filters.viewMode === "grid"
              ? "grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6"
              : "grid grid-cols-1 gap-4"}>
              {filteredStories.map((story, index) => (
                <Link
                  key={story.id}
                  href={`/manga/${story.id}`}
                  className="group space-y-3"
                >
                  <div className="aspect-[3/4] rounded-xl overflow-hidden bg-muted relative shadow-md group-hover:shadow-xl group-hover:shadow-primary/20 transition-all duration-300 hover-glow">
                    {story.coverImage ? (
                      <Image
                        src={story.coverImage}
                        alt={story.title}
                        fill
                        sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 20vw"
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                        priority={index < 5}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-secondary">
                        <BookOpen className="w-12 h-12 text-muted-foreground/50" />
                      </div>
                    )}

                    {/* Hover Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
                      <div className="flex gap-2">
                        <Button size="sm" className="flex-1 gap-2">
                          Read Now <ChevronRight className="w-4 h-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="secondary"
                          className="h-9 w-9 shrink-0"
                          onClick={(e) => handleBookmarkToggle(e, story.id)}
                        >
                          <Heart className={`w-4 h-4 ${bookmarkedStoryIds.has(story.id) ? "fill-red-500 text-red-500" : ""}`} />
                        </Button>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-bold leading-tight line-clamp-1 group-hover:text-primary transition-colors">
                      {story.title}
                    </h3>
                    {story.author && (
                      <p className="text-xs text-muted-foreground line-clamp-1">
                        {story.author}
                      </p>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>

      </main>
    </div>
  )
}
