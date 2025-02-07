import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import pool from "../config/database";
import dotenv from "dotenv";

dotenv.config();

interface User {
  first_name: string;
  last_name: string;
  email: string;
  password: string;
  phone_number: string;
  role?: "admin" | "customer";
  dob: string;
}

const JWT_SECRET = process.env.JWT_SECRET as string;

export const getUserByEmail = async (email: string) => {
  try {
    const { rows } = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
    return rows.length > 0 ? { error: false, message: "", data: rows[0] } : { error: true, message: "User not found", data: {} };
  } catch (error) {
    return { error: true, message: "Error fetching user", data: {} };
  }
};

export const registerUserService = async (user: User) => {
  const { first_name, last_name, email, password, phone_number, role, dob } = user;

  try {
    const existingUser = await getUserByEmail(email);

    if (existingUser.error) {
      return { error: true, message: "Email already in use", data: {} };
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert user into DB
    const newUser = await pool.query(
      `INSERT INTO users (first_name, last_name, email, password, phone_number, role, dob) 
       VALUES ($1, $2, $3, $4, $5, $6, $7) 
       RETURNING user_id, first_name, last_name, email, phone_number, role, dob`,
      [first_name, last_name, email, hashedPassword, phone_number, role, dob]
    );

    return { error: false, message: "User registered successfully", data: newUser.rows[0] };
  } catch (error) {
    return { error: true, message: "Error registering user", data: {} };
  }
};

export const loginUserService = async (email: string, password: string) => {
  try {
    const user = await getUserByEmail(email);

    if (user.error) {
      return { error: true, message: "Invalid email or password", data: {} };
    }

    const isMatch = await bcrypt.compare(password, user.data.password);

    if (!isMatch) {
      return { error: true, message: "Invalid email or password", data: {} };
    }

    const token = jwt.sign({ userId: user.data.user_id, email, role: user.data.role }, JWT_SECRET, { expiresIn: "1h" });

    return { error: false, message: "Login successful", data: { token, user: user.data } };
  } catch (error) {
    return { error: true, message: "Error logging in", data: {} };
  }
};

export const getProfileService = async (userId: number) => {
  try {
    const { rows } = await pool.query("SELECT first_name, last_name, email, phone_number, dob FROM users WHERE user_id = $1", [userId]);

    if (rows.length === 0) {
      return { error: true, message: "User not found", data: {} };
    }

    return { error: false, message: "Profile fetched successfully", data: rows[0] };
  } catch (error) {
    return { error: true, message: "Error fetching user profile", data: {} };
  }
};
