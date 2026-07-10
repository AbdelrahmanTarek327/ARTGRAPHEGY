import { z } from "zod";

export const inquirySchema = z.object({
  name: z.string().trim().min(2, "Name is required").max(120),
  company: z.string().trim().min(2, "Company is required").max(120),
  projectType: z.string().trim().min(1, "Project type is required").max(80),
  description: z
    .string()
    .trim()
    .min(10, "Please provide more details about your project")
    .max(5000),
  email: z.string().trim().email("Invalid email address").max(254),
});

export type InquiryInput = z.infer<typeof inquirySchema>;

export type InquiryRecord = InquiryInput & {
  id: string;
  submittedAt: string;
};
