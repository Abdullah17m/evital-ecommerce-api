// import { executeQuery, formatResponse } from "../utils/helper";

// interface Address {
//     address_id: number;
//     user_id: number;
//     street: string;
//     city: string;
//     state: string;
//     country: string;
//     postal_code: string;
//     is_default: boolean;
//     type: "home" | "work" | "other";
// }

// export class AddressService {
//     private async resetDefaultAddress(userId: number) {
//         return await executeQuery(`UPDATE addresses SET is_default=false WHERE user_id=$1`, [userId]);
//     }

//     public async addAddress(address: Address) {
//         const { user_id, street, city, state, country, postal_code, is_default, type } = address;

//         if (is_default) await this.resetDefaultAddress(user_id);

//         const result = await executeQuery(
//             `INSERT INTO addresses (user_id, street, city, state, country, postal_code, is_default, type) 
//              VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
//             [user_id, street, city, state, country, postal_code, is_default, type]
//         );

//         if (result.error) return formatResponse(true, "Error adding address");
//         return formatResponse(false, "Address added successfully", result.data[0]);
//     }

//     public async getAllAddresses(userId: number) {
//         const result = await executeQuery(
//             `SELECT street, city, state, country, postal_code, is_default, type FROM addresses WHERE user_id=$1`,
//             [userId]
//         );

//         if (result.error) return formatResponse(true, "Error finding addresses", []);
//         return formatResponse(false, "Addresses retrieved successfully", result.data);
//     }

//     public async getAddressById(addressId: number) {
//         const result = await executeQuery(
//             `SELECT street, city, state, country, postal_code, is_default, type FROM addresses WHERE address_id=$1`,
//             [addressId]
//         );

//         if (result.error || result.data.length === 0) return formatResponse(true, "Address not found");
//         return formatResponse(false, "Address retrieved successfully", result.data[0]);
//     }

//     public async updateAddress(userId: number, addressId: number, updates: Partial<Address>) {
//         if (Object.keys(updates).length === 0) {
//             return formatResponse(true, "No updates provided");
//         }
    
//         const setClause: string[] = [];
//         const values: any[] = [];
    
//         let index = 1; // Placeholder index for parameterized query
    
//         for (const [key, value] of Object.entries(updates)) {
//             setClause.push(`${key} = $${index}`);
//             values.push(value);
//             index++;
//         }
    
//         values.push(userId, addressId); // Adding userId and addressId at the end
    
//         const query = `
//             UPDATE addresses 
//             SET ${setClause.join(", ")}
//             WHERE user_id = $${index} AND address_id = $${index + 1}
//             RETURNING *;
//         `;
    
//         const result = await executeQuery(query, values);
    
//         if (result.error || result.data.length === 0) {
//             return formatResponse(true, "Address not found or not updated");
//         }
    
//         return formatResponse(false, "Address updated successfully", result.data[0]);
//     }
    
    

//     public async deleteAddress(userId: number, addressId: number) {
//         const result = await executeQuery(
//             `DELETE FROM addresses WHERE address_id=$1 AND user_id=$2 RETURNING *;`,
//             [addressId, userId]
//         );

//         if (result.error || result.data.length === 0) return formatResponse(true, "Address not found or not deleted");
//         return formatResponse(false, "Address deleted successfully", result.data[0]);
//     }
// }


import { executeQuery, formatResponse } from "../utils/helper";

// Define the Address interface to ensure type safety
interface Address {
    address_id: number;
    user_id: number;
    street: string;
    city: string;
    state: string;
    country: string;
    postal_code: string;
    is_default: boolean;
    type: "home" | "work" | "other";
}

// AddressService class for handling database operations related to addresses
export class AddressService {

    /**
     * Reset all addresses of the user to non-default before setting a new default address.
     * This ensures only one address can be the default at a time.
     */
    private async resetDefaultAddress(userId: number) {
        return await executeQuery(
            `UPDATE addresses SET is_default=false WHERE user_id=$1`,
            [userId]
        );
    }

    /**
     * Add a new address for the user.
     * If the new address is set as default, it resets the previous default address.
     */
    public async addAddress(address: Address) {
        const { user_id, street, city, state, country, postal_code, is_default, type } = address;

        // If adding a default address, reset the previous default
        if (is_default) await this.resetDefaultAddress(user_id);

        const result = await executeQuery(
            `INSERT INTO addresses (user_id, street, city, state, country, postal_code, is_default, type) 
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
            [user_id, street, city, state, country, postal_code, is_default, type]
        );

        // Handle errors and return formatted response
        if (result.error) return formatResponse(true, "Error adding address");
        return formatResponse(false, "Address added successfully", result.data[0]);
    }

    /**
     * Retrieve all addresses for a given user.
     */
    public async getAllAddresses(userId: number) {
        const result = await executeQuery(
            `SELECT street, city, state, country, postal_code, is_default, type FROM addresses WHERE user_id=$1`,
            [userId]
        );

        if (result.error) return formatResponse(true, "Error finding addresses", []);
        return formatResponse(false, "Addresses retrieved successfully", result.data);
    }

    /**
     * Retrieve a single address by its ID.
     */
    public async getAddressById(addressId: number) {
        const result = await executeQuery(
            `SELECT street, city, state, country, postal_code, is_default, type FROM addresses WHERE address_id=$1`,
            [addressId]
        );

        if (result.error || result.data.length === 0) 
            return formatResponse(true, "Address not found");

        return formatResponse(false, "Address retrieved successfully", result.data[0]);
    }

    /**
     * Update an existing address.
     * Accepts a partial address object and dynamically builds an SQL query.
     */
    public async updateAddress(userId: number, addressId: number, updates: Partial<Address>) {
        // If no updates are provided, return an error
        if (Object.keys(updates).length === 0) {
            return formatResponse(true, "No updates provided");
        }
    
        const setClause: string[] = [];
        const values: any[] = [];
        let index = 1; // Placeholder index for parameterized query
    
        // Loop through the updates object and dynamically create SQL set statements
        for (const [key, value] of Object.entries(updates)) {
            setClause.push(`${key} = $${index}`);
            values.push(value);
            index++;
        }
    
        // Add userId and addressId as the last placeholders
        values.push(userId, addressId);
    
        const query = `
            UPDATE addresses 
            SET ${setClause.join(", ")}
            WHERE user_id = $${index} AND address_id = $${index + 1}
            RETURNING *;
        `;
    
        const result = await executeQuery(query, values);
    
        if (result.error || result.data.length === 0) {
            return formatResponse(true, "Address not found or not updated");
        }
    
        return formatResponse(false, "Address updated successfully", result.data[0]);
    }
    
    /**
     * Delete an address by its ID and user ID.
     */
    public async deleteAddress(userId: number, addressId: number) {
        const result = await executeQuery(
            `DELETE FROM addresses WHERE address_id=$1 AND user_id=$2 RETURNING *;`,
            [addressId, userId]
        );

        if (result.error || result.data.length === 0) 
            return formatResponse(true, "Address not found or not deleted");

        return formatResponse(false, "Address deleted successfully", result.data[0]);
    }
}
