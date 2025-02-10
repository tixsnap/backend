import { Prisma, PrismaClient } from "@prisma/client";
import { generateRefferaCodeUser } from "../src/utils/refferal.helper";
import { v4 as uuidv4 } from "uuid";
import * as bcrypt from "bcrypt";

const prisma = new PrismaClient();

const main = async () => {
  await prisma.$connect();

  const data: Prisma.UserCreateInput[] = [
    {
      id: uuidv4(),
      name: "bone",
      email: "bone123@gmail.com",
      password: await bcrypt.hash("Bone123", 9),
      role: "CUSTOMER",
      referralCode: generateRefferaCodeUser(),
    },
    {
      id: uuidv4(),
      name: "hand",
      email: "hand123@gmail.com",
      password: await bcrypt.hash("Hand1234", 9),
      role: "ORGANIZER",
      referralCode: generateRefferaCodeUser(),
    },
  ];

  await prisma.user.createMany({
    data,
  });
};

main()
  .catch((err) => {
    console.log(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
