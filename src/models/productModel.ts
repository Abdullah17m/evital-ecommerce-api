import pool from "../config/database";

export const addProduct = async (
    category_id: number,
    name: string,
    description: string,
    price: number,
    stock: number
) => {
    try {
        const result = await pool.query(
            `INSERT INTO products (category_id, name, description, price, stock, created_at, updated_at)
             VALUES ($1, $2, $3, $4, $5, NOW(), NOW()) 
             RETURNING *`,
            [category_id, name, description, price, stock]
        );

        return { error: false, message: "Product added successfully", data: result.rows[0] };
    } catch (error) {
        console.error("Error adding product:", error);
        return { error: true, message: "Error adding product", data: null };
    }
};

export const getAllProducts = async () => {
    try {
        const result = await pool.query(`SELECT * FROM products ORDER BY created_at DESC`);
        return { error: false, message: "Products retrieved successfully", data: result.rows };
    } catch (error) {
        console.error("Error fetching products:", error);
        return { error: true, message: "Error fetching products", data: null };
    }
};

export const getProductById = async (product_id: number) => {
    try {
        const result = await pool.query(`SELECT * FROM products WHERE product_id = $1`, [product_id]);

        if (result.rowCount === 0) {
            return { error: true, message: "Product not found", data: null };
        }

        return { error: false, message: "Product retrieved successfully", data: result.rows[0] };
    } catch (error) {
        console.error("Error fetching product:", error);
        return { error: true, message: "Error fetching product", data: null };
    }
};

export const updateProduct = async (
    product_id: number,
    category_id?: number,
    name?: string,
    description?: string,
    price?: number,
    stock?: number
) => {
    try {
        const result = await pool.query(
            `UPDATE products 
             SET category_id = COALESCE($2, category_id),
                 name = COALESCE($3, name),
                 description = COALESCE($4, description),
                 price = COALESCE($5, price),
                 stock = COALESCE($6, stock),
                 updated_at = NOW()
             WHERE product_id = $1
             RETURNING *`,
            [product_id, category_id, name, description, price, stock]
        );

        if (result.rowCount === 0) {
            return { error: true, message: "Product not found or no changes made", data: null };
        }

        return { error: false, message: "Product updated successfully", data: result.rows[0] };
    } catch (error) {
        console.error("Error updating product:", error);
        return { error: true, message: "Error updating product", data: null };
    }
};

export const deleteProduct = async (product_id: number) => {
    try {
        const result = await pool.query(`DELETE FROM products WHERE product_id = $1 RETURNING *`, [product_id]);

        if (result.rowCount === 0) {
            return { error: true, message: "Product not found", data: null };
        }

        return { error: false, message: "Product deleted successfully", data: result.rows[0] };
    } catch (error) {
        console.error("Error deleting product:", error);
        return { error: true, message: "Error deleting product", data: null };
    }
};
