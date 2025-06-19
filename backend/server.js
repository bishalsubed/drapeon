import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";
import path from "path";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import morgan from "morgan";


import { dbConnect } from "./lib/dbConnect.js";
import authRoutes from "./routes/auth.route.js"
import cartRoutes from "./routes/cart.route.js"
import productRoutes from "./routes/product.route.js"
import analyticsRoutes from "./routes/analytics.route.js"
import paymentRoutes from "./routes/payment.route.js"
import orderRoutes from "./routes/order.route.js"

dotenv.config()


const app = express();

app.set('trust proxy', 1);

const PORT = process.env.PORT;

const __dirname = path.resolve();


app.use(cors({
  origin: `${process.env.CLIENT_URL}`,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  credentials: true
}));

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: "Too many requests from this IP, please try again later."
});


app.use(express.json({ limit: "10mb" }));
app.use(cookieParser());

app.use(helmet.contentSecurityPolicy({
  directives: {
    defaultSrc: ["'self'"],
    imgSrc: ["'self'", "data:", "https://res.cloudinary.com"]
  }
}));
app.use(morgan("dev"));
app.use(limiter);

app.use("/api/auth", authRoutes)
app.use("/api/products", productRoutes)
app.use("/api/cart", cartRoutes)
app.use("/api/analytics", analyticsRoutes)
app.use("/api/payments", paymentRoutes)
app.use("/api/orders", orderRoutes)

if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "/frontend/dist")));

  app.get("*", (req, res) => {
    res.sendFile(path.resolve(__dirname, "frontend", "dist", "index.html"));
  })
}

app.listen(PORT, () => {
  console.log(`Server is running on the PORT:${PORT}`)
  dbConnect();
})