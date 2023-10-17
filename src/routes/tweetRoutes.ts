import { Router } from "express";

const router = Router();

//create a tweet
router.post("/", (req, res) => {
  res.send("create a tweet");
});

export default router;
