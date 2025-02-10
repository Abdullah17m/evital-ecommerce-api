import { executeQuery, formatResponse } from "../utils/helper";

export class UserService {
    
    // Get all users (excluding sensitive data)
    async getAllUsers() {
        const users = await executeQuery("SELECT first_name, last_name, email, role FROM users");
        return formatResponse(false, "Users retrieved successfully", users.data);
    }

    // Get user by ID
    async getUserById(userId: number) {
        const result = await executeQuery(
            "SELECT first_name, last_name, dob FROM users WHERE user_id = $1",
            [userId]
        );

        if (!result.data || result.data.length === 0) {
            return formatResponse(true, "User not found", null);
        }

        return formatResponse(false, "User retrieved successfully", result.data[0]);
    }

    // Update user details (first name, last name)
    // async updateUser(userId: number, firstName?: string, lastName?: string) {
    //     const result = await executeQuery(
    //         `UPDATE users 
    //          SET first_name = COALESCE($2, first_name), 
    //              last_name = COALESCE($3, last_name) 
    //          WHERE user_id = $1 
    //          RETURNING first_name, last_name, email, role`,
    //         [userId, firstName, lastName]
    //     );

    //     if (!result.data || result.data.length === 0) {
    //         return formatResponse(true, "User not found or no changes applied", null);
    //     }

    //     return formatResponse(false, "User updated successfully", result.data[0]);
    // }
    async updateUser(userId: number, updates: Partial<{ first_name: string; last_name: string }>) {
        try {
            if (Object.keys(updates).length === 0) {
                return formatResponse(true, "No updates provided");
            }
    
            let setClause = Object.entries(updates)
                .map(([key], index) => `${key} = $${index + 1}`)
                .join(", ");
    
            setClause += ", updated_at = NOW()"; // Add timestamp update
    
            const values = [...Object.values(updates), userId]; // Append userId for WHERE clause
    
            const query = `
                UPDATE users 
                SET ${setClause} 
                WHERE user_id = $${values.length} 
                RETURNING first_name, last_name, email, role;
            `;
    
            const result = await executeQuery(query, values);
    
            if (!result.data || result.data.length === 0) {
                return formatResponse(true, "User not found or no changes applied", null);
            }
    
            return formatResponse(false, "User updated successfully", result.data[0]);
        } catch (error: any) {
            return formatResponse(true, error.message);
        }
    }
    
}
