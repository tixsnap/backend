import { prisma } from "../config";

export const findByReferral = async (referralCode: string) =>
  await prisma.user.findUnique({
    where: {
      referralCode,
    },
  });

export const findByEmail = async (email: string) =>
  await prisma.user.findUnique({
    where: {
      email,
    },
  });
