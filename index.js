import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import bodyParser from "body-parser";
import dotenv from "dotenv";
import mongoose from "mongoose";
import fileUpload from "express-fileupload";
import AuthRouter from "./routes/AuthRoutes.js";

dotenv.config();
const app = express();
app.use(bodyParser.json({ extended: true }));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(fileUpload());
app.use(cors());

//routes
app.use('/api', AuthRouter);

const PORT = 5000;
mongoose.set("strictQuery", false);
mongoose.connect(process.env.MONGODB_URL, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => app.listen(PORT, () => console.log(`Server is running on port : http://localhost:${PORT}`)))
    .catch((error) => console.log(error))