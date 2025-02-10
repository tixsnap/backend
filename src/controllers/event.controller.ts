import { NextFunction, Request, Response } from "express";
import { prisma } from "../config";
import {
  findById,
  findBySlug,
  findEventByName,
  formatIdr,
} from "../utils/event.helper";
import { Prisma } from "@prisma/client";
import { generateSlug } from "../utils/slug.helper";
import { EventUpdate } from "../interfaces/event.interface";
import { cloudinaryUpload } from "../utils/cloudinary";

export class EventController {
  async getEvents(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id;
      const {page, name, year, month, day} = req.query
      console.log(name, year, month, day)

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
      }else if(year){

        const data = await prisma.event.findMany({
          where: {
            userId,
            isDeleted: false,
            createdAt: {
              gte: new Date(`${year}-${month}-${day}`).toISOString(),
              lte: new Date(`${Number(year) + 1}-${month}-${day}`).toISOString()
            }
          }
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

  async getEventsBySlug(req: Request, res: Response, next: NextFunction) {
    try {
        const {slug} = req.params
        const userId = req.user?.id;
        console.log(slug)
        const eventExist = await findBySlug(slug, userId as string)
        if(!eventExist) throw new Error(`Event with ID ${slug} not found`)

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
      const {file} = req
      const existEvent = await findEventByName(name);
      if (existEvent) throw new Error("Event already exist !");

      let imageUrl = null
      if(file){
        const { secure_url } = await cloudinaryUpload(file);
        imageUrl = secure_url;
      }
      
        const data: Prisma.EventCreateInput = {
          name,
          price: parseFloat(price),
          startDate: new Date(start_date),
          endDate: new Date(end_date),
          description,
          imageUrl,
          ticketOpen: parseInt(ticket_open),
          ticketType: ticket_type,
          availableSeat: parseInt(ticket_open),
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
        const {name, price, startDate, endDate, description, ticketOpen, ticketType, category, location, availableSeat, ticket_sold, is_attended } = req.body
        const {slug} = req.params
        const {file} = req
        const userId = req.user?.id;
        const existEvent = await prisma.event.findFirst({
            where: {
                slug,
                userId
            }
        })
        if(!existEvent) throw new Error("Event not found !")

        const updateData: EventUpdate = {}
        if(name) updateData.name = name;
        if(price) updateData.price = parseInt(price);
        if(startDate) updateData.startDate = new Date(startDate);
        if(endDate) updateData.endDate = new Date(endDate);
        if(description) updateData.description = description;
        if(ticketOpen) updateData.ticketOpen = parseInt(ticketOpen);
        if(ticketType) updateData.ticketType = ticketType;
        if(category) updateData.category = category;
        if(location) updateData.location = location;
        if(availableSeat) updateData.availableSeat = parseInt(availableSeat);
        if(ticket_sold) updateData.ticketSold = ticket_sold;
        if(is_attended !== undefined) updateData.isAttended = is_attended;
        if(file) {
          const {secure_url} = await cloudinaryUpload(file)   
          if(file) updateData.imageUrl = secure_url;
        }

        const updatedEvent = await prisma.event.update({
            where: {
                slug,
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

  async getAttendeeList (req: Request, res: Response, next: NextFunction) {
    try {
      const {event}  = req.query
      console.log(event)
      const id = req.user?.id
      if(event){
        const attendees = await prisma.transaction.findMany({
          where: {
            status: "DONE",
            event: {
              userId: id,
              slug: event as string
            }
          },
          select: {
            user: {
              select: {
                id: true,
                email: true
              }
            },
            event: {
              select: {
                id: true,
                name: true,
                price: true,
                imageUrl: true
              }
            },
            totalPayment: true,
            status: true,
            validUntilPaymentProof: true,
            totalTicket: true,
            createdAt: true
          }
        })
        res.status(200).send({
          message: "success",
          length: attendees.length,
          data: attendees
        })
      }else{
        const attendees = await prisma.transaction.findMany({
          where: {
            status: "WAITING_PAYMENT",
            event: {
              userId: id,
            }
          },
          select: {
            user: {
              select: {
                id: true,
                email: true
              }
            },
            event: {
              select: {
                id: true,
                name: true,
                price: true,
              }
            },
            totalPayment: true,
            status: true,
            validUntilPaymentProof: true,
            createdAt: true
          }
        })
        res.status(200).send({
          message: "success",
          length: attendees.length,
          data: attendees
        })
      }
    } catch (error) {
      next(error)
    }
  }
}
