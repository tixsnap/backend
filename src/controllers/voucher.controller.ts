import { NextFunction, Request, Response } from "express";
import { prisma } from "../config";
import { Prisma } from "@prisma/client";

export class VoucherControoler {

    async createVoucher(req: Request, res: Response, next: NextFunction) {
        try {

            const userId = req.user?.id
            const {name, totalValue, startDate, validUntil, events} = req.body
            console.log(req.body)
            
            const userEvents = await prisma.event.findMany({
                where: {
                    userId,
                    isDeleted: false,
                    id: {in: events}
                },
                select: {id: true}
            })

            if(userEvents.length == 0) throw new Error("User has no events available")

            const data: Prisma.VoucherCreateInput = {
                name,
                startFrom: new Date(startDate),
                validUntil: new Date(validUntil),
                totalValue: Number(totalValue),
                events: {
                    create: userEvents.map(event => ({
                        event: { connect: { id: event.id } }
                    }))
                },
            }

            await prisma.voucher.create({
                data,
                include: {
                    events: {
                        select: {
                            event: true
                        }
                    }
                }
            })

            res.status(201).send({
                message: "success",
                data
            })
            
        } catch (error) {
            next(error)
        }
    }

    async getVouchers(req: Request, res: Response, next: NextFunction) {
        try {

            const userId = req.user?.id
            const data = await prisma.voucher.findMany({
                where: {
                    events: {
                        some: {
                            event: {
                                userId
                            }
                        }
                    }
                },
                select: {
                    id: true,
                    name: true,
                    startFrom: true,
                    validUntil: true,
                    totalValue: true,
                    isExpired: true,
                    events: {
                        select: {
                            event: {
                                select: {
                                    name: true
                                }
                            }
                        }
                    }
                }
            })

            res.status(200).send({
                message: "success",
                data
            })
            
        } catch (error) {
            next(error)
        }
    }
}