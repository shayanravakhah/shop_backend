import db from "../config/DB.js";
import cloudinary from "../config/Cloudinary.js";

export const getAllProducts = async (req, res) => {
    try {
        const selectQuery = `
            SELECT p.product_id,p.category_id,p.name,p.url,p.description,p.price,c.name AS category_name 
            FROM product p INNER JOIN category c ON p.category_id = c.id
            ORDER BY p.name ASC
        `;
        const [products] = await db.query(selectQuery);
        res.status(200).json(products);
    } catch (error) {
        res.status(500).json({ msg: error.message });
    }

}

export const getProductsByCategoryID = async (req, res) => {
    try {
        const selectQuery = `
            SELECT p.product_id,p.category_id,p.name,p.url,p.description,p.price,c.name AS category_name 
            FROM product p INNER JOIN category c ON p.category_id = c.id
            WHERE p.category_id = ${req.params.id}
            ORDER BY p.name ASC
        `;
        const [products] = await db.query(selectQuery);
        res.status(200).json(products);
    } catch (error) {
        return res.status(500).json({ msg: error });
    }
}

export const getOneProduct = async (req, res) => {
    try {
        const selectQuery = `
            SELECT p.product_id,p.category_id,p.name,p.url,p.description,p.price,c.name AS category_name 
            FROM product p INNER JOIN category c ON p.category_id = c.id
            WHERE p.product_id = ${req.params.id}
        `;
        const [product] = await db.query(selectQuery);
        return res.status(200).json(product[0]);
    } catch (error) {
        res.status(500).json({ msg: error });
    }
}

export const saveProduct = async (req, res) => {
    try {
        if (!req.body) return res.status(400).json({ msg: "Please provide some information about the product." });
        if (!req.body.category_id) return res.status(400).json({ msg: "Category id is required." });
        const selectCategoryQuery = `
            SELECT *
            FROM category c
            WHERE c.id = ${req.body.category_id}
        `;
        const [category] = await db.query(selectCategoryQuery);
        if (category.length === 0) return res.status(400).json({ msg: "The selected category does not exist." });
        if (!req.body.description) return res.status(400).json({ msg: "Description is required." });
        if (!req.body.name) return res.status(400).json({ msg: "Name is required." });
        if (!req.body.price) return res.status(400).json({ msg: "Price is required." });
        if (!req.files || !req.files.file) return res.status(400).json({ msg: "You must select an image." });
        const { name, category_id, description, price } = req.body;
        const file = req.files.file;
        const fileSize = file.size;
        if (fileSize > 5 * 1024 * 1024) return res.status(400).json({ msg: "The image size is larger than 5 MB." });
        const dataNow = Date.now();
        const uploadResult = await cloudinary.uploader.upload(
            file.tempFilePath,
            {
                folder: 'product',
                public_id: dataNow
            }
        );
        if (!uploadResult) return res.status(500).json({ msg: "Image upload failed." });
        const optimizeUrl = cloudinary.url(`product/${dataNow}`, {
            fetch_format: "auto",
            quality: "auto",
        });
        const insertQuery = `
            INSERT INTO product (category_id, name, url, description, price)
            VALUES (${category_id}, '${name}', '${optimizeUrl}', '${description}', ${price})
        `;
        await db.query(insertQuery);
        res.status(200).json({ msg: "The product was added successfully." });
    } catch (error) {
        res.status(500).json({ error })
    }
}

export const deleteProduct = async (req, res) => {

    try {
        const selectQuery = `
            SELECT *
            FROM product p
            WHERE p.product_id = ${req.params.id}
        `;
        const [response] = await db.query(selectQuery);
        if (!response[0]) return res.status(404).json({ msg: "The product was not found ." });
        const removed = response[0];
        let fileName = null;

        if (removed.url) {
            try {
                fileName = removed.url.split("/").pop().split("?")[0];
                await cloudinary.uploader.destroy(`product/${fileName}`);
            } catch (err) {
                console.log("Cloudinary delete failed:", err.message);
            }
        }
        const removeQuery = `
            DELETE FROM product as p 
            WHERE p.product_id = ${req.params.id}
        `;
        await db.query(removeQuery);
        res.status(200).json({ msg: "The product was deleted successfully ." });
    } catch (error) {
        res.status(500).json({ msg: error });
    }
}

export const updateProduct = async (req, res) => {
    try {
        const selectQuery = `
            SELECT *
            FROM product p
            WHERE p.product_id = ${req.params.id}
        `;
        const [response] = await db.query(selectQuery);
        if (!response[0]) return res.status(404).json({ msg: "The product was not found." });
        const updated = response[0];
        if (req.body && req.body.category_id) {
            const selectCategoryQuery = `
                SELECT *
                FROM category c
                WHERE c.id = ${req.body.category_id}
            `;
            const [category] = await db.query(selectCategoryQuery);
            if (category.length === 0) return res.status(400).json({ msg: "The selected category does not exist." });
        }
        const name = req.body && req.body.name || updated.name
        const category_id = req.body && req.body.category_id || updated.category_id
        const description = req.body && req.body.description || updated.description
        const price = req.body && req.body.price || updated.price
        if (req.files && req.files.file) {
            const file = req.files.file;
            const fileSize = file.data.length;
            if (fileSize > 5 * 1024 * 1024) return res.status(400).json({ msg: "The image size is larger than 5 MB." });
            const dateNow = Date.now();
            const fileName = updated.url.split("/").pop().split("?")[0];
            const resCloud = await cloudinary.uploader.destroy(`product/${fileName}`);
            if (resCloud.result !== "ok") return res.status(500).json({ msg: "Cloudinary delete failed for product update." });
            let i = 0;
            let uploadResult = await cloudinary.uploader.upload(
                file.tempFilePath,
                {
                    folder: 'product',
                    public_id: dateNow
                }
            );
            while (i < 5 && uploadResult.result !== "ok") {

                uploadResult = await cloudinary.uploader.upload(
                    file.tempFilePath,
                    {
                        folder: 'product',
                        public_id: dateNow
                    }
                );
                i++
            }
            if (!uploadResult) return res.status(500).json({ msg: "Image upload failed." });
            const optimizeUrl = cloudinary.url(`product/${dateNow}`, {
                fetch_format: "auto",
                quality: "auto",
            });
            if (!optimizeUrl) {
                let res = await cloudinary.uploader.destroy(`product/${dateNow}`);
                let attempt = 0;
                while (res.result !== "ok" && attempt < 3) {
                    res = await cloudinary.uploader.destroy(`product/${dateNow}`);
                    attempt++;

                }
                return res.status(500).json({ msg: "Image optimization failed." });
            }
            const url = optimizeUrl;
            const updateQuery = `
                    UPDATE product
                    SET
                        category_id = ${category_id},
                        name = "${name}",
                        url = "${url}",
                        description = "${description}",
                        price = ${price}
                    WHERE product_id = ${req.params.id}
                `;
            await db.query(updateQuery);
            return res.status(200).json({ msg: "The product was updated successfully." });
        } else {
            const updateQuery = `
                UPDATE product
                SET
                category_id = ${category_id},
                name = "${name}",
                description = "${description}",
                price = ${price}
                WHERE product_id = ${req.params.id}
            `;
            await db.query(updateQuery);
            return res.status(200).json({ msg: "The product was updated successfully." });
        }

    } catch (error) {
        return res.status(500).json({ msg: error });
    }
}