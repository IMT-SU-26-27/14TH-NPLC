import { Suspense } from "react";
import Link from "next/link";
import { getCurrentUser } from "@/lib/data/auth";
import { buttonVariants } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { UserMenu } from "@/components/shared/user-menu";

async function HeaderActions() {
  const user = await getCurrentUser();

  if (!user) {
    return (
      <div className="flex items-center gap-2">
        <Link href="/login" className={buttonVariants({ variant: "ghost" })}>
          Sign in
        </Link>
        <Link href="/signup" className={buttonVariants()}>
          Register
        </Link>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-1">
      <Link href="/dashboard" className={buttonVariants({ variant: "ghost" })}>
        Dashboard
      </Link>
      {user.role === "admin" && (
        <Link href="/admin" className={buttonVariants({ variant: "ghost" })}>
          Admin
        </Link>
      )}
      <UserMenu user={user} />
    </div>
  );
}

export function SiteHeader() {
  return (
    <header className="bg-background/80 sticky top-0 z-40 border-b backdrop-blur">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-4 px-4">
        <Link href="/" className="font-heading font-semibold tracking-tight">
          14th NPLC
        </Link>
        <Suspense fallback={<Skeleton className="h-8 w-40" />}>
          <HeaderActions />
        </Suspense>
      </div>
    </header>
  );
}
