import dotenv from "dotenv";
dotenv.config();
import crypto from "crypto";
import axios from "axios";
export const getEsewaPaymentHash = async ({ amount, transaction_uuid }) => {
    try {
        const data = `total_amount=${amount},transaction_uuid=${transaction_uuid},product_code=${process.env.ESEWA_PRODUCT_CODE}`;

        const secretKey = process.env.ESEWA_SECRET_KEY;
        const hash = crypto
            .createHmac("sha256", secretKey)
            .update(data)
            .digest("base64");

        return {
            signature: hash,
            signed_field_names: "total_amount,transaction_uuid,product_code",
        };
    } catch (error) {
        console.log(`Error in getting esewa payment hash ${error.message}`)
        res.status(500).json({ success: false, message: "Error in checkout" })
    }
}


export const verifyEsewaPayment = async (encodedData) => {
    try {
        if (!encodedData) {
            throw new Error("encodedData is required and cannot be undefined.");
        }

        let obtainedData = Buffer.from(encodedData, 'base64').toString('utf-8')
        let decodedData = await JSON.parse(obtainedData);
        let headersList = {
            Accept: "application/json",
            "Content-Type": "application/json",
        };

        const fieldNames = decodedData.signed_field_names.split(",");
        const dataToSign = fieldNames.map((field) => `${field}=${decodedData[field]}`).join(",");


        const secretKey = process.env.ESEWA_SECRET_KEY;
        const hash = crypto
            .createHmac("sha256", secretKey)
            .update(dataToSign)
            .digest("base64");

        if (hash !== decodedData.signature) {
            throw { message: "Invalid Info", decodedData };
        }

        let reqOptions = {
            url: `https://rc.esewa.com.np/api/epay/transaction/status/?product_code=${process.env.ESEWA_PRODUCT_CODE}&total_amount=${decodedData.total_amount}&transaction_uuid=${decodedData.transaction_uuid}`,
            method: "GET",
            headers: headersList,
        };


        let response = await axios.request(reqOptions);
        
        if (
            response.data.status !== "COMPLETE" ||
            response.data.transaction_uuid !== decodedData.transaction_uuid ||
            Number(response.data.total_amount) !== Number(decodedData.total_amount)
        ) {
            throw { message: "Invalid Info", decodedData };
        }

        return { response: response.data, decodedData };
    } catch (error) {
        console.log(`Error in verifying esewa payment ${error.message}`);
        throw error;
    }
}