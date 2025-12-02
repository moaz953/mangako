import { Skeleton } from "@/components/ui/skeleton"

export function HeroCarouselSkeleton() {
    return (
        <div className="relative w-full h-[500px] md:h-[600px] rounded-2xl overflow-hidden bg-muted">
            {/* Background */}
            <Skeleton className="absolute inset-0" />

            {/* Content area */}
            <div className="relative h-full container mx-auto px-4 md:px-8 flex items-center">
                <div className="max-w-2xl space-y-6">
                    {/* Badge */}
                    <Skeleton className="h-6 w-24" />

                    {/* Title */}
                    <Skeleton className="h-16 w-full" />

                    {/* Author */}
                    <Skeleton className="h-6 w-48" />

                    {/* Description */}
                    <div className="space-y-2">
                        <Skeleton className="h-5 w-full" />
                        <Skeleton className="h-5 w-5/6" />
                        <Skeleton className="h-5 w-4/6" />
                    </div>

                    {/* Stats */}
                    <div className="flex gap-4">
                        <Skeleton className="h-5 w-24" />
                        <Skeleton className="h-5 w-20" />
                    </div>

                    {/* Buttons */}
                    <div className="flex gap-3">
                        <Skeleton className="h-12 w-36" />
                        <Skeleton className="h-12 w-48" />
                    </div>
                </div>
            </div>

            {/* Dots */}
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2">
                {Array.from({ length: 5 }).map((_, i) => (
                    <Skeleton key={i} className="h-2 w-2 rounded-full" />
                ))}
            </div>
        </div>
    )
}
