import express from "express";
import dotenv from "dotenv";
import authRoutes from "./routes/auth.route.js"
import { dbConnect } from "./lib/dbConnect.js";
import cookieParser from "cookie-parser";
import productRoutes from "./routes/product.route.js"
import cartRoutes from "./routes/cart.route.js"
import analyticsRoutes from "./routes/analytics.route.js"
import couponRoutes from "./routes/coupon.route.js"
import paymentRoutes from "./routes/payment.route.js"
import cors from "cors";
import bodyParser from "body-parser";

dotenv.config()


const app = express();
const PORT = process.env.PORT;

app.use(bodyParser.json());

app.use(cors({
    origin: 'http://localhost:5173', 
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'], 
    credentials: true 
  }));
  

app.use(express.json({limit:"10mb"}));
app.use(cookieParser());
app.use("/api/auth",authRoutes)
app.use("/api/products",productRoutes)
app.use("/api/cart",cartRoutes)
app.use("/api/coupons",couponRoutes)
app.use("/api/analytics",analyticsRoutes)
app.use("/api/payments",paymentRoutes) 

app.listen(PORT, ()=>{
    console.log(`Server is running on the PORT:${PORT}`)
    dbConnect();
})