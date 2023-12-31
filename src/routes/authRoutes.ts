import { PrismaClient } from "@prisma/client";
import { Router } from "express";
import jwt from "jsonwebtoken";
import sendMail from "../nodemailer";

const EMAIL_TOKEN_EXPIRATION_MINUTES = 10;
const AUTHENTICATION_EXPIRATION_HOURS = 12;
export const JWT_SECRET = process.env.JWT_SECRET || "Super secret";

const router = Router();
const prisma = new PrismaClient();
//generate a random 8 digit number as email token
function generateEmailToken(): string {
  return Math.floor(100000000 + Math.random() * 900000000).toString();
}
function generateAuthToken(tokenId: number): string {
  const jwtPayload = { tokenId };
  return jwt.sign(jwtPayload, JWT_SECRET, {
    algorithm: "HS256",
    noTimestamp: true,
  });
}
//create a user if it doesnt exits
//generate the emailtoken and send it to their email
router.post("/login", async (req, res) => {
  const { email } = req.body;

  //generate a token
  const emailToken = generateEmailToken();
  const expiration = new Date(
    new Date().getTime() + EMAIL_TOKEN_EXPIRATION_MINUTES * 60 * 1000
  );
  try {
    const createdToken = await prisma.token.create({
      data: {
        type: "EMAIL",
        emailToken,
        expiration,
        user: {
          connectOrCreate: {
            where: { email },
            create: { email },
          },
        },
      },
    });
    console.log(createdToken);

    sendMail(email, emailToken);
    res.sendStatus(200);
  } catch (e) {
    res.status(400).json({ error: "Something went wrong" });
  }
});

//validate the emailtoken
//generate a long lived JWT token
router.post("/authenticate", async (req, res) => {
  const { email, emailToken } = req.body;
  try {
    const dbEmailToken = await prisma.token.findUnique({
      where: {
        emailToken,
      },
      include: { user: true },
    });
    if (!dbEmailToken || !dbEmailToken.valid) {
      return res.sendStatus(401);
    }
    if (dbEmailToken.expiration < new Date()) {
      return res.status(401).json({ error: "Token expired" });
    }
    if (dbEmailToken?.user?.email !== email) {
      return res.sendStatus(401);
    }
    const expiration = new Date(
      new Date().getTime() + AUTHENTICATION_EXPIRATION_HOURS * 60 * 60 * 1000
    );
    //generate an API token
    const apiToken = await prisma.token.create({
      data: {
        type: "API",
        expiration,
        user: {
          connect: {
            email,
          },
        },
      },
    });

    //Invalidate the email
    await prisma.token.update({
      where: { id: dbEmailToken.id },
      data: { valid: false },
    });

    //generate the token
    const authToken = generateAuthToken(apiToken.id);
    res.json({ authToken });
  } catch (e) {
    res.status(400).json({ error: "Something went wrong" });
  }
});
export default router;
