import pool from "../config/database";

export const createCategory = async (name: string) => {
    try {
        const result = await pool.query(
            "INSERT INTO productcategories (name) VALUES ($1) RETURNING *",
            [name]
        );
        return { error:false, message: "Category created successfully", data: result.rows[0] };
    } catch (error: any) {
        console.error("Error creating category:", error);
        return { error: true, message: error.message || "Could not create category", data: {} };
    }
};

export const getAllCategories = async () => {
    try {
        const result = await pool.query("SELECT * FROM productcategories ORDER BY name ASC");
        return { error:false, message: "Categories fetched successfully", data: result.rows };
    } catch (error: any) {
        console.error("Error fetching categories:", error);
        return { error: true, message: error.message || "Could not fetch categories", data: {} };
    }
};

export const getCategoryById = async (category_id: number) => {
    try {
        const result = await pool.query("SELECT * FROM productcategories WHERE category_id = $1", [category_id]);
        if (result.rowCount === 0) {
            return { error: true, message: "Category not found", data: {} };
        }
        return {error:false, message: "Category fetched successfully", data: result.rows[0] };
    } catch (error: any) {
        console.error("Error fetching category:", error);
        return { error: true, message: error.message || "Could not fetch category", data: {} };
    }
};

export const updateCategory = async (category_id: number, name: string) => {
    try {
        const result = await pool.query(
            "UPDATE productcategories SET name = $2 WHERE category_id = $1 RETURNING *",
            [category_id, name]
        );
        if (result.rowCount === 0) {
            return { error: true, message: "Category not found or not updated", data: {} };
        }
        return { error:false, message: "Category updated successfully", data: result.rows[0] };
    } catch (error: any) {
        console.error("Error updating category:", error);
        return { error: true, message: error.message || "Could not update category", data: {} };
    }
};

export const deleteCategory = async (category_id: number) => {
    try {
        const result = await pool.query(
            "DELETE FROM productcategories WHERE category_id = $1 RETURNING *",
            [category_id]
        );
        if (result.rowCount === 0) {
            return { error: true, message: "Category not found or already deleted", data: {} };
        }
        return { error:false, message: "Category deleted successfully", data: result.rows[0] };
    } catch (error: any) {
        console.error("Error deleting category:", error);
        return { error: true, message: error.message || "Could not delete category", data: {} };
    }
};
