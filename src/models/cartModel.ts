import { executeQuery, formatResponse } from "../utils/helper";

interface AddToCartItems {
    cart_id: number;
    user_id: number;
    product_id: number;
    quantity: number;
}

class CartService {
    async getAllCarts(userId: number) {
        const result = await executeQuery(
            "SELECT cart_id, total_amount FROM carts WHERE user_id = $1",
            [userId]
        );

        return result.error
            ? formatResponse(true, "Error fetching carts")
            : formatResponse(false, "Carts fetched successfully", result.data);
    }

    async createCart(userId: number) {
        const result = await executeQuery(
            "INSERT INTO carts (user_id) VALUES ($1) RETURNING *",
            [userId]
        );

        return result.error
            ? formatResponse(true, "Error creating cart")
            : formatResponse(false, "Cart created successfully", result.data[0]);
    }

    async addProductCart(cart: AddToCartItems) {
        const { user_id, cart_id, product_id, quantity } = cart;

        const productResult = await executeQuery(
            "SELECT stock, price FROM products WHERE product_id = $1",
            [product_id]
        );

        if (productResult.error || productResult.data.length === 0) {
            return formatResponse(true, "Product not found.");
        }

        const { stock, price } = productResult.data[0];

        if (stock < quantity) {
            return formatResponse(true, "Not enough stock available.");
        }

        const cartData = await executeQuery(
            "SELECT total_amount FROM carts WHERE user_id = $1 AND cart_id = $2",
            [user_id, cart_id]
        );

        if (cartData.error || cartData.data.length === 0) {
            return formatResponse(true, "Cart not found for this user.");
        }

        const existingCartItem = await executeQuery(
            "SELECT quantity FROM cartitems WHERE cart_id = $1 AND product_id = $2",
            [cart_id, product_id]
        );

        let updatedAmount = Number(cartData.data[0].total_amount);

        if (existingCartItem.data.length > 0) {
            const existingQuantity = existingCartItem.data[0].quantity;
            const newQuantity = existingQuantity + quantity;

            if (stock < newQuantity) {
                return formatResponse(true, "Not enough stock available for this quantity update.");
            }

            await executeQuery(
                "UPDATE cartitems SET quantity = $1 WHERE cart_id = $2 AND product_id = $3",
                [newQuantity, cart_id, product_id]
            );

            updatedAmount += price * quantity;
        } else {
            await executeQuery(
                "INSERT INTO cartitems (cart_id, product_id, quantity) VALUES ($1, $2, $3)",
                [cart_id, product_id, quantity]
            );

            updatedAmount += price * quantity;
        }

        await executeQuery("UPDATE carts SET total_amount = $1 WHERE cart_id = $2", [
            updatedAmount,
            cart_id,
        ]);

        return formatResponse(false, "Product added to cart successfully", { updatedAmount });
    }

    async updateCart(cart: AddToCartItems) {
        const { cart_id, product_id, quantity } = cart;

        const productResult = await executeQuery(
            "SELECT stock, price FROM products WHERE product_id = $1",
            [product_id]
        );

        if (productResult.error || productResult.data.length === 0) {
            return formatResponse(true, "Product not found.");
        }

        const { stock, price } = productResult.data[0];

        if (stock < quantity) {
            return formatResponse(true, "Not enough stock available.");
        }

        await executeQuery(
            "UPDATE cartitems SET quantity = $1 WHERE cart_id = $2 AND product_id = $3",
            [quantity, cart_id, product_id]
        );

        const totalAmountResult = await executeQuery(
            `SELECT COALESCE(SUM(ci.quantity * p.price), 0) AS total_amount
             FROM cartitems ci
             JOIN products p ON ci.product_id = p.product_id
             WHERE ci.cart_id = $1`,
            [cart_id]
        );

        const updatedAmount = Number(totalAmountResult.data[0]?.total_amount || 0);

        await executeQuery("UPDATE carts SET total_amount = $1 WHERE cart_id = $2", [
            updatedAmount,
            cart_id,
        ]);

        return formatResponse(false, "Cart updated successfully", { updatedAmount });
    }

    async deleteProductCart(cart: AddToCartItems) {
        const { cart_id, product_id } = cart;

        const productData = await executeQuery(
            `SELECT p.price, ci.quantity 
             FROM cartitems ci 
             JOIN products p ON p.product_id = ci.product_id  
             WHERE ci.cart_id = $1 AND ci.product_id = $2`,
            [cart_id, product_id]
        );

        if (productData.error || productData.data.length === 0) {
            return formatResponse(true, "Product not found in the cart.");
        }

        await executeQuery("DELETE FROM cartitems WHERE cart_id = $1 AND product_id = $2", [
            cart_id,
            product_id,
        ]);

        const totalAmountResult = await executeQuery(
            `SELECT COALESCE(SUM(ci.quantity * p.price), 0) AS total_amount
             FROM cartitems ci
             JOIN products p ON ci.product_id = p.product_id
             WHERE ci.cart_id = $1`,
            [cart_id]
        );

        const updatedAmount = Number(totalAmountResult.data[0]?.total_amount || 0);

        await executeQuery("UPDATE carts SET total_amount = $1 WHERE cart_id = $2", [
            updatedAmount,
            cart_id,
        ]);

        return formatResponse(false, "Product removed from cart successfully", { updatedAmount });
    }

    async deleteCart(cart: AddToCartItems) {
        const { cart_id, user_id } = cart;

        await executeQuery("DELETE FROM cartitems WHERE cart_id = $1", [cart_id]);
        await executeQuery("DELETE FROM carts WHERE cart_id = $1 AND user_id = $2", [
            cart_id,
            user_id,
        ]);

        return formatResponse(false, "Cart cleared successfully");
    }

    async getCartItemsById(cart_id: number, user_id: number) {
        const cartExists = await executeQuery(
            "SELECT * FROM carts WHERE cart_id = $1 AND user_id = $2",
            [cart_id, user_id]
        );

        if (cartExists.error || cartExists.data.length === 0) {
            return formatResponse(true, "Cart not found for this user.");
        }

        const cartData = await executeQuery("SELECT * FROM cartitems WHERE cart_id = $1", [cart_id]);

        return cartData.error || cartData.data.length === 0
            ? formatResponse(true, "No items found in the cart.")
            : formatResponse(false, "Cart items fetched successfully", cartData.data);
    }
}

export default CartService;
