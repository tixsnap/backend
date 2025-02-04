import * as jwt from "jsonwebtoken";

type Payload = {
  id?: string;
  email?: string;
  role?: string;
  name?: string;
  imageUrl?: string;
  first_name?: string;
  last_name?: string;
  referral?: string
};

export const signToken = (payload: Payload) => {
  return jwt.sign(payload, process.env.JWT_SECRET as string, {
    expiresIn: "1h",
  });
};
