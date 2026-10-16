import { Skeleton } from "@/components/ui/skeleton";

// Below the admin nav (the layout stays on screen).
export default function AdminLoading() {
  return (
    <div className="space-y-6" aria-busy="true">
      <div className="space-y-2">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-72 max-w-full" />
      </div>
      <Skeleton className="h-[28rem]" />
    </div>
  );
}
