import { executeQuery, formatResponse } from "../utils/helper";

class CategoryService {
    // Create a new category
    async createCategory(name: string) {
        try {
            const result = await executeQuery(
                "INSERT INTO productcategories (name) VALUES ($1) RETURNING *",
                [name]
            );
            return formatResponse(false, "Category created successfully", result.data[0]);
        } catch (error: any) {
            return formatResponse(true, error.message);
        }
    }

    // Fetch all categories sorted by name
    async getAllCategories() {
        try {
            const result = await executeQuery("SELECT * FROM productcategories ORDER BY name ASC");
            return formatResponse(false, "Categories fetched successfully", result.data);
        } catch (error: any) {
            return formatResponse(true, error.message);
        }
    }

    // Fetch a specific category by its ID
    async getCategoryById(category_id: number) {
        try {
            const result = await executeQuery(
                "SELECT * FROM productcategories WHERE category_id = $1",
                [category_id]
            );

            // Check if category exists
            if (result.data.length === 0) {
                return formatResponse(true, "Category not found");
            }

            return formatResponse(false, "Category fetched successfully", result.data[0]);
        } catch (error: any) {
            return formatResponse(true, error.message);
        }
    }

    // Update an existing category
    async updateCategory(category_id: number, name: string) {
        try {
            const result = await executeQuery(
                "UPDATE productcategories SET name = $2 WHERE category_id = $1 RETURNING *",
                [category_id, name]
            );

            // Check if category was updated
            if (result.data.length === 0) {
                return formatResponse(true, "Category not found or not updated");
            }

            return formatResponse(false, "Category updated successfully", result.data[0]);
        } catch (error: any) {
            return formatResponse(true, error.message);
        }
    }

    // Delete a category
    async deleteCategory(category_id: number) {
        try {
            const result = await executeQuery(
                "DELETE FROM productcategories WHERE category_id = $1 RETURNING *",
                [category_id]
            );

            // Check if category was deleted
            if (result.data.length === 0) {
                return formatResponse(true, "Category not found or already deleted");
            }

            return formatResponse(false, "Category deleted successfully", result.data[0]);
        } catch (error: any) {
            return formatResponse(true, error.message);
        }
    }
}

export default CategoryService;
