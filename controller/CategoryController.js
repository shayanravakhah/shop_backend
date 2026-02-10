import db from "../config/DB.js";
import cloudinary from "../config/Cloudinary.js";


export const getAllCategories = async (req, res) => {
    try {
        const selectQuery = `
            SELECT * FROM category
            ORDER BY name ASC
        `;
        const [response] = await db.query(selectQuery);
        return res.status(200).json(response);
    } catch (error) {
        return res.status(500).json({ msg: error });
    }
}

export const getOneCategory = async (req, res) => {
    try {
        const selectQuery = `
            SELECT * FROM category
            WHERE id =  ${req.params.id}
        `;
        const [response] = await db.query(selectQuery)
        res.status(200).json(response[0]);
    } catch (error) {
        res.status(500).json({ msg: error.message })
    }
}

export const saveCategory = async (req, res) => {
    try {
        if (!req.body) return res.status(400).json({ msg: "Please provide some information about the category." });
        if (!req.body.name) return res.status(400).json({ msg: "Name is required." });
        const selectCategoryQuery = `
            SELECT *
            FROM category c
            WHERE c.name = "${req.body.name}"
        `;
        const [category] = await db.query(selectCategoryQuery);
        if (category.length > 0) return res.status(400).json({ msg: "This category already exists." });

        if (!req.files || !req.files.file) return res.status(400).json({ msg: "You must select an image." });
        const { name } = req.body;
        const file = req.files.file;
        const fileSize = file.data.length;
        if (fileSize > 5 * 1024 * 1024) return res.status(400).json({ msg: "The image size is larger than 5 MB." });
        const dateNow = Math.round(Date.now());
        const uploadResult = await cloudinary.uploader.upload(
            file.tempFilePath,
            {
                folder: 'category',
                public_id: dateNow
            }
        );
        if (!uploadResult) return res.status(500).json({ msg: "Image upload failed." });
        const optimizeUrl = cloudinary.url(`category/${dateNow}`, {
            fetch_format: "auto",
            quality: "auto",
        });
        const insertQuery = `
            INSERT INTO category (name, url)
            VALUES ('${name}', '${optimizeUrl}')
        `;
        await db.query(insertQuery);
        res.status(200).json({ msg: "The category was added successfully." });
    } catch (err) {
        return res.status(500).json({ msg: err.message });
    }
}

export const deleteCategory = async (req, res) => {
    try {
        const selectQuery = `
            SELECT * FROM category
            WHERE id =  ${req.params.id}
        `;
        const [response] = await db.query(selectQuery);
        if (!response[0]) return res.status(404).json({ msg: "The category was not found." });
        let fileName = null
        if (response[0].url) {
            try {
                fileName = response[0].url.split("/").pop().split("?")[0];
                await cloudinary.uploader.destroy(`category/${fileName}`);
            } catch (error) {
                console.log("Cloudinary delete failed:", err.message);
            }
        }
        const deleteQuery = `
            DELETE FROM category
            WHERE id = ${req.params.id}
        `;
        await db.query(deleteQuery);
        res.status(200).json({ msg: "The category was deleted successfully ." });
    } catch (error) {
        res.status(500).json({ msg: error.message });
    }
}

export const updateCategory = async (req, res) => {
    try {
        const selectQuery = `
            SELECT * 
            FROM category
            WHERE id =  ${req.params.id}
        `;
        const [respone] = await db.query(selectQuery);
        if (!respone[0]) return res.status(404).json({ msg: "The category was not found." });
        const updated = respone[0];
        let name = req.body.name !== undefined ? req.body.name : respone[0].name;
        let url = "";
        if (!req.files) {
            url = respone[0].url;
            try {
                const updateQuery = `
                UPDATE category
                SET 
                    name = '${name}',
                    url = '${url}'
                WHERE id=${req.params.id}
            `;
                await db.query(updateQuery);
                return res.status(200).json({ msg: "The category was update successfully." });
            } catch (err) {
                res.json({ msg: err.message });
            }
        } else {
            const file = req.files.file;
            const fileSize = file.data.length
            if (fileSize > 5 * 1024 * 1024) return res.status(400).json({ msg: "The image size is larger than 5 MB." });
            const dateNow = Math.round(Date.now());
            const fileName = updated.url.split("/").pop().split("?")[0];
            const resCloud = await cloudinary.uploader.destroy(`category/${fileName}`);
            if (resCloud.result !== "ok") return res.status(500).json({ msg: "Cloudinary delete failed for product update." });
            let i = 0;
            let uploadResult = await cloudinary.uploader.upload(
                file.tempFilePath,
                {
                    folder: 'category',
                    public_id: dateNow
                }
            );
            while (i < 5 && uploadResult.result !== "ok") {

                uploadResult = await cloudinary.uploader.upload(
                    file.tempFilePath,
                    {
                        folder: 'category',
                        public_id: dateNow
                    }
                );
                i++
            }
            if (!uploadResult) return res.status(500).json({ msg: "Image upload failed." });
            const optimizeUrl = cloudinary.url(`category/${dateNow}`, {
                fetch_format: "auto",
                quality: "auto",
            });
            if (!optimizeUrl) {
                let res = await cloudinary.uploader.destroy(`category/${dateNow}`);
                let attempt = 0;
                while (res.result !== "ok" && attempt < 3) {
                    res = await cloudinary.uploader.destroy(`category/${dateNow}`);
                    attempt++;

                }
                return res.status(500).json({ msg: "Image optimization failed." });
            }
            // try {
            //     await cloudinary.uploader.destroy(`category/${urlArr[urlArr.length - 1].split("?")[0]}`);
            // } catch (err) {
            //     console.log("Cloudinary delete failed:", err.message)
            // }
            // const uploadResult = await cloudinary.uploader.upload(
            //     file.tempFilePath,
            //     {
            //         folder: 'category',
            //         public_id: dateNow
            //     }
            // );
            // if (!uploadResult) return res.status(500).json({ msg: "Image upload failed." });
            // const optimizeUrl = cloudinary.url(`category/${dateNow}`, {
            //     fetch_format: "auto",
            //     quality: "auto",
            // });
            url = optimizeUrl;
            const updateQuery = `
                UPDATE category
                SET
                    name = '${name}',
                    url = '${url}'
                WHERE id=${req.params.id}
            `;
            await db.query(updateQuery);
            res.status(200).json({ msg: "The category was update successfully." });
        }
    } catch (err) {
        res.status(500).json({ msg: err.message });
    }
}
