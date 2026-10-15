import { publicEnvSchema } from "@/lib/validations/env";

// NEXT_PUBLIC_ variables must be referenced literally so Next.js can inline them in the browser bundle.
export const publicEnv = publicEnvSchema.parse({
  NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
  NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
});
