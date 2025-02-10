import pool from "../config/database";

export const executeQuery = async (query: string, params: any[] = []) => {
    try {
        const result = await pool.query(query, params);
        return {error:false, message:"Query executed successfully", data:result.rows};
    } catch (error) {
        console.error("Database query error:", error);
        return formatResponse(true, "Database error", null);
    }
};

export const formatResponse = (error: boolean, message: string, data: any= {}) => {
    return { error, message, data };
};
