import { NextFunction, Request, Response } from "express";
import { prisma } from "../config";
import { Prisma } from "@prisma/client";
import { sendEmail } from "../utils/nodemailer.helper";
import { signToken } from "../utils/jwt.helper";
import { generateRefferaCodeUser } from "../utils/refferal.helper";
import { findByEmail, findByReferral } from "../utils/auth.helper";
import { verify } from "jsonwebtoken";
import {
  jwt_secret,
  password_nodemailer,
  username_nodemailer,
} from "../config";
import * as bcrypt from "bcrypt";

export class AuthController {
  private static readonly SALT_ROUND = 9;
  private static readonly REFERRAL_POINTS = 5000;
  private static readonly REFERRER_POINTS = 10000;
  private static readonly COUPON_EXPIRATION = 3;

  // INTERNAL HELPERS
  private couponExpired() {
    const expirationDate = new Date();
    expirationDate.setMonth(
      expirationDate.getMonth() + AuthController.COUPON_EXPIRATION
    );
    return expirationDate;
  }

  async registerUser(req: Request, res: Response, next: NextFunction) {
    try {
      const { referral, email, name, password, role } = req.body;
      const registeredUser = await findByEmail(email); // check user exist
      if (registeredUser) throw new Error("Email has been registered !");
      const referralCode: string = generateRefferaCodeUser(); // generate code referral
      const hashedPassword = await bcrypt.hash(
        password,
        AuthController.SALT_ROUND
      );

      // check refferal code
      if (referral) {
        const userHasReferral = await findByReferral(referral);
        if (!userHasReferral) throw new Error("Referral code is not found !!!");
        // register with reff
        await prisma.$transaction(async (trx) => {
          // create registered user
          const newUserRegister: Prisma.UserCreateInput = await trx.user.create(
            {
              data: {
                email,
                name,
                password: hashedPassword,
                role,
                referralCode,
              },
            }
          );
          // create user registered coupon (refferal)
          await trx.couponReferral.create({
            data: {
              userId: newUserRegister.id as string,
              totalValue: AuthController.REFERRAL_POINTS,
              validUntil: this.couponExpired(),
              user: {
                connect: {
                  id: newUserRegister.id as string,
                },
              },
            },
          });

          // find user has refferal
          const userOwnReferral = await trx.user.findUnique({
            where: {
              referralCode: referral,
            },
          });

          const pointOfUserHasReff = await trx.point.findUnique({
            where: {
              id: userHasReferral.id,
            },
          });

          if (pointOfUserHasReff != null) {
            await trx.point.update({
              data: {
                totalPoint:
                  (pointOfUserHasReff?.totalPoint as number) +
                  AuthController.REFERRER_POINTS,
              },
              where: {
                id: pointOfUserHasReff?.id,
              },
            });
          } else {
            // create point for referred user
            await trx.point.create({
              data: {
                totalPoint: AuthController.REFERRER_POINTS,
                validUntil: this.couponExpired(),
                invitedId: newUserRegister.id as string,
                user: {
                  connect: {
                    id: userHasReferral.id,
                  },
                },
              },
            });
          }
        });
      } else {
        // register without reff
        await prisma.user.create({
          data: {
            name,
            email,
            password: hashedPassword,
            role,
            referralCode,
          },
        });
      }

      const successfullRegistedUser = await prisma.user.findUnique({
        where: {
          email,
        },
        omit: {
          password: true,
        },
      });

      if (!successfullRegistedUser)
        throw new Error("User registration failed.");

      const token = signToken({
        email: successfullRegistedUser.email,
      });

      console.log(token)

      await sendEmail(
        username_nodemailer,
        password_nodemailer,
        successfullRegistedUser.email,
        token,
        "verifyUser"
      );

      res.status(201).send({
        message: "Please verify your email to activate account",
        data: successfullRegistedUser,
      });
    } catch (error) {
      next(error);
    }
  }

  async loginUser(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, password } = req.body;

      const existUser = await findByEmail(email);
      if (!existUser) throw new Error("Email or Password is wrong !");
      else if (existUser.isVerified == false)
        throw new Error("Please verify your account !!");

      const isValidPassword = await bcrypt.compare(
        password,
        existUser.password
      );

      console.log("here2");
      if (!isValidPassword) throw new Error("Email or Password is wrong !");
      const token = signToken({
        id: existUser.id,
        role: existUser.role,
        email: existUser.email,
      });

      res.status(200).send({
        message: "succes",
        token,
      });
    } catch (error) {
      next(error);
    }
  }

  async forgotPassword(req: Request, res: Response, next: NextFunction) {
    try {
      const { email } = req.body;

      // const jwtToken = localStorage.getItem(token as string)
      const userExist = await findByEmail(email);
      if (!userExist)
        throw new Error("Email is not registered in this application !!");
      else if (userExist.isVerified == false)
        throw new Error("Please verify your account !!");

      const token = signToken({
        email: userExist.email,
      });

      // console.log(token);

      await sendEmail(
        username_nodemailer,
        password_nodemailer,
        userExist.email,
        token,
        "resetPassword"
      );

      res.status(200).send({
        message: `Email forgot-password sent to ${userExist.email}`,
      });

      // const userInSession = await this.findByEmail(email)
    } catch (error) {
      next(error);
    }
  }

  async resetPassword(req: Request, res: Response, next: NextFunction) {
    try {
      const { token } = req.params;
      const { password, confirmPassword } = req.body;
      if (!token) throw new Error("Token is required");

      const decodedToken = verify(token, jwt_secret) as { email: string };

      const hashedPassword = await bcrypt.hash(
        password,
        AuthController.SALT_ROUND
      );

      await prisma.user.update({
        data: {
          email: decodedToken.email,
          password: hashedPassword,
        },
        where: {
          email: decodedToken.email,
        },
      });

      res.status(200).send({
        message: "Password has been reset successfully !!",
      });
    } catch (error) {
      next(error);
    }
  }

  async verifyEmail(req: Request, res: Response, next: NextFunction) {
    try {
      const { token } = req.params;

      const decodedToken = verify(token, jwt_secret) as { email: string };
      const userExist = await findByEmail(decodedToken.email);
      if (!userExist) throw new Error("Invalid verification link");

      await prisma.user.update({
        data: {
          isVerified: true,
        },
        where: {
          email: decodedToken.email,
        },
      });
      res.status(200).send({
        message: "Your account is verified",
      });
    } catch (error) {
      next();
    }
  }
}
