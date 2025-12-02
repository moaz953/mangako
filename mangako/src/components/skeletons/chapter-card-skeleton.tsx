import { Skeleton } from "@/components/ui/skeleton"

export function ChapterCardSkeleton() {
    return (
        <div className="bg-card/50 border border-border/50 rounded-xl overflow-hidden">
            <div className="flex gap-4 p-3">
                {/* Cover Image */}
                <Skeleton className="w-16 h-24 flex-shrink-0 rounded-md" />

                <div className="flex flex-col justify-between py-1 min-w-0 flex-1">
                    <div>
                        {/* Title */}
                        <Skeleton className="h-5 w-3/4 mb-2" />
                        {/* Badge */}
                        <Skeleton className="h-5 w-20" />
                    </div>
                    {/* Subtitle */}
                    <Skeleton className="h-4 w-1/2" />
                </div>
            </div>
        </div>
    )
}

export function ChapterListSkeleton({ count = 8 }: { count?: number }) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {Array.from({ length: count }).map((_, i) => (
                <ChapterCardSkeleton key={i} />
            ))}
        </div>
    )
}
