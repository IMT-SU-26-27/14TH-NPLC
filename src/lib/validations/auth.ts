import { z } from "zod";

export const signInSchema = z.object({
  email: z.email("validation.email").trim().toLowerCase(),
  password: z.string().min(1, "validation.passwordRequired"),
});

export const signUpSchema = z
  .object({
    fullName: z.string().trim().min(2, "validation.fullName").max(100),
    email: z.email("validation.email").trim().toLowerCase(),
    password: z.string().min(8, "validation.passwordMin").max(72),
    confirmPassword: z.string(),
  })
  .refine((v) => v.password === v.confirmPassword, {
    message: "validation.passwordMismatch",
    path: ["confirmPassword"],
  });

export const forgotPasswordSchema = z.object({
  email: z.email("validation.email").trim().toLowerCase(),
});

export const newPasswordSchema = z
  .object({
    password: z.string().min(8, "validation.passwordMin").max(72),
    confirmPassword: z.string(),
  })
  .refine((v) => v.password === v.confirmPassword, {
    message: "validation.passwordMismatch",
    path: ["confirmPassword"],
  });

// Only allow same-site relative redirects after sign-in.
export const nextPathSchema = z
  .string()
  .regex(/^\/(?!\/)[\w\-/?=&.%]*$/)
  .catch("/dashboard");
