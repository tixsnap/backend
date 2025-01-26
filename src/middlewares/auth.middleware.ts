import { NextFunction, Request, Response } from "express";
import { verify } from "jsonwebtoken";
import { UserLogin } from "../interfaces/auth.interface";
import { jwt_secret } from "../config";

export const verifyToken = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { authorization } = req.headers;
    const token = authorization?.split("Bearer ")[1];

    const decodedToken = verify(token as string, jwt_secret) as {
      id: string;
      email: string;
      role: string;
    };
    if (!decodedToken) throw new Error("Unauthorized");
    req.user = decodedToken as UserLogin;

    next();
  } catch (error) {
    next(error);
  }
};

export const verifyRole = (req: Request, res: Response, next: NextFunction) => {
  try {
    const { authorization } = req.headers;
    const token = String(authorization || "").split("Bearer ")[1];

    const decoded = verify(token, jwt_secret) as { role: string };
    console.log(decoded.role);
    if (decoded.role != "ORGANIZER")
      throw new Error("The resources are not allowed !!");

    next();
  } catch (error) {
    next(error);
  }
};
