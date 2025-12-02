"use client"

import { useState } from "react"

import { ArrowLeft, User, Zap, Brain, Activity, Lock } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

const characters = [
    {
        id: "protagonist",
        name: "Kaito",
        role: "The Hunter",
        description: "A young man searching for the truth behind the vanishing stars.",
        quote: "I won't stop until I find them all.",
        stats: { strength: 8, agility: 9, intelligence: 6 },
        unlocked: true,
    },
    {
        id: "antagonist",
        name: "???",
        role: "The Shadow",
        description: "Unknown entity seen only in reflections.",
        quote: "The stars belong to me.",
        stats: { strength: 10, agility: 7, intelligence: 9 },
        unlocked: false,
    },
    {
        id: "support",
        name: "Yuki",
        role: "The Guide",
        description: "A mysterious advisor who knows more than she reveals.",
        quote: "Trust the journey, not the destination.",
        stats: { strength: 4, agility: 6, intelligence: 10 },
        unlocked: true,
    },
]

function StatBar({ label, value, icon: Icon }: { label: string; value: number; icon: React.ElementType }) {
    return (
        <div className="space-y-1">
            <div className="flex justify-between items-center text-xs">
                <div className="flex items-center gap-1 text-zinc-400">
                    <Icon className="w-3 h-3" />
                    <span className="uppercase tracking-wider">{label}</span>
                </div>
                <span className="text-primary font-bold">{value}/10</span>
            </div>
            <div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                <div
                    className="h-full bg-gradient-to-r from-primary to-purple-500 transition-all duration-700 ease-out"
                    style={{ width: `${value * 10}%` }}
                />
            </div>
        </div>
    )
}

export default function WikiPage() {
    const [flippedCards, setFlippedCards] = useState<string[]>([])

    const toggleFlip = (id: string) => {
        setFlippedCards(prev =>
            prev.includes(id) ? prev.filter(cid => cid !== id) : [...prev, id]
        )
    }

    return (
        <div className="min-h-screen bg-background text-foreground p-8">
            <header className="mb-12 max-w-6xl mx-auto">
                <Link href="/">
                    <Button variant="ghost" className="mb-4">
                        <ArrowLeft className="mr-2 h-4 w-4" /> Back to Home
                    </Button>
                </Link>
                <h1 className="text-5xl font-black tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/50">
                    Character Wiki
                </h1>
                <p className="text-muted-foreground text-lg mt-2">Discover the heroes and villains of Mangako.</p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
                {characters.map((char, index) => {
                    const isFlipped = flippedCards.includes(char.id)
                    const isLocked = !char.unlocked

                    return (
                        <div
                            key={char.id}
                            className="perspective-1000 animate-fade-in"
                            style={{ animationDelay: `${index * 0.1}s`, animationFillMode: 'forwards', opacity: 0 }}
                        >
                            <div
                                className="relative h-[400px] cursor-pointer transition-transform duration-500"
                                style={{ transformStyle: 'preserve-3d', transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0)' }}
                                onClick={() => !isLocked && toggleFlip(char.id)}
                            >
                                {/* Front */}
                                <div className="absolute inset-0 backface-hidden" style={{ backfaceVisibility: 'hidden' }}>
                                    <Card className={`h-full border-zinc-800 bg-zinc-900/80 backdrop-blur-sm overflow-hidden ${isLocked && "opacity-60 grayscale"
                                        }`}>
                                        <div className="relative h-full flex flex-col p-6">
                                            {/* Avatar */}
                                            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary/20 to-purple-500/20 border-2 border-primary/30 flex items-center justify-center mb-4">
                                                {isLocked ? (
                                                    <Lock className="w-10 h-10 text-zinc-600" />
                                                ) : (
                                                    <User className="w-10 h-10 text-primary" />
                                                )}
                                            </div>

                                            {/* Name & Role */}
                                            <div className="mb-4">
                                                <h3 className="text-2xl font-black tracking-tight mb-1">
                                                    {isLocked ? "???" : char.name}
                                                </h3>
                                                <Badge variant="outline" className="text-xs font-bold uppercase tracking-widest border-primary/50 text-primary">
                                                    {char.role}
                                                </Badge>
                                            </div>

                                            {/* Description */}
                                            <p className="text-zinc-400 text-sm leading-relaxed mb-4 flex-1">
                                                {isLocked ? "Keep reading to unlock this character's profile." : char.description}
                                            </p>

                                            {!isLocked && (
                                                <div className="text-xs text-zinc-500 text-center py-2 border-t border-zinc-800">
                                                    Click to see stats
                                                </div>
                                            )}
                                        </div>
                                    </Card>
                                </div>

                                {/* Back */}
                                <div
                                    className="absolute inset-0 backface-hidden"
                                    style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
                                >
                                    <Card className="h-full border-zinc-800 bg-zinc-900/80 backdrop-blur-sm">
                                        <div className="h-full flex flex-col p-6">
                                            <h3 className="text-xl font-bold mb-2">{char.name}</h3>
                                            <p className="text-xs italic text-zinc-400 mb-6">&quot;{char.quote}&quot;</p>

                                            {/* Stats */}
                                            <div className="space-y-4 flex-1">
                                                <h4 className="text-sm font-bold uppercase tracking-wider text-zinc-500">Abilities</h4>
                                                <StatBar label="Strength" value={char.stats.strength} icon={Zap} />
                                                <StatBar label="Agility" value={char.stats.agility} icon={Activity} />
                                                <StatBar label="Intelligence" value={char.stats.intelligence} icon={Brain} />
                                            </div>

                                            <div className="text-xs text-zinc-500 text-center py-2 border-t border-zinc-800 mt-4">
                                                Click to flip back
                                            </div>
                                        </div>
                                    </Card>
                                </div>
                            </div>
                        </div>
                    )
                })}
            </div>
        </div>
    )
}
