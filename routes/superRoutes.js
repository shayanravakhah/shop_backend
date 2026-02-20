import express from "express";
import { deleteCategory, getAllCategories, saveCategory, getOneCategory, updateCategory } from "../controller/CategoryController.js";
import {  saveProduct, getOneProduct, deleteProduct, updateProduct, getProductsByCategoryID, getAllProducts } from "../controller/ProductController.js";
import { deleteOrder, getAllOerders, getOneOrder, saveOrder, updateIsReceive, updateOrder } from "../controller/ClientOrderController.js";
import { getMostFrequentBuyers, getMostSalesCategories, getMostSalesProducts } from "../controller/TheBestController.js";


// http://localhost:26936/ , https://super-web-application-backend-production.up.railway.app/
const router = express.Router()

router.get("/category", getAllCategories);
router.get("/category/:id", getOneCategory);
router.post("/category", saveCategory);
router.put("/category/:id", updateCategory);
router.delete("/category/:id", deleteCategory);

router.get("/products", getAllProducts);
router.get("/products/:id", getProductsByCategoryID);
router.get("/product/:id", getOneProduct);
router.post("/product", saveProduct);
router.delete("/product/:id" , deleteProduct);
router.put("/product/:id" , updateProduct);

router.get("/client-order",getAllOerders);
router.get("/client-order/:id" , getOneOrder);
router.post("/client-order" , saveOrder);
router.delete("/client-order/:id",deleteOrder);
router.put("/client-order/:id" , updateOrder);
router.put("/client-order/:id" , updateOrder);
router.put("/client-order/is-receive/:id" , updateIsReceive);

router.get("/most/products", getMostSalesProducts);
router.get("/most/categories", getMostSalesCategories);
router.get("/most/buyers", getMostFrequentBuyers);





export default router;