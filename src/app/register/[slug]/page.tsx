import { Suspense } from "react";
import type { Metadata } from "next";
import { getActiveCompetitionBySlug } from "@/lib/data/competitions";
import { Skeleton } from "@/components/ui/skeleton";
import { RegisterSection } from "@/features/registration/components/register-section";
import type { RegisterPageProps } from "@/types/registration";

export async function generateMetadata({ params }: RegisterPageProps): Promise<Metadata> {
  const { slug } = await params;
  const competition = await getActiveCompetitionBySlug(slug);
  return {
    title: competition ? `Register for ${competition.name}` : "Register a team",
    description: "Create your team and get a code to share with your teammates.",
  };
}

export default function RegisterPage({ params }: RegisterPageProps) {
  return (
    <main className="mx-auto w-full max-w-2xl flex-1 px-4 py-12">
      <Suspense fallback={<Skeleton className="h-[32rem]" />}>
        <RegisterSection params={params} />
      </Suspense>
    </main>
  );
}
