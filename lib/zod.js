import { z } from "zod";

export const signInSchema = z.object({
  email: z.string().min(1, "Email is required").email("Invalid email"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(32, "Password must be less than 32 characters"),
});

export const signUpSchema = z.object({
  fullName: z
    .string()
    .min(1, "Full name is required")
    .max(50, "Name must be less than 50 characters"),
  email: z.string().min(1, "Email is required").email("Invalid email"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(32, "Password must be less than 32 characters"),
  confirmPassword: z.string().min(1, "Please confirm your password"),
  userType: z.enum(["user", "parking-owner"], {
    required_error: "Please select an account type",
  }),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export const onboardingSchema = z.object({
  industry: z.string().min(1, "Industry is required"),
  subIndustry: z.string().min(1, "Specialization is required"),
  experience: z.coerce.number().min(0, "Experience must be at least 0"),
  skills: z.string().min(1, "Skills are required"),
  bio: z.string().min(10, "Bio must be at least 10 characters"),
});
