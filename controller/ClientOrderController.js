import db from "../config/DB.js";

export const getAllOerders = async (req, res) => {
    try {
        const selectQuery = `
            SELECT c.*, p.name AS product_name
            FROM client_order AS c INNER JOIN product AS p ON c.product_id = p.product_id
            WHERE c.is_receive = FALSE
            ORDER BY c.created_at  ASC
        `;
        const [orders] = await db.query(selectQuery);
        return res.status(200).json(orders);
    } catch (error) {
        return res.status(500).json({ msg: error })
    }
}

export const getOneOrder = async (req, res) => {
    try {
        const selectQuery = `
            SELECT c.*, p.name AS product_name
            FROM client_order AS c INNER JOIN product AS p ON c.product_id = p.product_id
            WHERE id = ${req.params.id}
        `;
        const [order] = await db.query(selectQuery);
        return res.status(200).json(order[0])
    } catch (error) {
        return res.status(500).json({ msg: error })
    }
}
export const saveOrder = async (req, res) => {
    try {
        if (!req.body) return res.status(400).json({ msg: "Please provide some information about the order." });
        if (!req.body.product_id) return res.status(400).json({ msg: "Product ID is required" });
        const selectQuery = `
            SELECT *
            FROM product p
            WHERE p.product_id = ${req.body.product_id}
        `;
        const [response] = await db.query(selectQuery);
        if (!response[0]) return res.status(404).json({ msg: "The product was not found ." });
        if (!req.body.name) return res.status(400).json({ msg: "Your name is required" });
        if (!req.body.email) return res.status(400).json({ msg: "Please enter your email" });
        if (!req.body.zip_code) return res.status(400).json({ msg: "Please enter your zip code" });
        if (!req.body.phone_number) return res.status(400).json({ msg: "Please enter your phone number" });
        if (!req.body.address) return res.status(400).json({ msg: "Please enter your address" });
        if (!req.body.amount) return res.status(400).json({ msg: "Please enter Amount of your order ." });
        const name = req.body.name;
        const product_id = req.body.product_id;
        const email = req.body.email;
        const zip_code = req.body.zip_code;
        const phone_number = req.body.phone_number;
        const address = req.body.address;
        const amount = req.body.amount;
        const insertQuery = `
            INSERT INTO client_order (name, product_id, email, zip_code, phone_number, address, amount)
            VALUES ('${name}', ${product_id}, '${email}', '${zip_code}', '${phone_number}', '${address}', ${amount})
        `
        await db.query(insertQuery);
        return res.status(200).json({ msg: "Your order was registered successfully ." })
    } catch (error) {
        return res.status(500).json({ msg: error });
    }
}

export const deleteOrder = async (req, res) => {
    try {
        const selectQuery = `
            SELECT * FROM client_order
            WHERE id = ${req.params.id}
        `;
        const [removed] = await db.query(selectQuery);
        if (!removed[0]) return res.status(404).json({ msg: "The order was not found ." });
        const deleteQuery = `
            DELETE FROM client_order
            WHERE id = ${req.params.id}
        `;
        await db.query(deleteQuery);
        return res.status(200).json({ msg: "The order was deleted successfully ." })
    } catch (error) {
        return res.status(500).json({ msg: error })
    }
}

export const updateOrder = async (req, res) => {
    try {
        if (!req.body) return res.status(400).json({ msg: "Please provide some information about the your order ." });
        const selectQuery = `
            SELECT * FROM client_order
            WHERE id = ${req.params.id}
        `;

        const [updated] = await db.query(selectQuery);
        if (!updated[0]) return res.status(404).json({ msg: "The order was not found ." });
        if (req.body && req.body.product_id) {
            const selectProductQuery = `
                SELECT *
                FROM product p
                WHERE p.product_id = ${req.body.product_id}
            `;
            const [product] = await db.query(selectProductQuery);
            if (product.length === 0) return res.status(400).json({ msg: "The selected product does not exist." });
        }
        const name = req.body.name || updated[0].name;
        const product_id = req.body.product_id || updated[0].product_id;
        const email = req.body.email || updated[0].email;
        const zip_code = req.body.zip_code || updated[0].zip_code;
        const phone_number = req.body.phone_number || updated[0].phone_number;
        const address = req.body.address || updated[0].address;
        const amount = req.body.amount || updated[0].amount;
        const updateQuery = `
            UPDATE client_order
            SET name='${name}',
                product_id=${product_id},
                email='${email}',
                zip_code='${zip_code}',
                phone_number='${phone_number}',
                address='${address}',
                amount=${amount}
            WHERE id=${req.params.id}
        `;
        await db.query(updateQuery);
        return res.status(200).json({ msg: "The order was updated successfully ." });
    } catch (error) {
        return res.status(500).json({ msg: error });
    }

}

export const updateIsReceive = async (req, res) => {
    try {
        if (!req.body) return res.status(400).json({ msg: "Are you receive product ? Please confirme it ." });
        if (!req.body.is_receive) return res.status(400).json({ msg: "Are you receive product ? Please confirme it ." });
        const selectQuery = `
            SELECT * FROM client_order
            WHERE id = ${req.params.id}
        `;
        const [updated] = await db.query(selectQuery);
        if (!updated[0]) return res.status(404).json({ msg: "The order was not found ." });
        const is_receive = req.body.is_receive;
        const updateQuery = `
            UPDATE client_order
            SET 
                is_receive=${is_receive}
            WHERE id=${req.params.id}
        `;
        await db.query(updateQuery);
        return res.status(200).json({ msg: "The order was updated successfully ." });
    } catch (error) {
        return res.status(500).json({ msg: error });
    }

}