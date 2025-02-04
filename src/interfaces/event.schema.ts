import { z } from "zod";

export const eventCreateZod = z.object({
  name: z.string().nonempty(),
  price: z.number().positive(),
  start_date: z.string(),
  end_date: z.string(),
  location: z.string().optional(),
  description: z.string().optional(),
  ticket_open: z.number(),
  ticket_type: z.enum(["FREE", "PAID"]),
});
