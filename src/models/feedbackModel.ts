import pool from "../config/database";

export interface Feedback {
    feedback_id?: number;
    user_id: number;
    product_id: number;
    rating: number;
    comment: string;
    created_at?: Date;
}

// Helper function to update average rating in products table
const updateProductRating = async (product_id: number) => {
    try {
        const ratingResult = await pool.query(
            `SELECT COALESCE(AVG(rating), 0) AS avg_rating FROM feedbacks WHERE product_id = $1`,
            [product_id]
        );

        const avg_rating = Number(ratingResult.rows[0].avg_rating).toFixed(2);

        await pool.query(
            `UPDATE products SET average_rating = $1 WHERE product_id = $2`,
            [avg_rating, product_id]
        );
    } catch (error) {
        console.error("Error updating product rating:", error);
    }
};

// Add Feedback
export const addFeedback = async (feedback: Feedback) => {
    try {
        const { user_id, product_id, rating, comment } = feedback;

        // Check if user has ordered the product
        const orderCheck = await pool.query(
            `SELECT oi.order_id 
             FROM ordereditems oi
             JOIN orders o ON oi.order_id = o.order_id
             WHERE oi.product_id = $1 AND o.user_id = $2 AND o.status = $3`,
            [product_id, user_id, "Delivered"]
        );

        if (orderCheck.rowCount === 0) {
            return { error: true, message: "You can only leave feedback for products you have purchased.", data: null };
        }

        // Insert Feedback
        const result = await pool.query(
            `INSERT INTO feedbacks (user_id, product_id, rating, comment, created_at)
             VALUES ($1, $2, $3, $4, NOW()) RETURNING *`,
            [user_id, product_id, rating, comment]
        );

        await updateProductRating(product_id);

        return { error: false, message: "Feedback added successfully", data: result.rows[0] };
    } catch (error) {
        console.error("Error adding feedback:", error);
        return { error: true, message: "Error adding feedback", data: null };
    }
};

// Get All Feedbacks
export const getAllFeedbacks = async () => {
    try {
        const result = await pool.query(`SELECT * FROM feedbacks ORDER BY created_at DESC`);
        return { error: false, message: "Feedbacks retrieved successfully", data: result.rows };
    } catch (error) {
        console.error("Error fetching feedbacks:", error);
        return { error: true, message: "Error fetching feedbacks", data: null };
    }
};

// Get Feedback for Specific Product
export const getProductFeedback = async (product_id: number) => {
    try {
        const result = await pool.query(
            `SELECT * FROM feedbacks WHERE product_id = $1 ORDER BY created_at DESC`,
            [product_id]
        );
        return { error: false, message: "Product feedback retrieved successfully", data: result.rows };
    } catch (error) {
        console.error("Error fetching product feedback:", error);
        return { error: true, message: "Error fetching product feedback", data: null };
    }
};

// Update Feedback (Only Author)
export const updateFeedback = async (feedback_id: number, user_id: number, rating: number, comment: string) => {
    try {
        // Check if user owns the feedback
        const feedbackCheck = await pool.query(
            `SELECT * FROM feedbacks WHERE feedback_id = $1 AND user_id = $2`,
            [feedback_id, user_id]
        );

        if (feedbackCheck.rowCount === 0) {
            return { error: true, message: "Unauthorized: You can only update your own feedback", data: null };
        }

        // Update feedback
        const result = await pool.query(
            `UPDATE feedbacks 
             SET rating = COALESCE($1, rating), comment = COALESCE($2, comment) 
             WHERE feedback_id = $3 RETURNING *`,
            [rating, comment, feedback_id]
        );

        await updateProductRating(feedbackCheck.rows[0].product_id);

        return { error: false, message: "Feedback updated successfully", data: result.rows[0] };
    } catch (error) {
        console.error("Error updating feedback:", error);
        return { error: true, message: "Error updating feedback", data: null };
    }
};

// Delete Feedback (Only Author)
export const deleteFeedback = async (feedback_id: number, user_id: number) => {
    try {
        // Check if user owns the feedback
        const feedbackCheck = await pool.query(
            `SELECT * FROM feedbacks WHERE feedback_id = $1 AND user_id = $2`,
            [feedback_id, user_id]
        );

        if (feedbackCheck.rowCount === 0) {
            return { error: true, message: "Unauthorized: You can only delete your own feedback", data: null };
        }

        const product_id = feedbackCheck.rows[0].product_id;

        // Delete feedback
        await pool.query(`DELETE FROM feedbacks WHERE feedback_id = $1`, [feedback_id]);

        await updateProductRating(product_id);

        return { error: false, message: "Feedback deleted successfully", data: null };
    } catch (error) {
        console.error("Error deleting feedback:", error);
        return { error: true, message: "Error deleting feedback", data: null };
    }
};
