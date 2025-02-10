import { executeQuery, formatResponse } from "../utils/helper";

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

export class AddressService {
    private async resetDefaultAddress(userId: number) {
        return await executeQuery(`UPDATE addresses SET is_default=false WHERE user_id=$1`, [userId]);
    }

    public async addAddress(address: Address) {
        const { user_id, street, city, state, country, postal_code, is_default, type } = address;

        if (is_default) await this.resetDefaultAddress(user_id);

        const result = await executeQuery(
            `INSERT INTO addresses (user_id, street, city, state, country, postal_code, is_default, type) 
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
            [user_id, street, city, state, country, postal_code, is_default, type]
        );

        if (result.error) return formatResponse(true, "Error adding address");
        return formatResponse(false, "Address added successfully", result.data[0]);
    }

    public async getAllAddresses(userId: number) {
        const result = await executeQuery(
            `SELECT street, city, state, country, postal_code, is_default, type FROM addresses WHERE user_id=$1`,
            [userId]
        );

        if (result.error) return formatResponse(true, "Error finding addresses", []);
        return formatResponse(false, "Addresses retrieved successfully", result.data);
    }

    public async getAddressById(addressId: number) {
        const result = await executeQuery(
            `SELECT street, city, state, country, postal_code, is_default, type FROM addresses WHERE address_id=$1`,
            [addressId]
        );

        if (result.error || result.data.length === 0) return formatResponse(true, "Address not found");
        return formatResponse(false, "Address retrieved successfully", result.data[0]);
    }

    public async updateAddress(userId: number, addressId: number, updates: Partial<Address>) {
        if (Object.keys(updates).length === 0) {
            return formatResponse(true, "No updates provided");
        }
    
        const setClause: string[] = [];
        const values: any[] = [];
    
        let index = 1; // Placeholder index for parameterized query
    
        for (const [key, value] of Object.entries(updates)) {
            setClause.push(`${key} = $${index}`);
            values.push(value);
            index++;
        }
    
        values.push(userId, addressId); // Adding userId and addressId at the end
    
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
    
    

    public async deleteAddress(userId: number, addressId: number) {
        const result = await executeQuery(
            `DELETE FROM addresses WHERE address_id=$1 AND user_id=$2 RETURNING *;`,
            [addressId, userId]
        );

        if (result.error || result.data.length === 0) return formatResponse(true, "Address not found or not deleted");
        return formatResponse(false, "Address deleted successfully", result.data[0]);
    }
}


