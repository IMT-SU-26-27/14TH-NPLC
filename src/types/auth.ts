import type { z } from "zod";
import type { Tables } from "@/types/database";
import type { signInSchema, signUpSchema } from "@/lib/validations/auth";
import type { LangParams, Locale } from "@/types/i18n";

export type Profile = Tables<"profiles">;

export type CurrentUser = Pick<Profile, "id" | "email" | "full_name" | "role" | "avatar_url" | "created_at">;

export type SignInInput = z.infer<typeof signInSchema>;
export type SignUpInput = z.infer<typeof signUpSchema>;

export type AuthFormProps = {
  next?: string;
};

export type AuthSearchParams = Promise<{ next?: string; error?: string }>;

export type AuthPageProps = {
  params: LangParams;
  searchParams: AuthSearchParams;
};

export type AuthFormLoaderProps = {
  mode: "login" | "signup";
  lang: Locale;
  searchParams: AuthSearchParams;
};

export type UserMenuProps = {
  user: CurrentUser;
};
