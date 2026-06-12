import express from "express";
import type { Request, Response } from 'express';
import dotenv from "dotenv";
import cors from "cors";

dotenv.config();

const app = express();
app.use(cors()); // clave del front
app.use(express.json()); 


app.get("/", (_req: Request, res: Response) => {
  res.send("API funcionando 🚀");
});

app.listen(process.env.PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${process.env.PORT}`);
});