import { executeQuery, formatResponse } from "../utils/helper";
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

export class ReturnService {
    private dbClient = pool;

    async createReturnRequest(returnRequest: Return, returnItems: ReturnItem[]) {
        const { user_id, return_reason, order_id } = returnRequest;
        const client = await this.dbClient.connect();

        try {
            await client.query("BEGIN");

            // Check if order exists and is delivered
            const orderCheck = await client.query(
                `SELECT status FROM orders WHERE order_id = $1 AND user_id = $2`,
                [order_id, user_id]
            );

            if (!orderCheck.rows.length) {
                return formatResponse(true, "Order not found or does not belong to this user.", null);
            }

            if (orderCheck.rows[0].status !== "Delivered") {
                return formatResponse(true, "Order must be delivered before a return request can be created.", null);
            }

            if (returnItems.length === 0) {
                return formatResponse(true, "At least one return item must be provided.", null);
            }

            // Insert return request
            const returnResult = await client.query(
                `INSERT INTO returns (user_id, return_reason, status, order_id, created_at)
                 VALUES ($1, $2, 'Pending', $3, NOW()) RETURNING return_id`,
                [user_id, return_reason, order_id]
            );

            const returnId = returnResult.rows[0].return_id;

            for (const item of returnItems) {
                const { product_id, quantity, reason, ordered_item_id } = item;

                if (quantity <= 0 || !reason) {
                    return formatResponse(true, "Invalid return item: Quantity must be greater than zero and reason must be provided.", null);
                }

                // Check if the product was actually ordered by the user
                const orderItemCheck = await client.query(
                    `SELECT current_quantity FROM ordereditems 
                     WHERE ordered_item_id = $1 AND order_id = $2 AND product_id = $3`,
                    [ordered_item_id, order_id, product_id]
                );

                if (!orderItemCheck.rows.length) {
                    return formatResponse(true, "Invalid return item: Product was not ordered by this user.", null);
                }

                if (quantity > orderItemCheck.rows[0].current_quantity) {
                    return formatResponse(true, `Returned quantity cannot exceed current quantity (${orderItemCheck.rows[0].current_quantity}).`, null);
                }

                // Insert return item
                await client.query(
                    `INSERT INTO returnitems (return_id, product_id, quantity, reason, ordered_item_id, created_at)
                     VALUES ($1, $2, $3, $4, $5, NOW())`,
                    [returnId, product_id, quantity, reason, ordered_item_id]
                );
            }

            await client.query("COMMIT");
            return formatResponse(false, "Return request created successfully", { returnId });
        } catch (error) {
            await client.query("ROLLBACK");
            return formatResponse(true, "Failed to create return request", null);
        } finally {
            client.release();
        }
    }

    async getAllReturns() {
        return await executeQuery(`SELECT * FROM returns ORDER BY created_at DESC`);
    }

    async getReturnDetails(return_id: number) {
        const result = await executeQuery(`SELECT * FROM returnitems WHERE return_id = $1`, [return_id]);

        if (!result.data || result.data.length === 0) {
            return formatResponse(true, "No return items found for this return ID", null);
        }

        return formatResponse(false, "Return details retrieved successfully", result.data);
    }

    async updateReturnStatus(return_id: number, status: string) {
        // Check if return request exists
        const returnCheck = await executeQuery(`SELECT * FROM returns WHERE return_id = $1`, [return_id]);

        if (!returnCheck.data || returnCheck.data.length === 0) {
            return formatResponse(true, "Return request not found", null);
        }

        // Update status of return request and return items
        await executeQuery(`UPDATE returns SET status = $1 WHERE return_id = $2`, [status, return_id]);
        await executeQuery(`UPDATE returnitems SET status = $1 WHERE return_id = $2`, [status, return_id]);

        if (status === "Approved") {
            // Fetch return items
            const returnItems = await executeQuery(
                `SELECT product_id, quantity, ordered_item_id FROM returnitems WHERE return_id = $1`,
                [return_id]
            );

            let totalReturnedQuantity = 0;

            for (const item of returnItems.data) {
                const { product_id, quantity, ordered_item_id } = item;
                totalReturnedQuantity += quantity;

                // Update product stock
                await executeQuery(`UPDATE products SET stock = stock + $1 WHERE product_id = $2`, [quantity, product_id]);

                // Update current_quantity in ordered_items
                await executeQuery(`UPDATE ordereditems SET current_quantity = current_quantity - $1 WHERE ordered_item_id = $2`, [quantity, ordered_item_id]);
            }

            // Update total returned quantity in returns table
            await executeQuery(`UPDATE returns SET total_returned_quantity = $1 WHERE return_id = $2`, [totalReturnedQuantity, return_id]);
        }

        return formatResponse(false, "Return status updated successfully", { return_id, status });
    }

    async getReturnItems(return_id: number, user_id: number) {
        const result = await executeQuery(
            `SELECT 
                ri.return_item_id,
                ri.ordered_item_id,
                ri.quantity,
                ri.product_id,
                p.name AS product_name,
                ri.reason,
                r.return_id,
                r.status
             FROM returnitems ri
             JOIN returns r ON ri.return_id = r.return_id
             JOIN products p ON ri.product_id = p.product_id
             WHERE ri.return_id = $1 AND r.user_id = $2`,
            [return_id, user_id]
        );

        if (!result.data || result.data.length === 0) {
            return formatResponse(true, "No return items found for this return request", null);
        }

        const { return_id: returnId, status } = result.data[0];

        const items = result.data.map((item: any) => ({
            return_item_id: item.return_item_id,
            order_item_id: item.ordered_item_id,
            quantity: item.quantity,
            product_id: item.product_id,
            product_name: item.product_name,
            reason: item.reason
        }));

        return formatResponse(false, "Return items retrieved successfully", {
            return_id: returnId,
            status,
            items
        });
    }
}
