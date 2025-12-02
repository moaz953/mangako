import { Skeleton } from "@/components/ui/skeleton"

export function MangaCardSkeleton() {
    return (
        <div className="space-y-3">
            {/* Cover Image */}
            <Skeleton className="aspect-[3/4] rounded-xl" />

            {/* Title */}
            <Skeleton className="h-5 w-3/4" />

            {/* Author */}
            <Skeleton className="h-4 w-1/2" />
        </div>
    )
}

export function MangaGridSkeleton({ count = 10 }: { count?: number }) {
    return (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
            {Array.from({ length: count }).map((_, i) => (
                <MangaCardSkeleton key={i} />
            ))}
        </div>
    )
}
