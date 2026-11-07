import type { z } from "zod";
import type { Tables } from "@/types/database";
import type { signInSchema, signUpSchema } from "@/lib/validations/auth";
import type { LangParams } from "@/types/i18n";

export type Profile = Tables<"profiles">;

export type CurrentUser = Pick<Profile, "id" | "email" | "full_name" | "role" | "avatar_url" | "created_at">;

export type SignInInput = z.infer<typeof signInSchema>;
export type SignUpInput = z.infer<typeof signUpSchema>;

export type AuthFormProps = {
  next?: string;
};

export type AuthSearchParams = Promise<{ next?: string }>;

export type AuthPageProps = {
  params: LangParams;
  searchParams: AuthSearchParams;
};

export type AuthFormLoaderProps = {
  mode: "login" | "signup";
  searchParams: AuthSearchParams;
};

// The committee member who resets forgotten passwords by hand.
export type ContactPerson = {
  name: string;
  lineId: string;
};

export type UserMenuProps = {
  user: CurrentUser;
};
