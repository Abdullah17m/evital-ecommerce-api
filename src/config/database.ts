

import { Pool } from "pg";
import dotenv from "dotenv";

dotenv.config(); 

const pool = new Pool({
  host: process.env.DB_HOST,        
  port: Number(process.env.DB_PORT),               
  user: process.env.DB_USER,   
  password: String(process.env.DB_PASSWORD), 
  database: process.env.DB_NAME, 
  max: Number(process.env.DB_MAX_CONNECTIONS) || 10,
});


pool.on("connect", async (client) => {
  console.log("Connected to PostgreSQL");
  await client.query('SET search_path TO public');
});

pool.on("error", (err) => {
  console.error("PostgreSQL Connection Error:", err);
  process.exit(1);
});

export default pool;
