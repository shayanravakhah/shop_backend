import express from "express";
import cors from "cors"
import fileUpload from "express-fileupload";
import router from "./routes/superRoutes.js";

const app = express();
app.use(cors());
app.use(express.json());
app.use(fileUpload({ useTempFiles: true, tempFileDir: "/tmp/" }));
app.use(router)

app.listen(26936, () => console.log("Server is running on port 26936"));

