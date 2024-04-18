import express from "express";
import dotenv from "dotenv";

dotenv.config();
const app = express();
const PORT = process.env.PORT;

app.get("/", (req, res) => {
  res.send("Server is ok im fine");
});

app.listen(PORT, () => {
  console.log(`Server is runing on port ${PORT}`);
});
