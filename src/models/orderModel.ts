import pool from "../config/database";

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

// Get All Orders for a User
export const getAllUserOrders = async (userId: number) => {
    try {
        const result = await pool.query(
            `SELECT order_id, net_amount FROM orders WHERE user_id = $1`,
            [userId]
        );
        return { error: false, message: "User orders retrieved successfully", data: result.rows };
    } catch (error) {
        console.error(error);
        return { error: true, message: "Error fetching user orders", data: null };
    }
};

// Get Order Details by Order ID
export const getOrdersById = async (userId: number, order_id: number) => {
    try {
        const result = await pool.query(
            `SELECT p.name, oi.order_id, oi.price, oi.quantity, o.total_amount, o.discount_amount, o.net_amount, o.status
             FROM ordereditems oi
             JOIN products p ON oi.product_id = p.product_id
             JOIN orders o ON o.order_id = oi.order_id
             WHERE o.user_id = $1 AND o.order_id = $2`,
            [userId, order_id]
        );
        if (result.rowCount === 0) {
            return { error: true, message: "Order not found", data: null };
        }
        return { error: false, message: "Order details retrieved successfully", data: result.rows };
    } catch (error) {
        console.error(error);
        return { error: true, message: "Error fetching order details", data: null };
    }
};

// Get All Orders (Admin)
export const getAllOrders = async () => {
    try {
        const result = await pool.query(`SELECT * FROM orders`);
        return { error: false, message: "All orders retrieved successfully", data: result.rows };
    } catch (error) {
        console.error(error);
        return { error: true, message: "Error fetching orders", data: null };
    }
};

// Update Order Status (Admin)
export const updateOrderStatus = async (order: Order) => {
    try {
        const { order_id, status } = order;
        const result = await pool.query(
            `UPDATE orders SET status = $1 WHERE order_id = $2 RETURNING *`,
            [status, order_id]
        );

        if (result.rowCount === 0) {
            return { error: true, message: "Order not found or no changes made", data: null };
        }
        return { error: false, message: "Order status updated successfully", data: result.rows[0] };
    } catch (error) {
        console.error(error);
        return { error: true, message: "Error updating order", data: null };
    }
};

// Cancel Order (User)
// export const cancelOrder = async (userId: number, order_id: number) => {
//     try {
//         const result = await pool.query(
//             `UPDATE orders SET status = $1 WHERE order_id = $2 AND user_id = $3 RETURNING *`,
//             ["cancelled", order_id, userId]
//         );

//         if (result.rowCount === 0) {
//             return { error: true, message: "Order not found or already cancelled", data: null };
//         }
//         return { error: false, message: "Order cancelled successfully", data: result.rows[0] };
//     } catch (error) {
//         console.error(error);
//         return { error: true, message: "Error cancelling order", data: null };
//     }
// };

export const cancelOrder = async (userId: number, order_id: number) => {
    const client = await pool.connect();
    try {
        await client.query("BEGIN"); // Start transaction

        // Step 1: Check if the order exists and is not already cancelled
        const orderCheck = await client.query(
            `SELECT status FROM orders WHERE order_id = $1 AND user_id = $2`,
            [order_id, userId]
        );

        if (orderCheck.rowCount === 0) {
            await client.query("ROLLBACK");
            return { error: true, message: "Order not found or does not belong to the user", data: null };
        }

        const orderStatus = orderCheck.rows[0].status;
        if (orderStatus === "Cancelled") {
            await client.query("ROLLBACK");
            return { error: true, message: "Order is already cancelled", data: null };
        }

        // Step 2: Restore stock of products in the order
        const orderItems = await client.query(
            `SELECT product_id, quantity FROM ordereditems WHERE order_id = $1`,
            [order_id]
        );

        for (const item of orderItems.rows) {
            const { product_id, quantity } = item;
            await client.query(
                `UPDATE products SET stock = stock + $1 WHERE product_id = $2`,
                [quantity, product_id]
            );
        }

        // Step 3: Cancel the order
        const result = await client.query(
            `UPDATE orders SET status = $1 WHERE order_id = $2 AND user_id = $3 RETURNING *`,
            ["Cancelled", order_id, userId]
        );

        await client.query("COMMIT"); // Commit transaction

        return { error: false, message: "Order cancelled successfully", data: result.rows[0] };
    } catch (error) {
        await client.query("ROLLBACK"); // Rollback transaction in case of an error
        console.error("Error cancelling order:", error);
        return { error: true, message: "Error cancelling order", data: null };
    } finally {
        client.release();
    }
};

// Create Order
export const createUserOrder = async (order: Order) => {
    try {
        await pool.query("BEGIN"); // Start Transaction

        const { user_id, cart_id, address_id, discount_id, payment_method, payment_status, transaction_id } = order;

        // Step 1: Verify Cart Belongs to User
        const cartData = await pool.query(
            `SELECT total_amount FROM carts WHERE cart_id = $1 AND user_id = $2 FOR UPDATE`,
            [cart_id, user_id]
        );
        if (cartData.rowCount === 0) {
            return { error: true, message: "Cart not found or does not belong to this user", data: null };
        }
        const total_amount = Number(cartData.rows[0].total_amount);

        // Step 2: Calculate Discount Amount
        let discount_amount = 0;
        if (discount_id) {
            const discountData = await pool.query(
                `SELECT discount_percentage FROM discounts WHERE discount_id = $1 AND expiration_date >= NOW()`,
                [discount_id]
            );
            if (discountData.rows.length > 0) {
                const discount_percentage = Number(discountData.rows[0].discount_percentage);
                discount_amount = (discount_percentage / 100) * total_amount;
            } else {
                return { error: true, message: "Invalid or expired discount", data: null };
            }
        }

        // Step 3: Calculate Net Amount
        const net_amount = total_amount - discount_amount;

        // Step 4: Create Order
        const orderResult = await pool.query(
            `INSERT INTO orders (user_id, address_id, discount_id, total_amount, status, payment_status, payment_method, transaction_id, created_at, discount_amount, net_amount)
             VALUES ($1, $2, $3, $4, 'Pending', $9, $5, $6, NOW(), $7, $8) RETURNING *`,
            [user_id, address_id, discount_id, total_amount, payment_method, transaction_id, discount_amount, net_amount, payment_status]
        );
        const orderId = orderResult.rows[0].order_id;

        // Step 5: Get Cart Items
        const cartItemsResult = await pool.query(
            `SELECT ci.product_id, ci.quantity, p.price FROM cartitems ci JOIN products p ON ci.product_id = p.product_id WHERE ci.cart_id = $1`,
            [cart_id]
        );
        if (cartItemsResult.rowCount === 0) {
            return { error: true, message: "No items found in the cart", data: null };
        }

        // Step 6: Process Cart Items, Update Stock, and Add to Ordered Items
        for (let item of cartItemsResult.rows) {
            const { product_id, quantity, price } = item;

            // Check stock before processing
            const productData = await pool.query(
                `SELECT stock FROM products WHERE product_id = $1 FOR UPDATE`,
                [product_id]
            );
            const stock = productData.rows[0].stock;
            if (stock < quantity) {
                return { error: true, message: `Not enough stock for product ${product_id}`, data: null };
            }

            // Update stock in the products table
            await pool.query(
                `UPDATE products SET stock = stock - $1 WHERE product_id = $2`,
                [quantity, product_id]
            );

            // Insert into ordered items
            await pool.query(
                `INSERT INTO ordereditems (order_id, product_id, quantity, price) VALUES ($1, $2, $3, $4)`,
                [orderId, product_id, quantity, price]
            );
        }

        // Step 7: Clear the Cart
        await pool.query(`DELETE FROM cartitems WHERE cart_id = $1`, [cart_id]);
        await pool.query(`UPDATE carts SET total_amount = 0 WHERE cart_id = $1`, [cart_id]);

        await pool.query("COMMIT"); // Commit Transaction

        return { error: false, message: "Order created successfully", data: orderResult.rows[0] };
    } catch (error) {
        await pool.query("ROLLBACK"); // Rollback Transaction if Error Occurs
        console.error("Error creating order:", error);
        return { error: true, message: "Error creating order", data: null };
    }
};
