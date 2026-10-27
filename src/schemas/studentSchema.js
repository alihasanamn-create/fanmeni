import { z } from "zod";

export const studentSchema = z.object({
  studentCode: z.string().min(1, "Student code is required"),

  studentName: z.string().min(2, "Student name is required"),

  team: z.string().min(1, "Select a team"),

  category: z.string().min(1, "Select a category"),
});