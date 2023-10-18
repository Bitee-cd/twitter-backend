import express from "express";
import userRoutes from "./routes/userRoutes";
import tweetRoutes from "./routes/tweetRoutes";
import authRoutes from "./routes/authRoutes";
import { authenticateToken } from "./middlewares/authMiddleware";

const app = express();

app.use(express.json());

app.use("/auth", authRoutes);
app.use("/user", authenticateToken, userRoutes);
app.use("/tweet", authenticateToken, tweetRoutes);

app.get("/", (req, res) => {
  res.send("Hello world");
});

app.listen(3000, () => {
  console.log("server ready at localhost:3000");
});
