import express from "express";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

const PORT = process.env.HTTP_PORT || 3001;

app.get("/", (req, res) => {
  res.send("Hello World! From Http Server");
});

app.listen(PORT, () => {
  console.log(`Http Server is running on port ${PORT}`);
});
