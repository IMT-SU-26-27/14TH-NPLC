import { requireUser } from "@/lib/data/auth";
import { ProfileForm } from "@/features/profile/components/profile-form";
import { ChangePasswordForm } from "@/features/profile/components/change-password-form";
import { NotificationSettings } from "@/features/profile/components/notification-settings";

// Reads the session (request data), so the page renders it inside <Suspense>.
export async function ProfileContent() {
  const user = await requireUser("/profile");

  return (
    <div className="space-y-6">
      <ProfileForm user={user} />
      <NotificationSettings />
      <ChangePasswordForm />
    </div>
  );
}
