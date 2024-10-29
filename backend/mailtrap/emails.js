import { PASSWORD_RESET_REQUEST_TEMPLATE,PASSWORD_RESET_SUCCESS_TEMPLATE } from "./emailTemplates.js"
import { sender, transport } from "./mailtrap.config.js"

export const sendPasswordResetEmail = async (email, resetToken) => {
    const recipient = [email]

    try {
        const response = await transport.sendMail({
            from: sender,
            to: recipient,
            subject: "Reset Your Password",
            html: PASSWORD_RESET_REQUEST_TEMPLATE.replace("{resetURL}", resetToken),
            category: "Reset Password"
        })
        console.log("Email sent successfully", response)
    } catch (error) {
        console.error("Error while sending password reset request email", error)
        throw new Error("Error while sending password reset request email", error)
    }
}

export const sendResetSuccessEmail = async(email) => {
    const recipient = [email]
    try {
        const response = await transport.sendMail({
            from: sender,
            to: recipient,
            subject: "Password Reset Successful",
            html: PASSWORD_RESET_SUCCESS_TEMPLATE,
            category: "Reset Password"
        })
        console.log("Email sent successfully", response)
    } catch (error) {
        console.error("Error while sending password reset successfull email", error)
        throw new Error("Error while sending password reset successful email", error)
    }
}