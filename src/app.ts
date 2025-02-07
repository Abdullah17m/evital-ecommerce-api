import express from "express";

import index from "./routes/index";

import dotenv from "dotenv";
dotenv.config(); 
const app = express();
app.use(express.json());
app.use("/api", index);


app.listen(3000, async () => {
  console.log("Server started on port 3000");
});