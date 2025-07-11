import express from "express";
import { protectRoute, adminRoute } from "../middleware/auth.middleware.js";
import { getAllOrders, changeOrderStatus, deleteOrder, getOrderById, getUserOrders, getOrderByContact } from "../controllers/order.controller.js";

const router = express.Router();

router.get("/", protectRoute, adminRoute,getAllOrders)
router.get("/of-user", protectRoute,getUserOrders)
router.get("/id/:orderId", protectRoute,getOrderById)
router.patch("/:orderId", protectRoute, adminRoute,changeOrderStatus)
router.delete("/:orderId", protectRoute, adminRoute,deleteOrder)
router.get("/searchOrder", getOrderByContact);

export default router;