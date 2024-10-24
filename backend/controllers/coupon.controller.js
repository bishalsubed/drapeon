import Coupon from "../models/coupon.model.js";

export const getCoupon = async (req, res) => {
    try {
        const coupon = await Coupon.findOne({ userId: req.user._id, isActive: true });
        res.status(200).json({ success: true, coupon });
    } catch (error) {
        console.log(`Error in getting coupon ${error.message}`);
        res.status(500).json({ success: false, message: "Error getting coupon" });
    }
}

export const validateCoupon = async (req, res) => {
    try {
        const { code } = req.body;
        const coupon = await Coupon.findOne({ code: code, userId: req.user._id, isActive: true });
        if (!coupon) {
            res.status(404).json({ success: false, message: "Coupon not valid" });
        }
        if (coupon.expirationDate < Date.now()) {
            coupon.isActive = false;
            await coupon.save();
            res.status(404).json({ success: false, message: "Coupon expired" });
        }
        res.status(200).json({
             success: true, 
             message: "Coupon valid",
             coupon:{
                code: coupon.code,
                discountPercentage: coupon.discountPercentage
             } });
    } catch (error) {
        console.log(`Error in validating coupon ${error.message}`);
        res.status(500).json({ success: false, message: "Error validating coupon" });
    }
}