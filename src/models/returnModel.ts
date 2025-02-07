import pool from "../config/database";

export interface ReturnItem {
    return_item_id?: number;
    return_id: number;
    product_id: number;
    quantity: number;
    ordered_item_id: number;
    reason: string;
    status: string;
    created_at?: Date;
}

export interface Return {
    return_id?: number;
    user_id: number;
    total_returned_quantity: number;
    return_reason: string;
    status: string;
    order_id: number;
    created_at?: Date;
}

export const createReturnRequest = async (returnRequest: Return, returnItems: ReturnItem[]) => {
    try {
        const { user_id, return_reason, order_id } = returnRequest;

        // Check if the order exists and belongs to the user
        const orderCheck = await pool.query(
            `SELECT status FROM orders WHERE order_id = $1 AND user_id = $2`,
            [order_id, user_id]
        );

        if (orderCheck.rowCount === 0) {
            return { error: true, message: "Order not found or does not belong to this user.", data: null };
        }

        if (orderCheck.rows[0].status !== "Delivered") {
            return { error: true, message: "Order must be delivered before a return request can be created.", data: null };
        }

        // Create the return request
        const result = await pool.query(
            `INSERT INTO returns (user_id, return_reason, status, order_id, created_at)
             VALUES ($1, $2, 'Pending', $3, NOW()) RETURNING *`,
            [user_id, return_reason, order_id]
        );

        const returnId = result.rows[0].return_id;

        // Validate return items
        if (returnItems.length === 0) {
            return { error: true, message: "At least one return item must be provided.", data: null };
        }

        for (const item of returnItems) {
            const { product_id, quantity, reason, ordered_item_id } = item;

            if (quantity <= 0 || !reason) {
                return { error: true, message: "Invalid return item: Quantity must be greater than zero and reason must be provided.", data: null };
            }

            // Check if the order item exists and validate quantity
            const orderItemCheck = await pool.query(
                `SELECT quantity AS ordered_quantity FROM ordereditems WHERE ordered_item_id = $1 AND order_id = $2`,
                [ordered_item_id, order_id]
            );

            if (orderItemCheck.rowCount === 0) {
                return { error: true, message: `Ordered item ID ${ordered_item_id} not found in this order.`, data: null };
            }

            if (quantity > orderItemCheck.rows[0].ordered_quantity) {
                return { error: true, message: `Returned quantity cannot exceed ordered quantity (${orderItemCheck.rows[0].ordered_quantity}).`, data: null };
            }

            // Insert return item
            await pool.query(
                `INSERT INTO returnitems (return_id, product_id, quantity, reason, ordered_item_id, created_at)
                 VALUES ($1, $2, $3, $4, $5, NOW())`,
                [returnId, product_id, quantity, reason, ordered_item_id]
            );
        }

        return { error: false, message: "Return request created successfully", data: { returnId } };

    } catch (error) {
        console.error("Error creating return request:", error);
        return { error: true, message: "Failed to create return request", data: null };
    }
};

// Get all return requests (Admin)
export const getAllReturns = async () => {
    try {
        const result = await pool.query(`SELECT * FROM returns ORDER BY created_at DESC`);
        return { error: false, message: "All return requests retrieved successfully", data: result.rows };
    } catch (error) {
        console.error("Error fetching returns:", error);
        return { error: true, message: "Failed to fetch return requests", data: null };
    }
};

// Get return details by return ID
export const getReturnDetails = async (return_id: number) => {
    try {
        const result = await pool.query(`SELECT * FROM returnitems WHERE return_id = $1`, [return_id]);

        if (result.rowCount === 0) {
            return { error: true, message: "No return items found for this return ID", data: null };
        }

        return { error: false, message: "Return details retrieved successfully", data: result.rows };
    } catch (error) {
        console.error("Error fetching return details:", error);
        return { error: true, message: "Failed to fetch return details", data: null };
    }
};

// Update return request status (Admin)
export const updateReturnStatus = async (return_id: number, status: string) => {
    try {
        const returnCheck = await pool.query(`SELECT * FROM returns WHERE return_id = $1`, [return_id]);

        if (returnCheck.rowCount === 0) {
            return { error: true, message: "Return request not found", data: null };
        }

        await pool.query(`UPDATE returns SET status = $1 WHERE return_id = $2`, [status, return_id]);
        await pool.query(`UPDATE returnitems SET status = $1 WHERE return_id = $2`, [status, return_id]);

        if (status === "Approved") {
            const returnItems = await pool.query(
                `SELECT product_id, quantity FROM returnitems WHERE return_id = $1`,
                [return_id]
            );

            let totalReturnedQuantity = 0;

            for (const item of returnItems.rows) {
                const { product_id, quantity } = item;
                totalReturnedQuantity += quantity;

                await pool.query(`UPDATE products SET stock = stock + $1 WHERE product_id = $2`, [quantity, product_id]);
            }

            await pool.query(`UPDATE returns SET total_returned_quantity = $1 WHERE return_id = $2`, [totalReturnedQuantity, return_id]);
        }

        return { error: false, message: "Return status updated successfully", data: { return_id, status } };
    } catch (error) {
        console.error("Error updating return status:", error);
        return { error: true, message: "Failed to update return status", data: null };
    }
};

// Get return items for a specific return request (User)
export const getReturnItems = async (return_id: number, user_id: number) => {
    try {
        const result = await pool.query(
            `SELECT ri.* 
             FROM returnitems ri
             JOIN returns r ON ri.return_id = r.return_id
             WHERE ri.return_id = $1 AND r.user_id = $2`,
            [return_id, user_id]
        );

        if (result.rowCount === 0) {
            return { error: true, message: "No return items found for this return request", data: null };
        }

        return { error: false, message: "Return items retrieved successfully", data: result.rows };
    } catch (error) {
        console.error("Error fetching return items:", error);
        return { error: true, message: "Failed to fetch return items", data: null };
    }
};
