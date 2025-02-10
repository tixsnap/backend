import { NextFunction, Request, Response } from "express";
import { prisma } from "../config";
import { Prisma } from "@prisma/client";
import { cloudinaryRemove, cloudinaryUpload } from "../utils/cloudinary";

export class UserController {

    async editProfile(req: Request, res: Response, next: NextFunction){
        try {
            const {first_name, last_name, profile_picture} = req.body
            const userId = req.user?.id as string

            const existProfile = await prisma.profile.findUnique({
                where: {
                    id: userId
                }
            })

            // profile exist, edit
            const reqData: Prisma.ProfileUpdateInput = {}
            if(first_name) reqData.firstName = first_name 
            if(last_name) reqData.lastName = last_name
            // if(profile_picture) reqData.profilePicture = profile_picture

            if(!existProfile){

                await prisma.profile.create({
                    data: {
                        id: userId,
                        firstName: reqData.firstName as string,
                        lastName: reqData.lastName as string,
                        // profilePicture: reqData.profilePicture as string
                    }
                })

            }else{
                await prisma.profile.update({
                    where: {
                        id: userId
                    },
                    data: reqData
                })
                
            }


            res.status(200).send({
                message: "profile updated"
            })

            
            
        } catch (error) {
            next(error)
        }
    }

    async uploadAvatar(req: Request, res: Response, next: NextFunction){
        try {
            
            const id = req.user?.id
            const {file} = req
            
            if(!file) throw new Error('No file uploaded')
            const {secure_url} = await cloudinaryUpload(file)   

            const existProfile = await prisma.profile.findUnique({
                where: {
                    id
                }
            })

            if(existProfile){
                await prisma.profile.update({
                    data: {
                        profilePicture: secure_url
                    },
                    where: {
                        id
                    }
                })
            }else{
                await prisma.profile.create({
                    data: {
                        profilePicture: secure_url,
                        user: {
                            connect: {
                                id
                            }
                        }
                    },
                })
            }

            res.status(200).send({
                message: "upload image success"
            })

        } catch (error) {
            next(error)
        }
    }

    async removeAvatar(req: Request, res: Response, next: NextFunction){
        try {
            
            const id = req.user?.id
            const secure_url = req.body.profile_picture  

            if(!secure_url) throw new Error("profile_picture is required to remove")

            await cloudinaryRemove(secure_url)
            await prisma.profile.update({
                data: {
                    profilePicture: null
                },
                where: {
                    id
                }
            })
            res.status(200).send({
                message: "delete image success"
            })


        } catch (error) {
            next(error)
        }
    }

    async getProfileId(req: Request, res: Response, next: NextFunction){
        try {
            
            const id = req.user?.id
            const existProfile = await prisma.profile.findUnique({
                where: {
                    id
                },
                select: {
                    firstName: true,
                    lastName: true,
                    profilePicture: true,
                    user: {
                        select: {
                            email: true,
                            point: {
                                select: {
                                    totalPoint: true
                                }

                            }
                        }
                    }
                }
            })

            if(!existProfile) throw new Error("Profile not found")
            res.status(200).send({
                message: "success",
                data: existProfile
            })

        } catch (error) {
            next(error)
        }
    }

}