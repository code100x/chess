import { Router } from "express";

const v1Router = Router();


v1Router.get("/", (req, res) => {
  res.send("Hello, World!");
});

export default v1Router;