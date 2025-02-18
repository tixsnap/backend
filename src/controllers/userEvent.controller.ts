import { NextFunction, Request, Response } from "express";
import { prisma } from "../config";
import {
  findById,
  findBySlug,
  findEventByName,
  formatIdr,
} from "../utils/event.helper";

export class UserEventController {
  async getEvents(req: Request, res: Response, next: NextFunction) {
    try {
      const { page, name, year, month, day } = req.query;
      console.log(name, year, month, day);

      const limit = 10;
      const pageStr = page || 1;
      const skip = (Number(pageStr) - 1) * limit;

      if (page) {
        const data = await prisma.event.findMany({
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                role: false,
              },
            },
          },
          where: {
            isDeleted: false,
          },
          take: limit,
          skip,
        });
        res.status(200).send({
          message: "success",
          page,
          data,
        });
      } else if (name) {
        const data = await prisma.event.findMany({
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                role: false,
              },
            },
          },
          where: {
            isDeleted: false,
            name: {
              contains: String(name),
              mode: "insensitive",
            },
          },
        });
        res.status(200).send({
          message: "success",
          data,
        });
      } else if (year) {
        const data = await prisma.event.findMany({
          where: {
            isDeleted: false,
            createdAt: {
              gte: new Date(`${year}-${month}-${day}`).toISOString(),
              lte: new Date(
                `${Number(year) + 1}-${month}-${day}`
              ).toISOString(),
            },
          },
        });

        res.status(200).send({
          message: "success",
          data,
        });
      } else {
        // if no page params
        const data = await prisma.event.findMany({
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                role: false,
              },
            },
          },
          where: {
            isDeleted: false,
          },
          take: limit,
          skip,
        });
        res.status(200).send({
          message: "success",
          data,
        });
      }
    } catch (error) {
      next(error);
    }
  }

  async getEventsBySlug(req: Request, res: Response, next: NextFunction) {
    try {
      const { slug } = req.params;
      const userId = req.user?.id;
      console.log(slug);
      const eventExist = await findBySlug(slug, userId as string);
      if (!eventExist) throw new Error(`Event with ID ${slug} not found`);

      res.status(200).send({
        message: "success",
        data: eventExist,
      });
    } catch (error) {
      next(error);
    }
  }

  // ?name=java+jazz&category=MUSIC&location=Prambanan

  async getEventsByParams(req: Request, res: Response, next: NextFunction) {
    try {
      const params = new URLSearchParams(req.params.param);
      const name = params.get("name") as string;
      const category = params.get("category");
      const location = params.get("location");
      const eventExist = await prisma.event.findMany({
        where: {
          name,
          category,
          location,
          isDeleted: false,
        },
      });
      console.log(eventExist);

      if (!eventExist.length)
        throw new Error(
          `Events with name ${name}, category ${category}, and location ${location} not found`
        );

      res.status(200).send({
        message: "success",
        data: eventExist,
      });
    } catch (error) {
      next(error);
    }
  }
}
