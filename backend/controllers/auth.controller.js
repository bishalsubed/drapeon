import User from "../models/User.model.js";
import jwt from "jsonwebtoken"
import redis from "../lib/redis.js"

const generateToken = (userId) => {
    const accessToken = jwt.sign({ userId }, process.env.ACCESS_TOKEN_SECRET, {
        expiresIn: "15m",
    })
    const refreshToken = jwt.sign({ userId }, process.env.REFRESH_TOKEN_SECRET, {
        expiresIn: "7d",
    })
    return { accessToken, refreshToken }
}

const storeRefreshToken = async (userId, refreshToken) => {
    await redis.set(`refresh_token:${userId}`, refreshToken, "EX", 7 * 24 * 60 * 60)
}

const setCookies = (res, accessToken, refreshToken) => {
    res.cookie("accessToken", accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 15 * 60 * 1000,
    });
    res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 7 * 24 * 60 * 60 * 1000,
    });
}
export const signUp = async (req, res) => {
    const { name, email, password } = req.body;
    try {
        const userAlreadyExists = await User.findOne({ email });
        if (userAlreadyExists) {
            res.status(400).json({ success: false, message: "User Already Exists" })
        }
        const user = await User.create({ name, email, password })

        const { accessToken, refreshToken } = generateToken(user._id)

        await storeRefreshToken(user._id, refreshToken)

        setCookies(res, accessToken, refreshToken)
        res.status(201).json({
            success: true, message: "User registered successfully", user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
            }
        })

    } catch (error) {
        console.log(`Error registering user ${error.message}`)
        res.status(400).json({ success: false, message: "Error registering User" })

    }
}
export const login = async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user) {
            res.status(400).json({ success: false, message: "User Doesn't Exists" })
        }
        if (!(await user.comparePassword(password))) {
            res.status(400).json({ success: false, message: "Incorrect Password" })
        }

        const { accessToken, refreshToken } = generateToken(user._id)

        await storeRefreshToken(user._id, refreshToken)

        setCookies(res, accessToken, refreshToken)
        res.status(201).json({
            success: true, message: "User logged In successfully", user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
            }
        })

    } catch (error) {
        console.log(`Error logging in user ${error.message}`)
        res.status(400).json({ success: false, message: `Error logging User` })

    }
}

export const logout = async (req, res) => {
    try {
        const refreshToken = req.cookies.refreshToken;
        const accessToken = req.cookies.accessToken;
        if (refreshToken) {
            const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET)
            await redis.del(`refresh_token:${decoded.userId}`)
        }
        res.clearCookie(accessToken);
        res.clearCookie(refreshToken);
        res.status(200).json({ success: true, message: "Logged out successfully" })
    } catch (error) {
        console.log(`Error logging out ${error.message}`)
        res.status(500).json({ success: false, message: "Error logging out user" })
    }
}

export const refreshToken = async (req, res) => {
    try {
        const refreshToken = req.cookies.refreshToken;
        if (!refreshToken) {
            return res.status(401).json({ success: false, message: "No refresh token provided" })
        }
        const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
        if (!decoded) {
            return res.status(401).json({ success: false, message: "Unauthorized-Invalid token" })
        }
        const storedToken = await redis.get(`refresh_token:${decoded.userId}`)
        if (!storedToken || storedToken !== refreshToken) {
            return res.status(401).json({ success: false, message: "Unauthorized-Invalid token" })
        }
        const accessToken = jwt.sign({ userId: decoded.userId }, process.env.ACCESS_TOKEN_SECRET, {
            expiresIn: "15m",
        })
        res.cookie("accessToken", accessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            maxAge: 15 * 60 * 1000,
        });

        res.status(200).json({ success: true, message: "Token refreshed successfully" })
    } catch (error) {
        console.log(`Error refreshing token ${error.message}`)
        res.status(500).json({ success: false, message: "Error refreshing token" })
    }
}

export const getProfile = async (req, res) => {
    try {
        res.status(200).json({ success: true, user: req.user })
    } catch (error) {
        console.log(`Error getting profile ${error.message}`)
        throw error;
    }
}