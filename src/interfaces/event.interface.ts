import { TicketType } from "@prisma/client";

export interface EventUpdate {
  id?: string;
  name?: string;
  price?: number;
  startDate?: Date;
  endDate?: Date;
  description?: string;
  ticketOpen?: number;
  ticketType?: TicketType
  category?: string;
  location?: string;
  availableSeat?: number;
  ticketSold?: number;
  isAttended?: boolean;
}
