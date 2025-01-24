import { NextFunction, Request } from "express";
import jwt, { verify } from "jsonwebtoken";
import { UserLogin } from "../interfaces/auth.interface";

const jwt_secret = process.env.JWT_SECRET || "";

const verifyToken = (req: Request, res: Response, next: NextFunction) => {
  try {
    const { authorization } = req.headers;
    const token = String(authorization || "").split("Bearer ")[1];
    const verifiedUser = verify(token, jwt_secret);

    if (!verifiedUser) throw new Error("Unauthorized");
    req.user = verifiedUser as UserLogin;

    next();
  } catch (error) {
    next(error);
  }
};
