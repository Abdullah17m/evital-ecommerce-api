import { executeQuery, formatResponse } from "../utils/helper";

class ProductService {
   

    async addProduct(category_id: number, name: string, description: string, price: number, stock: number) {
        const query = `
            INSERT INTO products (category_id, name, description, price, stock, created_at, updated_at)
            VALUES ($1, $2, $3, $4, $5, NOW(), NOW()) 
            RETURNING *`;

        return await executeQuery(query, [category_id, name, description, price, stock]);
    }

    async getAllProducts(page: any) {
        const offset = (page - 1) * 5;
        const query = `SELECT * FROM products ORDER BY created_at DESC LIMIT $1 OFFSET $2`;
        return await executeQuery(query, [5, offset]);
    }

    async getProductById(product_id: number) {
        const query = `SELECT * FROM products WHERE product_id = $1`;
        const result = await executeQuery(query, [product_id]);

        if (!result.data || result.data.length === 0) {
            return formatResponse(true, "Product not found", null);
        }

        return formatResponse(false, "Product retrieved successfully", result.data[0]);
    }

    

    async updateProduct(product_id: number, updates: Partial<{ 
        category_id: number; 
        name: string; 
        description: string; 
        price: number; 
        stock: number; 
    }>) {
        try {
            // Extract keys and values from the updates object
            const entries = Object.entries(updates);
            if (entries.length === 0) {
                return formatResponse(true, "No updates provided");
            }
    
            // Create dynamic SET clause
            let setClause = entries.map(([key], index) => `${key} = $${index + 1}`).join(", ");
            const values = entries.map(([, value]) => value);
            
            // Add `updated_at` field dynamically
            setClause += ", updated_at = NOW()";
    
            // Add product_id as the last parameter for the WHERE clause
            values.push(product_id);
    
            // Construct SQL query
            const query = `
                UPDATE products 
                SET ${setClause}
                WHERE product_id = $${values.length}
                RETURNING *;
            `;
    
            // Execute update query
            const result = await executeQuery(query, values);
    
            if (!result.data || result.data.length === 0) {
                return formatResponse(true, "Product not found or no changes made");
            }
    
            return formatResponse(false, "Product updated successfully", result.data[0]);
        } catch (error: any) {
            return formatResponse(true, error.message);
        }
    }
    

    async deleteProduct(product_id: number) {
        const query = `DELETE FROM products WHERE product_id = $1 RETURNING *`;
        const result = await executeQuery(query, [product_id]);

        if (!result.data || result.data.length === 0) {
            return formatResponse(true, "Product not found", null);
        }

        return formatResponse(false, "Product deleted successfully", result.data[0]);
    }

    async searchAndFilterProducts(filters: any) {
        const { name, min_price, max_price, min_stock, category_id, min_rating, page, limit, sort_by } = filters;

        let query = `SELECT * FROM products WHERE 1=1`;
        const params: any[] = [];
        let paramIndex = 1;

        // Filtering conditions
        if (name) {
            query += ` AND name ILIKE $${paramIndex}`;
            params.push(`%${name}%`);
            paramIndex++;
        }

        if (min_price) {
            query += ` AND price >= $${paramIndex}`;
            params.push(Number(min_price));
            paramIndex++;
        }

        if (max_price) {
            query += ` AND price <= $${paramIndex}`;
            params.push(Number(max_price));
            paramIndex++;
        }

        if (min_stock) {
            query += ` AND stock >= $${paramIndex}`;
            params.push(Number(min_stock));
            paramIndex++;
        }

        if (category_id) {
            query += ` AND category_id = $${paramIndex}`;
            params.push(Number(category_id));
            paramIndex++;
        }

        if (min_rating) {
            query += ` AND average_rating >= $${paramIndex}`;
            params.push(Number(min_rating));
            paramIndex++;
        }

        // Sorting
        // Default sorting
        let sortColumn = "created_at";
        let sortType = "DESC";

        if (sort_by) {
            const { name, type } = sort_by;
            sortColumn = name; // Safe because Joi validation ensures it's valid
            sortType = type.toUpperCase(); // Safe because Joi validation enforces ASC/DESC
        }

        query += ` ORDER BY ${sortColumn} ${sortType}`;


        // const validSortColumns = ["name", "price", "stock", "average_rating", "created_at"];
        // const validSortTypes = ["ASC", "DESC"];

        // if (sort_by) {
        //     const { name: sortColumn, type: sortType } = sort_by;

        //     if (validSortColumns.includes(sortColumn) && validSortTypes.includes(sortType.toUpperCase())) {
        //         query += ` ORDER BY ${sortColumn} ${sortType.toUpperCase()}`;
        //     } else {
        //         return formatResponse(true, "Invalid sorting parameters", null);
        //     }
        // } else {
        //     query += ` ORDER BY created_at DESC`; // Default sorting
        // }

        // Pagination
        const pageNum = parseInt(page as string) || 1;
        const limitNum = parseInt(limit as string) || 5;
        const offset = (pageNum - 1) * limitNum;

        query += ` LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
        params.push(limitNum, offset);
        console.log(query);
        try {
            const result = await executeQuery(query, params);

            return formatResponse(false, "Products retrieved successfully", result.data);
        } catch (error) {
            console.error("Error searching and filtering products:", error);
            return formatResponse(true, "Error retrieving products", null);
        }
    }
}

// Export an instance of the class
export default ProductService;
