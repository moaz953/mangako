"use client"

import { Coins } from "lucide-react"
import { Button } from "./ui/button"
import Link from "next/link"

export function CoinBalance({
    balance,
}: {
    balance: number
}) {
    return (
        <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-yellow-500/10 border border-yellow-500/20">
                <Coins className="w-4 h-4 text-yellow-500" />
                <span className="text-sm font-bold text-yellow-500">{balance}</span>
            </div>
            <Link href="/shop">
                <Button variant="outline" size="sm" className="text-xs">
                    Buy Coins
                </Button>
            </Link>
        </div>
    )
}
