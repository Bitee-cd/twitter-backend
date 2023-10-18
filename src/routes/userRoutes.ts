import { PrismaClient } from "@prisma/client";
import { Router } from "express";

const router = Router();
const prisma = new PrismaClient();

//create user
router.post("/", async (req, res) => {
  const { email, name, username } = req.body;
  try {
    const result = await prisma.user.create({
      data: {
        email,
        name,
        username,
        bio: "Hello I am new on twitter",
      },
    });
    res.status(201).json(result);
  } catch (error) {
    console.log(error);
    res.status(400).json({ error: "Username and email should be unique" });
  }
});

//list users
router.get("/", async (req, res) => {
  const allUser = await prisma.user.findMany();
  res.json(allUser);
});

//get single user
router.get("/:id", async (req, res) => {
  const { id } = req.params;
  const user = await prisma.user.findUnique({
    where: { id: Number(id) },
    include: { tweets: true },
  });
  res.json(user);
});

//update user
router.put("/:id", async (req, res) => {
  const { id } = req.params;
  const { bio, name, image } = req.body;
  try {
    const result = await prisma.user.update({
      where: { id: Number(id) },
      data: { bio, name, image },
    });
    res.json(result);
  } catch (e) {
    res.status(400).json({ error: "Failed to update user" });
  }
});

//delete user
router.delete("/:id", async (req, res) => {
  const { id } = req.params;
  await prisma.user.delete({ where: { id: Number(id) } });
  res.sendStatus(200);
});

export default router;
