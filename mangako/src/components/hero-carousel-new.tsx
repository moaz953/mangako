"use client"

import { useState, useEffect, useCallback } from "react"
import Image from "next/image"
import Link from "next/link"
import { ChevronLeft, ChevronRight, BookOpen, Heart } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Story } from "@/types/models"

interface HeroCarouselProps {
    stories: Story[]
}

export function HeroCarouselNew({ stories }: HeroCarouselProps) {
    const [currentIndex, setCurrentIndex] = useState(0)
    const [isPaused, setIsPaused] = useState(false)

    const featuredStories = stories.slice(0, 5) // Show max 5 stories

    const goToNext = useCallback(() => {
        setCurrentIndex((prevIndex) =>
            prevIndex === featuredStories.length - 1 ? 0 : prevIndex + 1
        )
    }, [featuredStories.length])

    const goToPrevious = () => {
        setCurrentIndex((prevIndex) =>
            prevIndex === 0 ? featuredStories.length - 1 : prevIndex - 1
        )
    }

    const goToSlide = (index: number) => {
        setCurrentIndex(index)
    }

    // Auto-play functionality
    useEffect(() => {
        if (!isPaused && featuredStories.length > 1) {
            const interval = setInterval(() => {
                goToNext()
            }, 5000) // Change slide every 5 seconds

            return () => clearInterval(interval)
        }
    }, [isPaused, goToNext, featuredStories.length])

    if (featuredStories.length === 0) {
        return null
    }

    const currentStory = featuredStories[currentIndex]

    return (
        <div
            className="relative w-full h-[500px] md:h-[600px] rounded-2xl overflow-hidden bg-gradient-to-br from-primary/10 to-purple-600/10"
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
        >
            {/* Background Image with Overlay */}
            <div className="absolute inset-0">
                {currentStory.coverImage ? (
                    <>
                        <Image
                            src={currentStory.coverImage}
                            alt={currentStory.title}
                            fill
                            sizes="100vw"
                            className="object-cover"
                            priority
                        />
                        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-transparent" />
                    </>
                ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/20 to-purple-600/20">
                        <BookOpen className="w-32 h-32 text-muted-foreground/30" />
                    </div>
                )}
            </div>

            {/* Content */}
            <div className="relative h-full container mx-auto px-4 md:px-8 flex items-center">
                <div className="max-w-2xl space-y-6 text-white">
                    {/* Featured Badge */}
                    <Badge className="bg-primary/90 hover:bg-primary text-white border-0">
                        ⭐ Featured
                    </Badge>

                    {/* Title */}
                    <h2 className="text-4xl md:text-6xl font-black tracking-tight leading-tight">
                        {currentStory.title}
                    </h2>

                    {/* Author */}
                    {currentStory.author && (
                        <p className="text-lg md:text-xl text-white/90">
                            by {currentStory.author}
                        </p>
                    )}

                    {/* Description */}
                    {currentStory.description && (
                        <p className="text-base md:text-lg text-white/80 line-clamp-3 max-w-xl">
                            {currentStory.description}
                        </p>
                    )}

                    {/* Stats */}
                    <div className="flex items-center gap-4 text-sm md:text-base text-white/70">
                        <span className="flex items-center gap-1">
                            <BookOpen className="w-4 h-4" />
                            {currentStory.chapters?.length || 0} Chapters
                        </span>
                        {currentStory.status && (
                            <Badge variant="outline" className="border-white/30 text-white">
                                {currentStory.status}
                            </Badge>
                        )}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-3">
                        <Link href={`/manga/${currentStory.id}`}>
                            <Button size="lg" className="gap-2 font-semibold">
                                <BookOpen className="w-5 h-5" />
                                Read Now
                            </Button>
                        </Link>
                        <Button size="lg" variant="secondary" className="gap-2">
                            <Heart className="w-5 h-5" />
                            Add to Favorites
                        </Button>
                    </div>
                </div>
            </div>

            {/* Navigation Arrows */}
            {featuredStories.length > 1 && (
                <>
                    <button
                        onClick={goToPrevious}
                        className="absolute left-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/50 hover:bg-black/70 text-white backdrop-blur-sm transition-all"
                        aria-label="Previous slide"
                    >
                        <ChevronLeft className="w-6 h-6" />
                    </button>
                    <button
                        onClick={goToNext}
                        className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/50 hover:bg-black/70 text-white backdrop-blur-sm transition-all"
                        aria-label="Next slide"
                    >
                        <ChevronRight className="w-6 h-6" />
                    </button>
                </>
            )}

            {/* Dots Indicator */}
            {featuredStories.length > 1 && (
                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2">
                    {featuredStories.map((_, index) => (
                        <button
                            key={index}
                            onClick={() => goToSlide(index)}
                            className={`h-2 rounded-full transition-all ${index === currentIndex
                                    ? "w-8 bg-white"
                                    : "w-2 bg-white/50 hover:bg-white/70"
                                }`}
                            aria-label={`Go to slide ${index + 1}`}
                        />
                    ))}
                </div>
            )}

            {/* Slide Counter */}
            <div className="absolute top-4 right-4 px-3 py-1 rounded-full bg-black/50 backdrop-blur-sm text-white text-sm font-medium">
                {currentIndex + 1} / {featuredStories.length}
            </div>
        </div>
    )
}
