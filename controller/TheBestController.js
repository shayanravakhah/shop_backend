import db from "../config/DB.js";

export const getMostSalesProducts = async (req, res) => {
    try {
        const selectQuery = `
            SELECT p.product_id , p.name , p.url , p.price , cat.name AS category_name , SUM(c.amount) AS total_sold
            FROM product p
            JOIN client_order c ON p.product_id = c.product_id JOIN category cat ON p.category_id = cat.id
            GROUP BY p.product_id
            ORDER BY total_sold DESC
            LIMIT 9
        `;
        const [topProducts] = await db.query(selectQuery);
        return res.status(200).json(topProducts);
    } catch (error) {
        return res.status(500).json({ msg: error.message });
    }
}

export const getMostSalesCategories = async (req, res) => {
    try {
        const selectQuery = `
            SELECT c.id, c.name,c.url, SUM(cl.amount) AS total_sold
            FROM category c JOIN product p ON c.id = p.category_id JOIN client_order cl ON p.product_id = cl.product_id
            GROUP BY c.id
            ORDER BY total_sold DESC
            LIMIT 3
        `;
        const [topCategories] = await db.query(selectQuery);
        return res.status(200).json(topCategories);
    } catch (error) {
        return res.status(500).json({ msg: error.message });
    }
}

export const getMostFrequentBuyers = async (req, res) => {
    try {
        const selectQuery = `
            SELECT 
                cl.name , 
                cl.phone_number  , 
                cl.email , 
                SUM(cl.amount * p.price) AS total_payment ,
                SUM(cl.amount) AS total_purchase
            FROM client_order AS cl INNER JOIN product AS p ON p.product_id = cl.product_id
            GROUP BY cl.email ,cl.name ,cl.phone_number
            ORDER BY total_payment DESC ,total_purchase DESC
            LIMIT 3
            `;
        const [topBuyers] = await db.query(selectQuery);
        return res.status(200).json(topBuyers);
    } catch (error) {
        return res.status(500).json({ msg: error.message });
    }
}