import { requireAdmin } from "@/lib/data/auth";
import { listCompetitionOptions, listRegistrations } from "@/lib/data/admin";
import { registrationFiltersSchema } from "@/lib/validations/admin";
import { RegistrationFilters } from "@/features/admin/components/registration-filters";
import { RegistrationsTable } from "@/features/admin/components/registrations-table";
import type { RegistrationsSectionProps } from "@/types/admin";

export async function RegistrationsSection({ lang, searchParams }: RegistrationsSectionProps) {
  await requireAdmin();
  const raw = await searchParams;
  const filters = registrationFiltersSchema.parse({
    q: typeof raw.q === "string" ? raw.q : "",
    competition: raw.competition,
    status: raw.status,
    page: raw.page,
  });
  const [competitions, list] = await Promise.all([listCompetitionOptions(), listRegistrations(filters)]);

  return (
    <div className="space-y-4">
      <RegistrationFilters filters={filters} competitions={competitions} />
      <RegistrationsTable list={list} filters={filters} lang={lang} />
    </div>
  );
}
