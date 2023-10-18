import { PrismaClient, User } from "@prisma/client";
import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../routes/authRoutes";

const prisma = new PrismaClient();

type AuthRequest = Request & { user?: User };
export const authenticateToken = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers["authorization"];
  const jwtToken = authHeader?.split(" ")[1];
  if (!jwtToken) {
    return res.sendStatus(401);
  }
  try {
    const payload = (await jwt.verify(jwtToken, JWT_SECRET)) as {
      tokenId: number;
    };

    const dbToken = await prisma.token.findUnique({
      where: { id: payload.tokenId },
      include: { user: true },
    });
    if (!dbToken?.valid) {
      return res.status(401).json({ error: "Api token not valid" });
    }
    if (dbToken?.expiration < new Date()) {
      return res.status(401).json({ error: "Api token expired" });
    }
    req.user = dbToken.user;
    next();
  } catch (e) {
    return res.sendStatus(401);
  }
};
