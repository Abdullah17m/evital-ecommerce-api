// import { executeQuery, formatResponse } from "../utils/helper";

// interface Discount {
//     discount_id?: number;
//     code: string;
//     discount_percentage: number;
//     expiration_date: string;
//     created_at?: string;
// }

// export class DiscountService {


//     async createDiscount(discount: Discount) {
//         try {
//             const { code, discount_percentage, expiration_date } = discount;
//             const result = await executeQuery(
//                 `INSERT INTO discounts (code, discount_percentage, expiration_date, created_at)
//                  VALUES ($1, $2, $3, NOW()) RETURNING *`,
//                 [code, discount_percentage, expiration_date]
//             );
//             return formatResponse(false, "Discount created successfully", result.data.rows[0]);
//         } catch (error: any) {
//             return formatResponse(true, error.message);
//         }
//     }

//     async getAllDiscounts() {
//         try {
//             const result = await executeQuery(`SELECT * FROM discounts ORDER BY created_at DESC`);
//             return formatResponse(false, "Discounts fetched successfully", result.data.rows);
//         } catch (error: any) {
//             return formatResponse(true, error.message);
//         }
//     }

//     async getDiscountById(discount_id: number) {
//         try {
//             const result = await executeQuery(`SELECT * FROM discounts WHERE discount_id = $1`, [discount_id]);
//             if (result.data.rowCount === 0) {
//                 return formatResponse(true, "Discount not found");
//             }
//             return formatResponse(false, "Discount fetched successfully", result.data.rows[0]);
//         } catch (error: any) {
//             return formatResponse(true, error.message);
//         }
//     }

//     // async updateDiscount(discount: Discount) {
//     //     try {
//     //         const { code, discount_percentage, expiration_date, discount_id } = discount;

//     //         if (!discount_id) {
//     //             return formatResponse(true, "Discount ID is required for update");
//     //         }

//     //         const result = await executeQuery(
//     //             `UPDATE discounts 
//     //              SET code = COALESCE($1, code), 
//     //                  discount_percentage = COALESCE($2, discount_percentage),
//     //                  expiration_date = COALESCE($3, expiration_date)
//     //              WHERE discount_id = $4 RETURNING *`,
//     //             [code, discount_percentage, expiration_date, discount_id]
//     //         );

//     //         if (result.data.rowCount === 0) {
//     //             return formatResponse(true, "Discount not found or not updated");
//     //         }
//     //         return formatResponse(false, "Discount updated successfully", result.data.rows[0]);
//     //     } catch (error: any) {
//     //         return formatResponse(true, error.message);
//     //     }
//     // }

//     async updateDiscount(discount: Partial<Discount>) {
//         try {
//             if (!discount.discount_id) {
//                 return formatResponse(true, "Discount ID is required for update");
//             }
    
//             const updates = Object.entries(discount).filter(([key]) => key !== "discount_id");
    
//             if (updates.length === 0) {
//                 return formatResponse(true, "No updates provided");
//             }
    
//             const setClause = updates.map(([key], index) => `${key} = $${index + 1}`).join(", ");
//             const values = updates.map(([, value]) => value);
//             values.push(discount.discount_id); // Add discount_id at the end
    
//             const query = `
//                 UPDATE discounts
//                 SET ${setClause}
//                 WHERE discount_id = $${values.length}
//                 RETURNING *;
//             `;
    
//             const result = await executeQuery(query, values);
    
//             if (!result.data || result.data.length === 0) {
//                 return formatResponse(true, "Discount not found or not updated");
//             }
    
//             return formatResponse(false, "Discount updated successfully", result.data[0]);
//         } catch (error: any) {
//             return formatResponse(true, error.message);
//         }
//     }

//     async deleteDiscount(discount_id: number) {
//         try {
//             const result = await executeQuery(`DELETE FROM discounts WHERE discount_id = $1 RETURNING *`, [discount_id]);
//             if (result.data.rowCount === 0) {
//                 return formatResponse(true, "Discount not found or already deleted");
//             }
//             return formatResponse(false, "Discount deleted successfully", result.data.rows[0]);
//         } catch (error: any) {
//             return formatResponse(true, error.message);
//         }
//     }
// }


import { executeQuery, formatResponse } from "../utils/helper";

interface Discount {
    discount_id?: number;
    code: string;
    discount_percentage: number;
    expiration_date: string;
    created_at?: string;
}

export class DiscountService {
    // Create a new discount
    async createDiscount(discount: Discount) {
        try {
            const { code, discount_percentage, expiration_date } = discount;
            const result = await executeQuery(
                `INSERT INTO discounts (code, discount_percentage, expiration_date, created_at)
                 VALUES ($1, $2, $3, NOW()) RETURNING *`,
                [code, discount_percentage, expiration_date]
            );
            return formatResponse(false, "Discount created successfully", result.data.rows[0]);
        } catch (error: any) {
            return formatResponse(true, error.message);
        }
    }

    // Fetch all discounts, sorted by the creation date
    async getAllDiscounts() {
        try {
            const result = await executeQuery(`SELECT * FROM discounts ORDER BY created_at DESC`);
            return formatResponse(false, "Discounts fetched successfully", result.data.rows);
        } catch (error: any) {
            return formatResponse(true, error.message);
        }
    }

    // Fetch a specific discount by its ID
    async getDiscountById(discount_id: number) {
        try {
            const result = await executeQuery(`SELECT * FROM discounts WHERE discount_id = $1`, [discount_id]);

            // Check if discount exists
            if (result.data.rowCount === 0) {
                return formatResponse(true, "Discount not found");
            }

            return formatResponse(false, "Discount fetched successfully", result.data.rows[0]);
        } catch (error: any) {
            return formatResponse(true, error.message);
        }
    }

    // Update a discount (partial updates allowed)
    async updateDiscount(discount: Partial<Discount>) {
        try {
            if (!discount.discount_id) {
                return formatResponse(true, "Discount ID is required for update");
            }

            // Prepare fields for update query
            const updates = Object.entries(discount).filter(([key]) => key !== "discount_id");

            if (updates.length === 0) {
                return formatResponse(true, "No updates provided");
            }

            // Generate SET clause dynamically
            const setClause = updates.map(([key], index) => `${key} = $${index + 1}`).join(", ");
            const values = updates.map(([, value]) => value);
            values.push(discount.discount_id); // Add discount_id at the end

            const query = `
                UPDATE discounts
                SET ${setClause}
                WHERE discount_id = $${values.length}
                RETURNING *;
            `;

            const result = await executeQuery(query, values);

            // Check if update was successful
            if (!result.data || result.data.length === 0) {
                return formatResponse(true, "Discount not found or not updated");
            }

            return formatResponse(false, "Discount updated successfully", result.data[0]);
        } catch (error: any) {
            return formatResponse(true, error.message);
        }
    }

    // Delete a discount by ID
    async deleteDiscount(discount_id: number) {
        try {
            const result = await executeQuery(
                `DELETE FROM discounts WHERE discount_id = $1 RETURNING *`,
                [discount_id]
            );

            // Check if discount was deleted
            if (result.data.rowCount === 0) {
                return formatResponse(true, "Discount not found or already deleted");
            }

            return formatResponse(false, "Discount deleted successfully", result.data.rows[0]);
        } catch (error: any) {
            return formatResponse(true, error.message);
        }
    }
}
