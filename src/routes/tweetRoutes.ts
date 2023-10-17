import { PrismaClient } from "@prisma/client";
import { Router } from "express";

const router = Router();
const prisma = new PrismaClient();

//create a tweet
router.post("/", async (req, res) => {
  const { content, image, userId } = req.body;
  try {
    const tweet = await prisma.tweet.create({
      data: {
        content,
        image,
        userId, //TODO manage based on auth user
      },
    });
    res.status(201).json(tweet);
  } catch (e) {
    res.status(400).json({ error: "something went wrong" });
  }
});

// get a tweet
router.get("/", async (req, res) => {
  try {
    const tweets = await prisma.tweet.findMany();
    res.send(tweets);
  } catch (e) {
    res.status(400).json({ error: "something went wrong" });
  }
});

// get a single tweet
router.get("/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const tweet = await prisma.tweet.findUnique({ where: { id: Number(id) } });
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
