"use client"

import { Star, TrendingUp, Eye } from "lucide-react"
import Link from "next/link"

interface Manga {
    id: string
    title: string
    genre: string
    gradient: string
    rating: string
    views: string
    rank?: number
}

interface MangaGridProps {
    title: string
    items: Manga[]
    showRank?: boolean
}

export function MangaGrid({ title, items, showRank = false }: MangaGridProps) {
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-2xl md:text-3xl font-bold tracking-tight flex items-center gap-2">
                    {title}
                    {showRank && <TrendingUp className="w-6 h-6 text-primary" />}
                </h2>
                <Link href="#" className="text-sm text-primary hover:underline font-medium">
                    View All
                </Link>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-x-4 gap-y-8">
                {items.map((manga, index) => (
                    <div
                        key={manga.id}
                        className="opacity-0 animate-fade-in"
                        style={{ animationDelay: `${index * 0.05}s`, animationFillMode: 'forwards' }}
                    >
                        <Link href={`/manga/${manga.id}`} className="group block space-y-3 relative">
                            {showRank && manga.rank !== undefined && (
                                <div className="absolute -left-2 -top-2 z-10 w-9 h-9 flex items-center justify-center bg-primary text-primary-foreground font-bold text-lg rounded-full shadow-lg border-2 border-background">
                                    {manga.rank}
                                </div>
                            )}

                            <div className="relative aspect-[3/4] overflow-hidden rounded-xl bg-gradient-to-br shadow-md group-hover:shadow-xl transition-all duration-300">
                                <div className={`absolute inset-0 bg-gradient-to-br ${manga.gradient}`} />

                                {/* Animated Overlay */}
                                <div className="absolute inset-0 opacity-30 group-hover:opacity-40 transition-opacity">
                                    <div className="absolute inset-0" style={{
                                        backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.1) 1px, transparent 1px)',
                                        backgroundSize: '30px 30px'
                                    }} />
                                </div>

                                {/* Center Title */}
                                <div className="absolute inset-0 flex items-center justify-center p-4">
                                    <p className="text-white font-bold text-center leading-tight drop-shadow-lg line-clamp-3">
                                        {manga.title}
                                    </p>
                                </div>

                                {/* Hover Info */}
                                <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/90 via-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                                    <div className="flex items-center justify-between text-white text-xs font-medium">
                                        <span className="flex items-center gap-1">
                                            <Star className="w-3 h-3 text-yellow-400 fill-current" />
                                            {manga.rating}
                                        </span>
                                        <span className="flex items-center gap-1">
                                            <Eye className="w-3 h-3" />
                                            {manga.views}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-1">
                                <h3 className="font-semibold leading-tight line-clamp-2 group-hover:text-primary transition-colors text-sm">
                                    {manga.title}
                                </h3>
                                <p className="text-xs text-muted-foreground">{manga.genre}</p>
                            </div>
                        </Link>
                    </div>
                ))}
            </div>
        </div>
    )
}
