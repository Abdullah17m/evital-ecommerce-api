// import bcrypt from "bcrypt";
// import jwt from "jsonwebtoken";
// import dotenv from "dotenv";
// import { executeQuery, formatResponse } from "../utils/helper";

// dotenv.config();

// const JWT_SECRET = process.env.JWT_SECRET as string;

// class UserService {
//     // Get user by email
//     private async getUserByEmail(email: string) {
//         const result = await executeQuery("SELECT * FROM users WHERE email = $1", [email]);
//         return result.error || result.data.length === 0
//             ? formatResponse(true, "User not found")
//             : formatResponse(false, "", result.data[0]);
//     }

//     // Register a new user
//     public async registerUser(user: {
//         first_name: string;
//         last_name: string;
//         email: string;
//         password: string;
//         phone_number: string;
//         role?: "admin" | "customer";
//         dob: string;
//     }) {
//         const { first_name, last_name, email, password, phone_number, role, dob } = user;

//         const existingUser = await this.getUserByEmail(email);
//         if (!existingUser.error) {
//             return formatResponse(true, "Email already in use");
//         }

//         const hashedPassword = await bcrypt.hash(password, 10);
//         const query = `
//             INSERT INTO users (first_name, last_name, email, password, phone_number, role, dob) 
//             VALUES ($1, $2, $3, $4, $5, $6, $7) 
//             RETURNING user_id, first_name, last_name, email, phone_number, role, dob
//         `;
//         const values = [first_name, last_name, email, hashedPassword, phone_number, role, dob];

//         const result = await executeQuery(query, values);
//         return result.error
//             ? formatResponse(true, "Error registering user")
//             : formatResponse(false, "User registered successfully", result.data[0]);
//     }

//     // User login
//     public async loginUser(email: string, password: string) {
//         const user = await this.getUserByEmail(email);

//         if (user.error) return formatResponse(true, "Invalid email or password");

//         const isMatch = await bcrypt.compare(password, user.data.password);
//         if (!isMatch) return formatResponse(true, "Invalid email or password");

//         const token = jwt.sign({ userId: user.data.user_id, email, role: user.data.role }, JWT_SECRET, {
//             expiresIn: "1h",
//         });

//         return formatResponse(false, "Login successful", { token, user: user.data });
//     }

//     // Get user profile
//     public async getProfile(userId: number) {
//         const result = await executeQuery(
//             "SELECT first_name, last_name, email, phone_number, dob FROM users WHERE user_id = $1",
//             [userId]
//         );

//         return result.error || result.data.length === 0
//             ? formatResponse(true, "User not found")
//             : formatResponse(false, "Profile fetched successfully", result.data[0]);
//     }
// }

// export default UserService;


import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { executeQuery, formatResponse } from "../utils/helper";

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET as string;

class UserService {
    // Fetch user details by email
    private async getUserByEmail(email: string) {
        const result = await executeQuery("SELECT * FROM users WHERE email = $1", [email]);
        return result.error || result.data.length === 0
            ? formatResponse(true, "User not found")
            : formatResponse(false, "", result.data[0]);
    }

    // Register a new user
    public async registerUser(user: {
        first_name: string;
        last_name: string;
        email: string;
        password: string;
        phone_number: string;
        role?: "admin" | "customer";
        dob: string;
    }) {
        const { first_name, last_name, email, password, phone_number, role, dob } = user;

        // Check if email is already registered
        const existingUser = await this.getUserByEmail(email);
        if (!existingUser.error) {
            return formatResponse(true, "Email already in use");
        }

        // Hash the password before saving
        const hashedPassword = await bcrypt.hash(password, 10);

        // Insert user into the database
        const query = `
            INSERT INTO users (first_name, last_name, email, password, phone_number, role, dob) 
            VALUES ($1, $2, $3, $4, $5, $6, $7) 
            RETURNING user_id, first_name, last_name, email, phone_number, role, dob
        `;
        const values = [first_name, last_name, email, hashedPassword, phone_number, role, dob];

        const result = await executeQuery(query, values);
        return result.error
            ? formatResponse(true, "Error registering user")
            : formatResponse(false, "User registered successfully", result.data[0]);
    }

    // Authenticate user login
    public async loginUser(email: string, password: string) {
        const user = await this.getUserByEmail(email);

        if (user.error) return formatResponse(true, "Invalid email or password");

        // Compare entered password with stored hashed password
        const isMatch = await bcrypt.compare(password, user.data.password);
        if (!isMatch) return formatResponse(true, "Invalid email or password");

        // Generate JWT token
        const token = jwt.sign(
            { userId: user.data.user_id, email, role: user.data.role }, 
            JWT_SECRET, 
            { expiresIn: "1h" }
        );

        return formatResponse(false, "Login successful", { token, user: user.data });
    }

    // Get user profile by ID
    public async getProfile(userId: number) {
        const result = await executeQuery(
            "SELECT first_name, last_name, email, phone_number, dob FROM users WHERE user_id = $1",
            [userId]
        );

        return result.error || result.data.length === 0
            ? formatResponse(true, "User not found")
            : formatResponse(false, "Profile fetched successfully", result.data[0]);
    }
}

export default UserService;
