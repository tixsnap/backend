import { z } from "zod";

export const registerSchema = z
  .object({
    name: z.string().min(4).max(10).nonempty(),
    email: z.string().email().nonempty(),
    referral: z.string().min(9).max(9).optional(),
    password: z
      .string()
      .min(6)
      .max(10)
      .regex(new RegExp("^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9]).{6,}$"), {
        message:
          "Password must be at least 6 characters and contain an uppercase letter, lowercase letter, and number",
      })
      .nonempty(),
    confirmPassword: z.string().min(6).max(10).nonempty(),
  })
  .refine((val) => val.password === val.confirmPassword, {
    message: "Password mush match with password",
    path: ["confirmPassword"],
  });
