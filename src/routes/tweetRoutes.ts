import { PrismaClient } from "@prisma/client";
import { Router } from "express";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "./authRoutes";

const router = Router();
const prisma = new PrismaClient();

//create a tweet
router.post("/", async (req, res) => {
  const { content } = req.body;
  // @ts-ignore
  const user = req.user;
  const userId = user.id;
  try {
    const tweet = await prisma.tweet.create({
      data: {
        content,
        userId, //TODO manage based on auth user
      },
    });
    res.status(201).json(tweet);
  } catch (e) {
    res.status(400).json({ error: "something went wrong" });
  }
});

// get all tweet
router.get("/", async (req, res) => {
  try {
    const tweets = await prisma.tweet.findMany({
      include: {
        user: { select: { id: true, name: true, username: true, image: true } },
      },
    });
    res.send(tweets);
  } catch (e) {
    res.status(400).json({ error: "something went wrong" });
  }
});

// get a single tweet
router.get("/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const tweet = await prisma.tweet.findUnique({
      where: { id: Number(id) },
      include: { user: true },
    });
    if (!tweet) {
      return res.status(404).json({ error: "Tweet Not found" });
    }
    res.send(tweet);
  } catch (e) {
    res.status(400).json({ error: "something went wrong" });
  }
});
// delete a tweet
router.delete("/:id", async (req, res) => {
  const { id } = req.params;
  await prisma.tweet.delete({ where: { id: Number(id) } });
  res.status(200);
});
export default router;
