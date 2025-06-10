import User from "../models/User.model.js";
import jwt from "jsonwebtoken"
import crypto from "crypto"
import { sendPasswordResetEmail, sendResetSuccessEmail } from "../mailtrap/emails.js"

const generateAccessAndRefreshToken = async (userId) => {
    try {
        const user = await User.findById(userId)
        const accessToken = user.generateAccessToken()
        const refreshToken = user.generateRefreshToken()

        user.refreshToken = refreshToken
        await user.save({ validateBeforeSave: false })

        return { accessToken, refreshToken }
    } catch (error) {
        console.log("Error generating access and refresh token", error)
        throw new Error("Error generating access and refresh token")
    }
}

const setCookies = (res, accessToken, refreshToken) => {
    res.cookie("accessToken", accessToken, {
        httpOnly: true,
        secure: true,
        sameSite: "strict",
    });
    res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: true,
        sameSite: "strict",
    });
}

export const signUp = async (req, res) => {
    const { name, email, password } = req.body;
    try {
        const userAlreadyExists = await User.findOne({ email });
        if (userAlreadyExists) {
            return res.status(400).json({ success: false, message: "User Already Exists" })
        }
        const user = await User.create({ name, email, password })

        const { accessToken, refreshToken } = await generateAccessAndRefreshToken(user._id)

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
            return res.status(400).json({ success: false, message: "User Doesn't Exists" })
        }
        if (!(await user.comparePassword(password))) {
            return res.status(400).json({ success: false, message: "Incorrect Password" })
        }

        const { accessToken, refreshToken } = await generateAccessAndRefreshToken(user._id)


        setCookies(res, accessToken, refreshToken)
        return res.status(201).json({
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
        await User.findByIdAndUpdate(
            req.user._id,
            {
                $unset: {
                    refreshToken: 1,
                }
            },
            {
                new: true
            }
        )
        const options = {
            httpOnly: true,
            secure: true,
            sameSite: "strict",
        }

        return res
            .status(200)
            .clearCookie("accessToken", options)
            .clearCookie("refreshToken", options)
            .json({
                message: "User Logged Out Successfully"
            })
    } catch (error) {
        console.log("Error logging out user", error)
        return res.status(500).json({ message: "Error logging out user" })
    }
}

export const forgotPassword = async (req, res) => {
    const { email } = req.body;
    if (!email) {
        throw new Error("Email fields is required")
    }
    try {
        const user = await User.findOne({ email })
        if (!user) {
            throw new Error("User with this email doesn't exists")
        }
        const resetToken = crypto.randomBytes(20).toString("hex");
        const resetTokenExpiresAt = Date.now() + 1 * 60 * 60 * 1000;
        user.resetPasswordToken = resetToken;
        user.resetPasswordExpiresAt = resetTokenExpiresAt;
        await user.save();
        await sendPasswordResetEmail(user.email, `${process.env.CLIENT_URL}/reset-password/${resetToken}`);
        return res.status(201).json({ success: true, message: "Reset password email sent successfully" })
    } catch (error) {
        console.log("Error making request for resetting user password", error);
        return res.status(400).json({ success: false, message: error })
    }
};

export const resetPassword = async (req, res) => {
    try {
        const { token } = req.params;
        const { password } = req.body;

        const user = await User.findOne({
            resetPasswordToken: token,
            resetPasswordExpiresAt: { $gt: Date.now() },
        })

        if (!user) {
            return res.status(400).json({ success: false, message: "Invalid or expired reset token" })
        }

        user.password = password;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpiresAt = undefined;
        await user.save();
        await sendResetSuccessEmail(user.email);
        return res.status(200).json({ success: true, message: "Password reset successful" })
    } catch (error) {
        console.log(`Error while changing password: ${error}`)
        return res.status(400).json({ success: false, message: `Error while changing password: ${error}` })
    }
};

export const refreshToken = async (req, res) => {
    try {
        const incomingRefreshToken = req.cookies?.refreshToken || req.body.refreshToken
        if (!incomingRefreshToken) {
            return res.status(401).json({ success: false, message: "No refresh token provided" })
        }
        const decodedToken = jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET);
        if (!decodedToken) {
            return res.status(401).json({ success: false, message: "Unauthorized-Invalid token" })
        }

        const user = await User.findById(decodedToken?._id)
        if (!user) throw new Error("Invalid Token")

        const options = {
            httpOnly: true,
            secure: true,
            sameSite: "strict",
        }

        const { accessToken, refreshToken } = await generateAccessAndRefreshToken(user._id)

        return res
            .status(200)
            .cookie("accessToken", accessToken, options)
            .cookie("refreshToken", refreshToken, options)
            .json({
                accessToken,
                refreshToken
            })

    } catch (error) {
        console.log(`Error refreshing token ${error.message}`)
        res.status(500).json({ success: false, message: "Error refreshing token" })
    }
}

export const getProfile = async (req, res) => {
    try {
        return res.status(200).json({ success: true, user: req.user })
    } catch (error) {
        console.log(`Error getting profile ${error.message}`)
        throw error;
    }
}