import { PrismaClient } from "@prisma/client";
import { config } from "dotenv";
import { resolve } from "path";

export const NODE_ENV = process.env.NODE_ENV || "development";
const envFile = NODE_ENV === "development" ? ".env.local" : ".env";

config({ path: resolve(__dirname, `../${envFile}`), override: true });

export const PORT = process.env.PORT || 8000;

export const prisma = new PrismaClient();
export const jwt_secret = process.env.JWT_SECRET || "";
export const username_nodemailer = process.env.USERNAME_NODEMAILER || "";
export const password_nodemailer = process.env.PASSWORD_NODEMAILER || "";
export const frontend_host = process.env.FRONTEND_BASE_URL || "";
export const cloudinariy_url = process.env.CLOUDINARY_URL || "";
