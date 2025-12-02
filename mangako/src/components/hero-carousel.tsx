"use client"

import { useState, useEffect, useCallback } from "react"
import { ChevronLeft, ChevronRight, Play, Info } from "lucide-react"
import { Button } from "@/components/ui/button"

// Mock data for featured slides
const FEATURED_SLIDES = [
    {
        id: 1,
        title: "Solo Leveling",
        subtitle: "The Weakest Hunter of All Mankind",
        description: "In a world where hunters, humans who possess magical abilities, must battle deadly monsters to protect the human race from certain annihilation.",
        gradient: "from-blue-600 via-blue-700 to-purple-800",
        genre: "Action"
    },
    {
        id: 2,
        title: "Tower of God",
        subtitle: "What do you desire?",
        description: "Reach the top, and everything will be yours. At the top of the tower exists everything in this world, and all of it can be yours.",
        gradient: "from-red-600 via-orange-600 to-yellow-700",
        genre: "Fantasy"
    },
    {
        id: 3,
        title: "The Beginning After The End",
        subtitle: "A New Life, A New Destiny",
        description: "King Grey has unrivaled strength, wealth, and prestige in a world governed by martial ability. However, solitude lingers closely behind those with great power.",
        gradient: "from-purple-600 via-pink-600 to-red-700",
        genre: "Adventure"
    }
]

export function HeroCarousel() {
    const [currentIndex, setCurrentIndex] = useState(0)
    const [isTransitioning, setIsTransitioning] = useState(false)

    const nextSlide = useCallback(() => {
        if (isTransitioning) return
        setIsTransitioning(true)
        setCurrentIndex((prev) => (prev + 1) % FEATURED_SLIDES.length)
        setTimeout(() => setIsTransitioning(false), 600)
    }, [isTransitioning])

    const prevSlide = () => {
        if (isTransitioning) return
        setIsTransitioning(true)
        setCurrentIndex((prev) => (prev - 1 + FEATURED_SLIDES.length) % FEATURED_SLIDES.length)
        setTimeout(() => setIsTransitioning(false), 600)
    }

    useEffect(() => {
        const timer = setInterval(() => {
            nextSlide()
        }, 5000)
        return () => clearInterval(timer)
    }, [currentIndex, nextSlide])

    const goToSlide = (index: number) => {
        if (isTransitioning || index === currentIndex) return
        setIsTransitioning(true)
        setCurrentIndex(index)
        setTimeout(() => setIsTransitioning(false), 600)
    }

    return (
        <>
            <style jsx>{`
                @keyframes slideIn {
                    from {
                        opacity: 0;
                        transform: translateY(30px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
                
                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }

                .slide-content {
                    animation: fadeIn 0.6s ease-out;
                }

                .slide-text {
                    animation: slideIn 0.6s ease-out;
                }

                .slide-text:nth-child(1) { animation-delay: 0.1s; }
                .slide-text:nth-child(2) { animation-delay: 0.2s; }
                .slide-text:nth-child(3) { animation-delay: 0.3s; }
                .slide-text:nth-child(4) { animation-delay: 0.4s; }
                .slide-text:nth-child(5) { animation-delay: 0.5s; }
            `}</style>

            <div className="relative h-[500px] w-full overflow-hidden">
                {/* Slide */}
                <div className="absolute inset-0 w-full h-full slide-content">
                    {/* Gradient Background */}
                    <div className={`absolute inset-0 bg-gradient-to-br ${FEATURED_SLIDES[currentIndex].gradient} transition-all duration-1000`} />

                    {/* Animated Pattern Overlay */}
                    <div className="absolute inset-0 opacity-10">
                        <div className="absolute inset-0" style={{
                            backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
                            backgroundSize: '40px 40px'
                        }} />
                    </div>

                    {/* Bottom Fade */}
                    <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />

                    {/* Content */}
                    <div className="absolute inset-0 flex items-center">
                        <div className="container mx-auto px-4 md:px-8">
                            <div className="max-w-2xl space-y-4">
                                <div className="slide-text inline-block px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-sm font-medium text-white">
                                    {FEATURED_SLIDES[currentIndex].genre}
                                </div>

                                <h1 className="slide-text text-5xl md:text-7xl font-black text-white tracking-tight">
                                    {FEATURED_SLIDES[currentIndex].title}
                                </h1>

                                <p className="slide-text text-xl md:text-2xl text-white/90 font-light">
                                    {FEATURED_SLIDES[currentIndex].subtitle}
                                </p>

                                <p className="slide-text text-white/70 line-clamp-3 max-w-xl text-lg">
                                    {FEATURED_SLIDES[currentIndex].description}
                                </p>

                                <div className="slide-text flex gap-4 pt-4">
                                    <Button size="lg" className="bg-white text-black hover:bg-white/90 rounded-full px-8 h-12 text-lg font-semibold transition-transform hover:scale-105">
                                        <Play className="w-5 h-5 mr-2 fill-current" />
                                        Read Now
                                    </Button>
                                    <Button size="lg" variant="outline" className="bg-white/10 hover:bg-white/20 border-white/30 text-white rounded-full px-8 h-12 text-lg backdrop-blur-sm transition-transform hover:scale-105">
                                        <Info className="w-5 h-5 mr-2" />
                                        More Info
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Navigation Buttons */}
                <div className="absolute bottom-8 right-8 flex gap-2 z-10">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={prevSlide}
                        disabled={isTransitioning}
                        className="rounded-full bg-black/30 hover:bg-black/50 text-white backdrop-blur-sm border border-white/10 transition-all hover:scale-110"
                    >
                        <ChevronLeft className="w-6 h-6" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={nextSlide}
                        disabled={isTransitioning}
                        className="rounded-full bg-black/30 hover:bg-black/50 text-white backdrop-blur-sm border border-white/10 transition-all hover:scale-110"
                    >
                        <ChevronRight className="w-6 h-6" />
                    </Button>
                </div>

                {/* Indicators */}
                <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-2 z-10">
                    {FEATURED_SLIDES.map((_, index) => (
                        <button
                            key={index}
                            onClick={() => goToSlide(index)}
                            disabled={isTransitioning}
                            className={`h-1 rounded-full transition-all duration-300 ${index === currentIndex ? "w-8 bg-white" : "w-2 bg-white/50 hover:bg-white/80"
                                }`}
                        />
                    ))}
                </div>
            </div>
        </>
    )
}
