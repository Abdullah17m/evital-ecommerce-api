import pool from "../config/database";

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

const executeQuery = async (query: string, values: any[]) => {
    try {
        const result = await pool.query(query, values);
        return { error: false, data: result.rows };
    } catch (error) {
        console.error("Database Query Error:", error);
        return { error: true, data: [] };
    }
};

const formatResponse = (error: boolean, message: string, data: any = {}) => {
    return { error, message, data };
};

const resetDefaultAddress = async (userId: number) => {
    return await executeQuery(`UPDATE addresses SET is_default=false WHERE user_id=$1`, [userId]);
};

export const addAddress = async (address: Address) => {
    const { user_id, street, city, state, country, postal_code, is_default, type } = address;

    if (is_default) await resetDefaultAddress(user_id);

    const result = await executeQuery(
        `INSERT INTO addresses (user_id, street, city, state, country, postal_code, is_default, type) 
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
        [user_id, street, city, state, country, postal_code, is_default, type]
    );

    if (result.error) return formatResponse(true, "Error adding address");
    return formatResponse(false, "Address added successfully", result.data[0]);
};

export const getAllAddress = async (userId: number) => {
    const result = await executeQuery(
        `SELECT street, city, state, country, postal_code, is_default, type FROM addresses WHERE user_id=$1`,
        [userId]
    );

    if (result.error) return formatResponse(true, "Error finding addresses", []);
    return formatResponse(false, "Addresses retrieved successfully", result.data);
};

export const getAddressById = async (addressId: number) => {
    const result = await executeQuery(
        `SELECT street, city, state, country, postal_code, is_default, type FROM addresses WHERE address_id=$1`,
        [addressId]
    );

    if (result.error || result.data.length === 0) return formatResponse(true, "Address not found");
    return formatResponse(false, "Address retrieved successfully", result.data[0]);
};

export const updateAddress = async (userId: number, addressId: number, updates: Partial<Address>) => {
    const query = `
        UPDATE addresses 
        SET 
            street = COALESCE($2, street),
            city = COALESCE($3, city),
            state = COALESCE($4, state),
            country = COALESCE($5, country),
            postal_code = COALESCE($6, postal_code),
            is_default = COALESCE($7, is_default),
            type = COALESCE($8, type)
        WHERE address_id = $1 AND user_id = $9
        RETURNING *;
    `;

    const values = [
        addressId,
        updates.street ?? null,
        updates.city ?? null,
        updates.state ?? null,
        updates.country ?? null,
        updates.postal_code ?? null,
        updates.is_default ?? null,
        updates.type ?? null,
        userId,
    ];

    const result = await executeQuery(query, values);
    if (result.error || result.data.length === 0) return formatResponse(true, "Address not found or not updated");
    return formatResponse(false, "Address updated successfully", result.data[0]);
};

export const deleteAddress = async (userId: number, addressId: number) => {
    const result = await executeQuery(
        `DELETE FROM addresses WHERE address_id=$1 AND user_id=$2 RETURNING *;`,
        [addressId, userId]
    );

    if (result.error || result.data.length === 0) return formatResponse(true, "Address not found or not deleted");
    return formatResponse(false, "Address deleted successfully", result.data[0]);
};
