import { requireAdmin } from "@/lib/data/auth";
import { listCompetitions, listRegistrations } from "@/lib/data/admin";
import { registrationFiltersSchema } from "@/lib/validations/admin";
import { RegistrationFilters } from "@/features/admin/components/registration-filters";
import { RegistrationsTable } from "@/features/admin/components/registrations-table";
import { PaymentSettingsCard } from "@/features/admin/components/payment-settings-card";
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
  const [competitions, list] = await Promise.all([listCompetitions(), listRegistrations(filters)]);

  return (
    <div className="space-y-6">
      <PaymentSettingsCard competitions={competitions} lang={lang} />
      <div className="space-y-4">
        <RegistrationFilters filters={filters} competitions={competitions.map(({ id, name }) => ({ id, name }))} />
        <RegistrationsTable list={list} filters={filters} lang={lang} />
      </div>
    </div>
  );
}
