import { z } from "zod";

export const eventCreateZod = z.object({
  name: z.string().nonempty(),
  price: z
    .string()
    .transform((val) => parseFloat(val))
    .refine((val) => !isNaN(val) && val > 0, { message: "Price must be a positive number" }),
  start_date: z.string(),
  end_date: z.string(),
  location: z.string().optional(),
  description: z.string().optional(),
  ticket_open: z
    .string()
    .transform((val) => parseInt(val, 10))
    .refine((val) => !isNaN(val), { message: "Ticket open must be a number" }),
  ticket_type: z.enum(["FREE", "PAID"]),
});
