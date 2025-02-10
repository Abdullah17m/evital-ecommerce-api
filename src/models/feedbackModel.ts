import { executeQuery, formatResponse } from "../utils/helper";

export class FeedbackService {
    
    // Helper function to update average rating in products table
    private async updateProductRating(product_id: number) {
        try {
            const ratingResult = await executeQuery(
                `SELECT COALESCE(AVG(rating), 0) AS avg_rating FROM feedbacks WHERE product_id = $1`,
                [product_id]
            );

            const avg_rating = Number(ratingResult.data.rows[0].avg_rating).toFixed(2);

            await executeQuery(
                `UPDATE products SET average_rating = $1 WHERE product_id = $2`,
                [avg_rating, product_id]
            );
        } catch (error) {
            console.error("Error updating product rating:", error);
        }
    }

    // Add Feedback
    async add(feedback: { user_id: number; product_id: number; rating: number; comment: string }) {
        try {
            const { user_id, product_id, rating, comment } = feedback;

            // Ensure user has purchased and received the product before leaving feedback
            const orderCheck = await executeQuery(
                `SELECT oi.order_id 
                 FROM ordereditems oi
                 JOIN orders o ON oi.order_id = o.order_id
                 WHERE oi.product_id = $1 AND o.user_id = $2 AND o.status = $3`,
                [product_id, user_id, "Delivered"]
            );

            if (orderCheck.data.rowCount === 0) {
                return formatResponse(true, "You can only leave feedback for products you have purchased.");
            }

            // Insert Feedback
            const result = await executeQuery(
                `INSERT INTO feedbacks (user_id, product_id, rating, comment, created_at)
                 VALUES ($1, $2, $3, $4, NOW()) RETURNING *`,
                [user_id, product_id, rating, comment]
            );

            await this.updateProductRating(product_id);

            return formatResponse(false, "Feedback added successfully", result.data.rows[0]);
        } catch (error: any) {
            return formatResponse(true, error.message);
        }
    }

    // Get All Feedbacks
    async getAll() {
        try {
            const result = await executeQuery(`SELECT * FROM feedbacks ORDER BY created_at DESC`);
            return formatResponse(false, "Feedbacks retrieved successfully", result.data.rows);
        } catch (error: any) {
            return formatResponse(true, error.message);
        }
    }

    // Get Feedback for a Specific Product
    async getByProduct(product_id: number) {
        try {
            const result = await executeQuery(
                `SELECT * FROM feedbacks WHERE product_id = $1 ORDER BY created_at DESC`,
                [product_id]
            );
            return formatResponse(false, "Product feedback retrieved successfully", result.data.rows);
        } catch (error: any) {
            return formatResponse(true, error.message);
        }
    }

    // Update Feedback (Only Author)
    // async update(feedback_id: number, user_id: number, rating?: number, comment?: string) {
    //     try {
    //         // Check if user owns the feedback
    //         const feedbackCheck = await executeQuery(
    //             `SELECT product_id FROM feedbacks WHERE feedback_id = $1 AND user_id = $2`,
    //             [feedback_id, user_id]
    //         );

    //         if (feedbackCheck.data.rowCount === 0) {
    //             return formatResponse(true, "Unauthorized: You can only update your own feedback");
    //         }

    //         // Update feedback
    //         const result = await executeQuery(
    //             `UPDATE feedbacks 
    //              SET rating = COALESCE($1, rating), comment = COALESCE($2, comment) 
    //              WHERE feedback_id = $3 RETURNING *`,
    //             [rating, comment, feedback_id]
    //         );

    //         await this.updateProductRating(feedbackCheck.data.rows[0].product_id);

    //         return formatResponse(false, "Feedback updated successfully", result.data.rows[0]);
    //     } catch (error: any) {
    //         return formatResponse(true, error.message);
    //     }
    // }

    async update(feedback_id: number, user_id: number, updates: Partial<{ rating: number; comment: string }>) {
        try {
            // Check if user owns the feedback
            const feedbackCheck = await executeQuery(
                `SELECT product_id FROM feedbacks WHERE feedback_id = $1 AND user_id = $2`,
                [feedback_id, user_id]
            );
    
            if (feedbackCheck.data.rowCount === 0) {
                return formatResponse(true, "Unauthorized: You can only update your own feedback");
            }
    
            // Extract keys and values from the updates object
            const entries = Object.entries(updates);
            if (entries.length === 0) {
                return formatResponse(true, "No updates provided");
            }
    
            // Create dynamic SET clause
            const setClause = entries.map(([key], index) => `${key} = $${index + 1}`).join(", ");
            const values = entries.map(([, value]) => value);
            values.push(feedback_id); // Add feedback_id as the last parameter
    
            // Construct SQL query
            const query = `
                UPDATE feedbacks 
                SET ${setClause} 
                WHERE feedback_id = $${values.length} 
                RETURNING *;
            `;
    
            // Execute update query
            const result = await executeQuery(query, values);
    
            if (result.data.rowCount === 0) {
                return formatResponse(true, "Feedback not found or not updated");
            }
    
            // Update product rating after feedback update
            await this.updateProductRating(feedbackCheck.data.rows[0].product_id);
    
            return formatResponse(false, "Feedback updated successfully", result.data.rows[0]);
        } catch (error: any) {
            return formatResponse(true, error.message);
        }
    }
    

    // Delete Feedback (Only Author)
    async delete(feedback_id: number, user_id: number) {
        try {
            const feedbackCheck = await executeQuery(
                `SELECT product_id FROM feedbacks WHERE feedback_id = $1 AND user_id = $2`,
                [feedback_id, user_id]
            );

            if (feedbackCheck.data.rowCount === 0) {
                return formatResponse(true, "Unauthorized: You can only delete your own feedback");
            }

            const product_id = feedbackCheck.data.rows[0].product_id;

            // Delete feedback
            await executeQuery(`DELETE FROM feedbacks WHERE feedback_id = $1`, [feedback_id]);

            await this.updateProductRating(product_id);

            return formatResponse(false, "Feedback deleted successfully");
        } catch (error: any) {
            return formatResponse(true, error.message);
        }
    }
}
