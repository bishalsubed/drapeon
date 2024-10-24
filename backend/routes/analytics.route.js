import express from "express";
import { adminRoute,protectRoute } from "../middleware/auth.middleware.js";
import { getAnalyticsData, getDailySalesData } from "../controllers/analytics.controller.js";


const router = express.Router()

router.get("/",protectRoute, adminRoute, async (req, res) => {
    try {
        const analyticsData = await getAnalyticsData()
        const endDate = new Date();
        const startDate = new Date(endDate.getTime() - 7 * 24 * 60 * 60 * 1000);
        const dailySalesData = await getDailySalesData(startDate, endDate)
        res.status(200).json({ success: true, analyticsData, dailySalesData })
    } catch (error) {
        console.log(`Error in getting analytics ${error.message}`)
        res.status(500).json({ success: false, message: "Error in getting analytics" })
    }
})

export default router;