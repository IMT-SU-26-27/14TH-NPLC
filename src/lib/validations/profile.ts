import { z } from "zod";

export const profileSchema = z.object({
  fullName: z.string().trim().min(2, "validation.fullName").max(100),
});

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "validation.passwordRequired"),
    password: z.string().min(8, "validation.passwordMin").max(72),
    confirmPassword: z.string(),
  })
  .refine((v) => v.password === v.confirmPassword, {
    message: "validation.passwordMismatch",
    path: ["confirmPassword"],
  });
