
import { prisma } from "../config";

export const findEventByName = async (name: string) =>
  await prisma.event.findUnique({
    where: {
      name,
      isDeleted: false
    },
  });

  export const findById = async (id: string, userId: string) => {
    return await prisma.event.findUnique({
      where: {
          id, 
          userId,
          isDeleted: false
      },
  })  
  }

  

export const formatIdr = (price: number) => {
  return new Intl.NumberFormat('id-ID', {style: 'currency', 'currency': 'IDR'}).format(price)
}