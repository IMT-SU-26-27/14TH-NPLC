import type { z } from "zod";
import type { changePasswordSchema, profileSchema } from "@/lib/validations/profile";
import type { CurrentUser } from "@/types/auth";

export type ProfileInput = z.infer<typeof profileSchema>;
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;

export type ProfileFormProps = {
  user: Pick<CurrentUser, "full_name" | "email">;
};
