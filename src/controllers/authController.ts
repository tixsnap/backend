import { NextFunction, Request, Response } from "express";
import { prisma } from "../prisma";
import { Prisma } from "@prisma/client";
import * as bcrypt from "bcrypt";

export class AuthController {
  constructor() {
    this.registerCustomer = this.registerCustomer.bind(this);
  }

  // CONST VALUE
  private static readonly SALT_ROUND = 9;
  private static readonly REFERRAL_POINTS = 5000;
  private static readonly REFERRER_POINTS = 10000;
  private static readonly COUPON_EXPIRATION = 3;

  // HELPER
  private findByReferral(reff: string) {
    return prisma.user.findUnique({
      where: {
        referralCode: reff,
      },
    });
  }
  private findByEmail(email: string) {
    return prisma.user.findUnique({
      where: {
        email,
      },
    });
  }
  private couponExpired() {
    const expirationDate = new Date();
    expirationDate.setMonth(
      expirationDate.getMonth() + AuthController.COUPON_EXPIRATION
    );
    return expirationDate;
  }
  private generateRefferaCodeUser(): string {
    const char: string = "ABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890";
    const length: number = 8;

    let result: string = "";
    for (let i = 0; i <= length; i++) {
      const randomIndex: number = Math.floor(Math.random() * char.length);
      result += char.charAt(randomIndex);
    }

    return result;
  }

  // CONTROLLER
  async registerCustomer(req: Request, res: Response, next: NextFunction) {
    try {
      const { referral, email, name, password } = req.body;

      // check user exist
      const registeredUser = await this.findByEmail(email);
      if (registeredUser) {
        throw new Error("Email has been registered !");
      }

      // generate code referral
      const referralCode: string = this.generateRefferaCodeUser();
      const hashedPassword = await bcrypt.hash(
        password,
        AuthController.SALT_ROUND
      );

      // check refferal code
      if (referral) {
        const userHasReferral = await this.findByReferral(referral);

        if (!userHasReferral) {
          throw new Error("Referral code is not found !!!");
        }

        // user register with refferal
        await prisma.$transaction(async (trx) => {
          // create registered user
          const newUserRegister: Prisma.UserCreateInput = await trx.user.create(
            {
              data: {
                email,
                name,
                password: hashedPassword,
                role: "CUSTOMER",
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
        const registerWithoutReffCode: Prisma.UserCreateInput =
          await prisma.user.create({
            data: {
              name,
              email,
              password: hashedPassword,
              role: "CUSTOMER",
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

      res.status(201).send({
        message: "success",
        data: successfullRegistedUser,
      });
    } catch (error) {
      next(error);
    }
  }
}
