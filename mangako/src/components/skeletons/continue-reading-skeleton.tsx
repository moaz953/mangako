import { Skeleton } from "@/components/ui/skeleton"

export function ContinueReadingSkeleton() {
    return (
        <div className="bg-card/50 border border-border/50 rounded-xl overflow-hidden">
            <div className="flex gap-4 p-4">
                {/* Cover Image */}
                <Skeleton className="w-20 h-28 flex-shrink-0 rounded-md" />

                <div className="flex-1 min-w-0">
                    {/* Title */}
                    <Skeleton className="h-5 w-3/4 mb-2" />
                    {/* Chapter info */}
                    <Skeleton className="h-4 w-1/2 mb-3" />
                    {/* Progress bar */}
                    <Skeleton className="h-2 w-full" />
                </div>
            </div>
        </div>
    )
}

export function ContinueReadingListSkeleton({ count = 6 }: { count?: number }) {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: count }).map((_, i) => (
                <ContinueReadingSkeleton key={i} />
            ))}
        </div>
    )
}
