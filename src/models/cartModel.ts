import pool from "../config/database";

interface AddtoCartItems {
    cart_id: number;
    user_id: number;
    product_id: number;
    quantity: number;
}

export const getAllCarts = async (userId: number) => {
    try {
        const result = await pool.query(
            `SELECT cart_id, total_amount FROM carts WHERE user_id = $1`,
            [userId]
        );
        return { error: false, message: "Carts fetched successfully", data: result.rows };
    } catch (error) {
        console.log(error);
        return { error: true, message: "Error fetching carts", data: {} };
    }
};

export const createCart = async (userId: number) => {
    try {
        const result = await pool.query(
            `INSERT INTO carts (user_id) VALUES ($1) RETURNING *`,
            [userId]
        );
        return { error: false, message: "Cart created successfully", data: result.rows[0] };
    } catch (error) {
        console.log(error);
        return { error: true, message: "Error creating cart", data: {} };
    }
};

export const addProductCart = async (cart: AddtoCartItems) => {
    try {
        const { user_id, cart_id, product_id, quantity } = cart;

        const productStock = await pool.query(
            `SELECT stock, price FROM products WHERE product_id = $1`,
            [product_id]
        );

        if (productStock.rowCount === 0) {
            return { error: true, message: "Product not found.", data: {} };
        }

        const { stock, price } = productStock.rows[0];

        if (stock < quantity) {
            return { error: true, message: "Not enough stock available.", data: {} };
        }

        const cartData = await pool.query(
            `SELECT total_amount FROM carts WHERE user_id = $1 AND cart_id = $2`,
            [user_id, cart_id]
        );

        if (cartData.rowCount === 0) {
            return { error: true, message: "Cart not found for this user.", data: {} };
        }

        const { total_amount } = cartData.rows[0];
        const updatedAmount = Number(total_amount) + Number(price) * quantity;

        await pool.query(
            `INSERT INTO cartitems (cart_id, product_id, quantity) VALUES ($1, $2, $3)`,
            [cart_id, product_id, quantity]
        );

        await pool.query(
            `UPDATE carts SET total_amount = $1 WHERE cart_id = $2`,
            [updatedAmount, cart_id]
        );

        return { error: false, message: "Product added to cart successfully", data: { updatedAmount } };
    } catch (error: any) {
        console.log(error);
        return { error: true, message: error.message || "Internal Server Error", data: {} };
    }
};

export const updateCart = async (cart: AddtoCartItems) => {
    try {
        const { user_id, cart_id, product_id, quantity } = cart;

        const productStock = await pool.query(
            `SELECT stock, price FROM products WHERE product_id = $1`,
            [product_id]
        );

        if (productStock.rowCount === 0) {
            return { error: true, message: "Product not found.", data: {} };
        }

        const { stock, price } = productStock.rows[0];

        if (stock < quantity) {
            return { error: true, message: "Not enough stock available.", data: {} };
        }

        await pool.query(
            `UPDATE cartitems SET quantity = $1 WHERE cart_id = $2 AND product_id = $3`,
            [quantity, cart_id, product_id]
        );

        const totalAmountResult = await pool.query(
            `SELECT COALESCE(SUM(ci.quantity * p.price), 0) AS total_amount
             FROM cartitems ci
             JOIN products p ON ci.product_id = p.product_id
             WHERE ci.cart_id = $1`,
            [cart_id]
        );

        const updatedAmount = Number(totalAmountResult.rows[0].total_amount);

        await pool.query(
            `UPDATE carts SET total_amount = $1 WHERE cart_id = $2`,
            [updatedAmount, cart_id]
        );

        return { error: false, message: "Cart updated successfully", data: { updatedAmount } };
    } catch (error: any) {
        console.log(error);
        return { error: true, message: error.message || "Internal Server Error", data: {} };
    }
};

export const deleteProductCart = async (cart: AddtoCartItems) => {
    try {
        const { user_id, cart_id, product_id } = cart;

        const productData = await pool.query(
            `SELECT p.price, ci.quantity 
             FROM cartitems ci 
             JOIN products p ON p.product_id = ci.product_id  
             WHERE ci.cart_id = $1 AND ci.product_id = $2`,
            [cart_id, product_id]
        );

        if (productData.rowCount === 0) {
            return { error: true, message: "Product not found in the cart.", data: {} };
        }

        const { price, quantity } = productData.rows[0];

        await pool.query(
            `DELETE FROM cartitems WHERE cart_id = $1 AND product_id = $2`,
            [cart_id, product_id]
        );

        const totalAmountResult = await pool.query(
            `SELECT COALESCE(SUM(ci.quantity * p.price), 0) AS total_amount
             FROM cartitems ci
             JOIN products p ON ci.product_id = p.product_id
             WHERE ci.cart_id = $1`,
            [cart_id]
        );

        const updatedAmount = Number(totalAmountResult.rows[0].total_amount);

        await pool.query(
            `UPDATE carts SET total_amount = $1 WHERE cart_id = $2`,
            [updatedAmount, cart_id]
        );

        return { error: false, message: "Product removed from cart successfully", data: { updatedAmount } };
    } catch (error: any) {
        console.log(error);
        return { error: true, message: error.message || "Internal Server Error", data: {} };
    }
};

export const deleteCart = async (cart: AddtoCartItems) => {
    try {
        const { user_id, cart_id } = cart;

        await pool.query(`DELETE FROM cartitems WHERE cart_id = $1`, [cart_id]);
        await pool.query(`DELETE FROM carts WHERE cart_id = $1 AND user_id = $2`, [cart_id, user_id]);

        return { error: false, message: "Cart cleared successfully", data: {} };
    } catch (error: any) {
        console.log(error);
        return { error: true, message: error.message || "Internal Server Error", data: {} };
    }
};

export const getCartItemsById = async (cart_id: number, user_id: number) => {
    try {
        const cartExists = await pool.query(
            `SELECT * FROM carts WHERE cart_id = $1 AND user_id = $2`,
            [cart_id, user_id]
        );

        if (cartExists.rowCount === 0) {
            return { error: true, message: "Cart not found for this user.", data: {} };
        }

        const cartData = await pool.query(
            `SELECT * FROM cartitems WHERE cart_id = $1`,
            [cart_id]
        );

        if (cartData.rowCount === 0) {
            return { error: true, message: "No items found in the cart.", data: {} };
        }

        return { error: false, message: "Cart items fetched successfully", data: cartData.rows };
    } catch (error: any) {
        console.log(error);
        return { error: true, message: error.message || "Internal Server Error", data: {} };
    }
};
