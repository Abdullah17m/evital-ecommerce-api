import pool from "../config/database";

export const getAllUsersService = async () => {
    try {
        const result = await pool.query("SELECT first_name, last_name, email, role FROM users");
        
        return {
            error: false,
            message: "Users retrieved successfully",
            data: result.rows,
        };
    } catch (error) {
        console.error("Error fetching users:", error);
        return {
            error: true,
            message: "Could not retrieve users",
            data: null,
        };
    }
};

export const getUserByIdService = async (userId: number) => {
    try {
        const result = await pool.query(
            "SELECT first_name, last_name, dob FROM users WHERE user_id = $1",
            [userId]
        );

        if (result.rows.length === 0) {
            return {
                error: true,
                message: "User not found",
                data: null,
            };
        }

        return {
            error: false,
            message: "User retrieved successfully",
            data: result.rows[0],
        };
    } catch (error) {
        console.error("Error fetching user by ID:", error);
        return {
            error: true,
            message: "Could not retrieve user",
            data: null,
        };
    }
};

export const updateUserService = async (userId: number, firstName?: string, lastName?: string) => {
    try {
        const result = await pool.query(
            `UPDATE users 
             SET first_name = COALESCE($2, first_name), 
                 last_name = COALESCE($3, last_name) 
             WHERE user_id = $1 
             RETURNING first_name, last_name, email, role`,
            [userId, firstName, lastName]
        );

        if (result.rows.length === 0) {
            return {
                error: true,
                message: "User not found or no changes applied",
                data: null,
            };
        }

        return {
            error: false,
            message: "User updated successfully",
            data: result.rows[0],
        };
    } catch (error) {
        console.error("Error updating user:", error);
        return {
            error: true,
            message: "Could not update user",
            data: null,
        };
    }
};
