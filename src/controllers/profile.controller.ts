import { Request, Response } from "express";
import { prisma } from "../config";

export async function ProfileController(req: Request, res: Response) {
  const userId = req.user?.id as string;
  const user = await prisma.profile.findUnique({
    where: {
      id: userId,
    },
  });
  res.json(user);
}

export async function GetTransaction(req: Request, res: Response) {
  const userId = req.user?.id as string;

  const transactions = await prisma.transaction.findMany({
    where: { id: userId },
  });
  res.json(transactions);
}
