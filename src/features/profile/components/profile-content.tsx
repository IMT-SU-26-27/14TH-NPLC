import { requireUser } from "@/lib/data/auth";
import { pushEnabledFor } from "@/lib/push/config";
import { ProfileForm } from "@/features/profile/components/profile-form";
import { ChangePasswordForm } from "@/features/profile/components/change-password-form";
import { NotificationSettings } from "@/features/profile/components/notification-settings";
import { InstallAppCard } from "@/features/profile/components/install-app-card";

// Reads the session (request data), so the page renders it inside <Suspense>.
export async function ProfileContent() {
  const user = await requireUser("/profile");

  return (
    <div className="space-y-4 sm:space-y-5">
      <ProfileForm user={user} />
      <ChangePasswordForm />
      {pushEnabledFor(user.role) && <NotificationSettings />}
      <InstallAppCard />
    </div>
  );
}
