import { NextFunction, Request, Response } from "express";
import { prisma } from "../config";
import {
    findById,
  findEventByName,
  formatIdr,
} from "../utils/event.helper";
import { Prisma } from "@prisma/client";
import { generateSlug } from "../utils/slug.helper";
import { EventUpdate } from "../interfaces/event.interface";

export class EventController {
  async getEvents(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id;
      const {page, name} = req.query
      console.log(name)

      const limit = 10
      const pageStr = page || 1
      const skip = (Number(pageStr) - 1) * limit

      if(page){
        const data = await prisma.event.findMany({
            include: {
                user: {
                  select: {
                    id: true,
                    name: true,
                    email: true,
                    role: true,
                  },
                },
              },
              where: {
                userId,
                isDeleted: false
              },
              take: limit,
              skip
        })
        res.status(200).send({
            message: "success",
            page,
            data
        })
      }else if(name){
        const data= await prisma.event.findMany({
            include: {
                user: {
                  select: {
                    id: true,
                    name: true,
                    email: true,
                    role: true,
                  },
                },
              },
              where: {
                userId,
                isDeleted: false,
                name: {
                    contains: String(name),
                    mode: 'insensitive'
                }
              },
        })
        res.status(200).send({
            message: "success",
            data
        })
      }else{
        // if no page params
        const data = await prisma.event.findMany({
            include: {
            user: {
                select: {
                id: true,
                name: true,
                email: true,
                role: true,
                },
            },
            },
            where: {
            userId,
            isDeleted: false
            },
            take: limit,
            skip,
        });
        res.status(200).send({
          message: "success",
          data
        });
      }

    } catch (error) {
      next(error);
    }
  }

  async getEventsById(req: Request, res: Response, next: NextFunction) {
    try {
        const {id} = req.params
        const userId = req.user?.id;
        const eventExist = await findById(id, userId as string)
        if(!eventExist) throw new Error(`Event with ID ${id} not found`)

            res.status(200).send({
                message: "success",
                data: eventExist
            })
        
    } catch (error) {
        next(error)
    }
  }

  async createEvent(req: Request, res: Response, next: NextFunction) {
    try {
      const {
        name,
        price,
        start_date,
        end_date,
        ticket_open,
        description,
        location,
        category,
        ticket_type,
      } = req.body;
      const userId = req.user?.id;
      const existEvent = await findEventByName(name);
      if (existEvent) throw new Error("Event already exist !");
      const data: Prisma.EventCreateInput = {
        name,
        price,
        startDate: new Date(start_date),
        endDate: new Date(end_date),
        description,
        ticketOpen: ticket_open,
        ticketType: ticket_type,
        availableSeat: ticket_open,
        category,
        location,
        slug: generateSlug(name),
        user: {
          connect: {
            id: userId,
          },
        },
      };

      const newEvent = await prisma.event.create({
        data,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              role: true,
            },
          },
        },
      });

      const eventFormattedIdr = {
        ...newEvent,
        price: formatIdr(price),
      };

      res.status(201).send({
        message: "success",
        data: eventFormattedIdr,
      });
    } catch (error) {
      next(error);
    }
  }

  async deleteEvent(req: Request, res: Response, next: NextFunction) {
    try {

        const {id} = req.params
        const userId = req.user?.id;
        const eventExist = await prisma.event.findUnique({
            where: {
                id, 
                userId,
                isDeleted: false
            },
        })
        if(!eventExist) throw new Error(`Event with ID ${id} already deleted`)
        await prisma.event.update({
            where: {
                id
            },
            data: {
                isDeleted: true
            }
        })

        res.status(200).send({
            message: "Event has been deleted successfully"
        })
        
    } catch (error) {
        next(error)
    }
  }

  async editEvent(req: Request, res: Response, next: NextFunction) {
    try {
        const {name, price, start_date, end_date, description, ticket_open, ticket_type, category, location, available_seat, ticket_sold, is_attended } = req.body
        const {id} = req.params
        const userId = req.user?.id;
        const existEvent = await prisma.event.findFirst({
            where: {
                id,
                userId
            }
        })
        if(!existEvent) throw new Error("Event not found !")

        const updateData: EventUpdate = {}
        if(name) updateData.name = name;
        if(price) updateData.price = price;
        if(start_date) updateData.startDate = new Date(start_date);
        if(end_date) updateData.endDate = new Date(end_date);
        if(description) updateData.description = description;
        if(ticket_open) updateData.ticketOpen = ticket_open;
        if(ticket_type) updateData.ticketType = ticket_type;
        if(category) updateData.category = category;
        if(location) updateData.location = location;
        if(available_seat) updateData.availableSeat = available_seat;
        if(ticket_sold) updateData.ticketSold = ticket_sold;
        if(is_attended !== undefined) updateData.isAttended = is_attended;

        const updatedEvent = await prisma.event.update({
            where: {
                id,
                userId, 
                isDeleted: false
            },
            data: updateData
        })

        res.status(200).send({
            message: "success",
            data: updatedEvent
        })
        
    } catch (error) {
        next(error)
    }
  }
}
