import { Prisma, PrismaClient, TicketType } from "@prisma/client";
import { generateRefferaCodeUser } from "../src/utils/refferal.helper";
import { v4 as uuidv4 } from "uuid";
import * as bcrypt from "bcrypt";

const prisma = new PrismaClient();

const main = async () => {
  await prisma.$connect();

  const userData: Prisma.UserCreateInput[] = [
    {
      id: uuidv4(),
      name: "gatot",
      email: "ijsamika67@gmail.com",
      password: await bcrypt.hash("Gatot123", 9),
      role: "ORGANIZER",
      isVerified: true,
      referralCode: generateRefferaCodeUser(),
    },
    {
      id: uuidv4(),
      name: "herman",
      email: "ijsamika67@gmail.com",
      password: await bcrypt.hash("Herman123", 9),
      role: "ORGANIZER",
      isVerified: true,
      referralCode: generateRefferaCodeUser(),
    },
    {
      id: uuidv4(),
      name: "hana",
      email: "hanamonik4@gmail.com",
      password: await bcrypt.hash("Hana123", 9),
      role: "CUSTOMER",
      isVerified: true,
      referralCode: generateRefferaCodeUser(),
    },
    {
      id: uuidv4(),
      name: "dina",
      email: "ainund566@gmail.com",
      password: await bcrypt.hash("Dina123", 9),
      role: "CUSTOMER",
      isVerified: true,
      referralCode: generateRefferaCodeUser(),
    },
  ];

  await prisma.user.createMany({
    data: userData,
  });

  // Fetch all organizers
  const organizers = await prisma.user.findMany({ where: { role: "ORGANIZER" } });

  // Define 10 unique events
  const eventTemplates = [
    { name: "Java Jazz Festival", category: "MUSIC", location: "Jakarta" },
    { name: "Indie Music Fest", category: "MUSIC", location: "Bandung" },
    { name: "Tech Conference 2025", category: "TECH", location: "Surabaya" },
    { name: "Startup Pitch Night", category: "BUSINESS", location: "Bali" },
    { name: "Gaming Championship", category: "GAME", location: "Yogyakarta" },
    { name: "AI & Robotics Expo", category: "TECH", location: "Jakarta" },
    { name: "Food and Culture Festival", category: "CULTURE", location: "Bandung" },
    { name: "Digital Marketing Summit", category: "BUSINESS", location: "Surabaya" },
    { name: "Photography Exhibition", category: "ART", location: "Bali" },
    { name: "E-Sports Arena", category: "GAME", location: "Yogyakarta" },
  ];

  // Shuffle events and assign 5 different events to each organizer
  function getRandomEvents() {
    const shuffled = [...eventTemplates].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, 5);
  }

  const eventData = organizers.flatMap((organizer) =>
    getRandomEvents().map((event) => ({
      id: uuidv4(),
      name: event.name,
      price: Math.floor(Math.random() * 200000) + 50000, // Random price 50K - 250K
      startDate: new Date(2025, 1, 20),
      endDate: new Date(2025, 2, 20),
      description: `${event.name} is an amazing event where enthusiasts gather to enjoy and learn.`,
      ticketOpen: Math.floor(Math.random() * 500) + 100, // Random ticket count
      ticketType: TicketType.PAID,
      category: event.category,
      location: event.location,
      userId: organizer.id, // Assign event to organizer
    }))
  );

  // Insert all events
  await prisma.event.createMany({ data: eventData });

  console.log("Seeding completed!");
};

main()
  .catch((err) => {
    console.log(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
