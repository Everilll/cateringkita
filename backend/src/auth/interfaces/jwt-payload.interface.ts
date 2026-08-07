import { Role } from "generated/prisma/client";

export interface JwtPayload {
  sub: string; // User.id
  email: string;
  role: Role;
}
