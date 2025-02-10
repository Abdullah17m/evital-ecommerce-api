import pool from "../config/database";
import { executeQuery, formatResponse } from "../utils/helper";

interface Order {
    order_id: number;
    user_id: number;
    address_id: number;
    cart_id: number;
    discount_id: number | null;
    total_amount: number;
    status: string;
    payment_status: string;
    payment_method: string;
    transaction_id: string | null;
    created_at: Date;
    discount_amount: number;
    net_amount: number;
}

class OrderService {
    
    async getAllUserOrders(userId: number) {
        const query = `SELECT order_id, net_amount FROM orders WHERE user_id = $1`;
        return executeQuery(query, [userId]);
    }

    async getOrdersById(userId: number, orderId: number) {
        let query = `
        SELECT order_id, total_amount, discount_amount, net_amount, status
        FROM orders WHERE order_id = $2 AND user_id = $1`;

        const result = await executeQuery(query, [userId, orderId]);
        
        if (!result.data.length) return formatResponse(true, "Order not found", {});

        query = `SELECT * FROM ordereditems WHERE order_id = $1`;
        const items = await executeQuery(query, [orderId]);
        
        result.data[0].items = items.data;
        return result;
    }

    async getAllOrders() {
        return executeQuery(`SELECT * FROM orders`);
    }

    async updateOrderStatus(orderId: number, status: string) {
        const query = `UPDATE orders SET status = $1 WHERE order_id = $2 RETURNING *`;
        const result = await executeQuery(query, [status, orderId]);

        if (!result.data.length) return formatResponse(true, "Order not found or no changes made", {});

        return formatResponse(false, "Order status updated successfully", result.data[0]);
    }

    async cancelOrder(userId: number, orderId: number) {
        try {
            await pool.query("BEGIN");

            const orderCheck = await pool.query(
                `SELECT status FROM orders WHERE order_id = $1 AND user_id = $2 FOR UPDATE`,
                [orderId, userId]
            );

            if (!orderCheck.rowCount) return formatResponse(true, "Order not found or does not belong to the user", {});
            if (orderCheck.rows[0].status === "Cancelled") return formatResponse(true, "Order is already cancelled", {});

            const orderItems = await pool.query(
                `SELECT product_id, quantity FROM ordereditems WHERE order_id = $1`,
                [orderId]
            );

            for (const { product_id, quantity } of orderItems.rows) {
                await pool.query(`UPDATE products SET stock = stock + $1 WHERE product_id = $2`, [quantity, product_id]);
            }

            const result = await pool.query(
                `UPDATE orders SET status = 'Cancelled' WHERE order_id = $1 AND user_id = $2 RETURNING *`,
                [orderId, userId]
            );

            await pool.query("COMMIT");
            return formatResponse(false, "Order cancelled successfully", result.rows[0]);
        } catch (error) {
            await pool.query("ROLLBACK");
            console.error("Error cancelling order:", error);
            return formatResponse(true, "Error cancelling order", {});
        }
    }

   

    async createUserOrder(order: { user_id: number; cart_item_ids: number[]; address_id: number; discount_id?: number; payment_method: string; payment_status: string; transaction_id?: string }) {
        try {
            await pool.query("BEGIN");
    
            const { user_id, cart_item_ids, address_id, discount_id, payment_method, payment_status, transaction_id } = order;
    
            if (cart_item_ids.length === 0) {
                return formatResponse(true, "No cart items provided");
            }
    
            // Fetch selected cart items
            const cartItemsQuery = `
                SELECT ci.cart_item_id, ci.product_id, ci.quantity, p.price, c.cart_id
                FROM cartitems ci
                JOIN products p ON ci.product_id = p.product_id
                JOIN carts c ON ci.cart_id = c.cart_id
                WHERE ci.cart_item_id = ANY($1) AND c.user_id = $2 FOR UPDATE;
            `;
            const cartItems = await pool.query(cartItemsQuery, [cart_item_ids, user_id]);
    
            if (!cartItems.rowCount) {
                return formatResponse(true, "No valid cart items found for the user");
            }
    
            // Calculate total amount
            let total_amount = 0;
            let cart_id = cartItems.rows[0].cart_id; // Since all items belong to the same cart
            for (const { quantity, price } of cartItems.rows) {
                total_amount += quantity * price;
            }
    
            let discount_amount = 0;
    
            // Apply discount if provided
            if (discount_id) {
                const discountData = await pool.query(
                    `SELECT discount_percentage FROM discounts WHERE discount_id = $1 AND expiration_date >= NOW()`,
                    [discount_id]
                );
    
                if (discountData.rows.length) {
                    const discount_percentage = Number(discountData.rows[0].discount_percentage);
                    discount_amount = (discount_percentage / 100) * total_amount;
                } else {
                    return formatResponse(true, "Invalid or expired discount");
                }
            }
    
            const net_amount = total_amount - discount_amount;
    
            // Create the order
            const orderResult = await pool.query(
                `INSERT INTO orders (user_id, address_id, discount_id, total_amount, status, payment_status, payment_method, transaction_id, created_at, discount_amount, net_amount)
                 VALUES ($1, $2, $3, $4, 'Pending', $9, $5, $6, NOW(), $7, $8) RETURNING *`,
                [user_id, address_id, discount_id, total_amount, payment_method, transaction_id, discount_amount, net_amount, payment_status]
            );
    
            const orderId = orderResult.rows[0].order_id;
    
            // Process each cart item
            for (const { cart_item_id, product_id, quantity, price } of cartItems.rows) {
                // Check stock availability
                const productData = await pool.query(
                    `SELECT stock FROM products WHERE product_id = $1 FOR UPDATE`,
                    [product_id]
                );
    
                if (productData.rows[0].stock < quantity) {
                    return formatResponse(true, `Insufficient stock for product ${product_id}`);
                }
    
                // Deduct stock
                await pool.query(`UPDATE products SET stock = stock - $1 WHERE product_id = $2`, [quantity, product_id]);
    
                // Insert into ordered items
                await pool.query(
                    `INSERT INTO ordereditems (order_id, product_id, quantity, price, current_quantity) 
                     VALUES ($1, $2, $3, $4, $5)`,
                    [orderId, product_id, quantity, price, quantity]
                );
    
                // Remove processed cart items
                await pool.query(`DELETE FROM cartitems WHERE cart_item_id = $1`, [cart_item_id]);
            }
    
            // Check if cart is empty and update total amount
            const remainingCartItems = await pool.query(
                `SELECT COUNT(*) FROM cartitems WHERE cart_id = $1`,
                [cart_id]
            );
    
            if (remainingCartItems.rows[0].count === "0") {
                await pool.query(`UPDATE carts SET total_amount = 0 WHERE cart_id = $1`, [cart_id]);
            }
    
            await pool.query("COMMIT");
            return formatResponse(false, "Order created successfully", orderResult.rows[0]);
        } catch (error) {
            await pool.query("ROLLBACK");
            console.error("Error creating order:", error);
            return formatResponse(true, "Error creating order");
        }
    }
    
}

export default OrderService;