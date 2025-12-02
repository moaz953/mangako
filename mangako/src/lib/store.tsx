"use client"

import React, { createContext, useContext, useState, useEffect } from "react"
import { Chapter, mangaData } from "@/lib/data"

interface AppState {
    coins: number
    unlockedChapters: string[]
    chapters: Chapter[]
    addCoins: (amount: number) => void
    unlockChapter: (chapterId: string) => boolean
    addChapter: (chapter: Chapter) => void
    deleteChapter: (chapterId: string) => void
    rateChapter: (chapterId: string, rating: number) => void
}

const AppContext = createContext<AppState | undefined>(undefined)

export function AppProvider({ children }: { children: React.ReactNode }) {
    const [coins, setCoins] = useState(0)
    const [unlockedChapters, setUnlockedChapters] = useState<string[]>(["1", "2", "3"])
    const [chapters, setChapters] = useState<Chapter[]>(mangaData.chapters)

    // Load from local storage and server on mount
    useEffect(() => {
        const loadData = async () => {
            const savedCoins = localStorage.getItem("mangako-coins")
            const savedUnlocked = localStorage.getItem("mangako-chapters")

            if (savedCoins) setCoins(parseInt(savedCoins))
            if (savedUnlocked) setUnlockedChapters(JSON.parse(savedUnlocked))

            // Load chapters from server
            try {
                const response = await fetch('/api/chapters')
                if (response.ok) {
                    const serverChapters = await response.json()
                    // Filter only published chapters for readers
                    const publishedChapters = serverChapters.filter((ch: Chapter) => ch.status === 'published')
                    if (publishedChapters.length > 0) {
                        setChapters(publishedChapters)
                    } else {
                        // Fallback to default data if no published chapters
                        setChapters(mangaData.chapters)
                    }
                } else {
                    setChapters(mangaData.chapters)
                }
            } catch (error) {
                console.error("Failed to load chapters:", error)
                setChapters(mangaData.chapters)
            }
        }
        loadData()
    }, [])

    // Save to local storage on change
    useEffect(() => {
        localStorage.setItem("mangako-coins", coins.toString())
        localStorage.setItem("mangako-chapters", JSON.stringify(unlockedChapters))
        localStorage.setItem("mangako-all-chapters", JSON.stringify(chapters))
    }, [coins, unlockedChapters, chapters])

    const addCoins = (amount: number) => {
        setCoins((prev) => prev + amount)
    }

    const unlockChapter = (chapterId: string) => {
        if (unlockedChapters.includes(chapterId)) return true
        if (coins >= 1) {
            setCoins((prev) => prev - 1)
            setUnlockedChapters((prev) => [...prev, chapterId])
            return true
        }
        return false
    }

    const addChapter = (chapter: Chapter) => {
        setChapters((prev) => [...prev, chapter])
    }

    const deleteChapter = (id: string) => {
        setChapters(prev => {
            const updated = prev.filter(c => c.id !== id)
            try {
                localStorage.setItem("mangako-all-chapters", JSON.stringify(updated))
            } catch (e) {
                console.error("Failed to save to localStorage:", e)
            }
            return updated
        })
    }

    const rateChapter = (chapterId: string, rating: number) => {
        setChapters(prev => {
            const updated = prev.map(chapter => {
                if (chapter.id === chapterId) {
                    const currentRatings = chapter.ratings || { total: 0, count: 0, average: 0 }
                    const newTotal = currentRatings.total + rating
                    const newCount = currentRatings.count + 1
                    const newAverage = newTotal / newCount

                    return {
                        ...chapter,
                        ratings: {
                            total: newTotal,
                            count: newCount,
                            average: Math.round(newAverage * 10) / 10
                        }
                    }
                }
                return chapter
            })

            try {
                localStorage.setItem("mangako-all-chapters", JSON.stringify(updated))
            } catch (e) {
                console.error("Failed to save to localStorage:", e)
                // LocalStorage is full, ratings still work in memory
            }

            return updated
        })
    }

    return (
        <AppContext.Provider value={{
            coins,
            unlockedChapters,
            chapters,
            addCoins,
            unlockChapter,
            addChapter,
            deleteChapter,
            rateChapter
        }}>
            {children}
        </AppContext.Provider>
    )
}

export function useApp() {
    const context = useContext(AppContext)
    if (context === undefined) {
        throw new Error("useApp must be used within an AppProvider")
    }
    return context
}
