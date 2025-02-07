import pool from "../config/database";

interface Discount {
    discount_id?: number;
    code: string;
    discount_percentage: number;
    expiration_date: string;
    created_at?: string;
}

// Create a Discount
export const createDiscount = async (discount: Discount) => {
    try {
        const { code, discount_percentage, expiration_date } = discount;
        const result = await pool.query(
            `INSERT INTO discounts (code, discount_percentage, expiration_date, created_at)
             VALUES ($1, $2, $3, NOW()) RETURNING *`,
            [code, discount_percentage, expiration_date]
        );
        return { error: false, message: "Discount created successfully", data: result.rows[0] };
    } catch (error) {
        console.error("Error creating discount:", error);
        return { error: true, message: "Error creating discount", data: null };
    }
};

// Get All Discounts
export const getAllDiscounts = async () => {
    try {
        const result = await pool.query(`SELECT * FROM discounts`);
        return { error: false, message: "Discounts fetched successfully", data: result.rows };
    } catch (error) {
        console.error("Error fetching discounts:", error);
        return { error: true, message: "Error fetching discounts", data: null };
    }
};

// Get Discount by ID
export const getDiscountById = async (discount_id: number) => {
    try {
        const result = await pool.query(`SELECT * FROM discounts WHERE discount_id = $1`, [discount_id]);
        if (result.rowCount === 0) {
            return { error: true, message: "Discount not found", data: null };
        }
        return { error: false, message: "Discount fetched successfully", data: result.rows[0] };
    } catch (error) {
        console.error("Error fetching discount:", error);
        return { error: true, message: "Error fetching discount", data: null };
    }
};

// Update Discount
export const updateDiscount = async (discount:Discount) => {
    try {
        const { code, discount_percentage, expiration_date,discount_id } = discount;
        const result = await pool.query(
            `UPDATE discounts 
             SET code = COALESCE($1, code), 
                 discount_percentage = COALESCE($2, discount_percentage),
                 expiration_date = COALESCE($3, expiration_date)
             WHERE discount_id = $4 RETURNING *`,
            [code, discount_percentage, expiration_date, discount_id]
        );

        if (result.rowCount === 0) {
            return { error: true, message: "Discount not found", data: null };
        }
        return { error: false, message: "Discount updated successfully", data: result.rows[0] };
    } catch (error) {
        console.error("Error updating discount:", error);
        return { error: true, message: "Error updating discount", data: null };
    }
};

// Delete Discount
export const deleteDiscount = async (discount_id: number) => {
    try {
        const result = await pool.query(`DELETE FROM discounts WHERE discount_id = $1 RETURNING *`, [discount_id]);
        if (result.rowCount === 0) {
            return { error: true, message: "Discount not found", data: null };
        }
        return { error: false, message: "Discount deleted successfully", data: result.rows[0] };
    } catch (error) {
        console.error("Error deleting discount:", error);
        return { error: true, message: "Error deleting discount", data: null };
    }
};
