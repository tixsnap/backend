import * as jwt from "jsonwebtoken";

type Payload = {
  id?: string;
  email?: string;
  role?: string;
};

export const signToken = (payload: Payload) => {
  return jwt.sign(payload, process.env.JWT_SECRET as string, {
    expiresIn: "3200s",
  });
};
