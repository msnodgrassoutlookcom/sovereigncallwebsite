import { Skeleton } from "@/components/ui/skeleton"

export default function LoreLoading() {
  return (
    <div className="container mx-auto py-8">
      <Skeleton className="h-12 w-1/3 mx-auto mb-8" />

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Flyout Menu Skeleton */}
        <div className="lg:w-1/4 bg-black/20 rounded-lg p-4 backdrop-blur-sm border border-white/10">
          <Skeleton className="h-8 w-3/4 mb-4" />

          <div className="space-y-4">
            {Array(6)
              .fill(0)
              .map((_, i) => (
                <div key={i} className="space-y-2">
                  <Skeleton className="h-6 w-full" />
                  {i === 0 && (
                    <div className="pl-4 space-y-2 mt-2">
                      {Array(4)
                        .fill(0)
                        .map((_, j) => (
                          <Skeleton key={j} className="h-5 w-5/6" />
                        ))}
                    </div>
                  )}
                </div>
              ))}
          </div>
        </div>

        {/* Content Area Skeleton */}
        <div className="lg:w-3/4">
          <div className="bg-black/20 rounded-lg p-6 backdrop-blur-sm border border-white/10 min-h-[600px]">
            <Skeleton className="h-10 w-1/2 mb-6" />
            <div className="space-y-4">
              {Array(6)
                .fill(0)
                .map((_, i) => (
                  <Skeleton key={i} className="h-24 w-full" />
                ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
