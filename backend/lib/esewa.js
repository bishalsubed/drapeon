import dotenv from "dotenv";
dotenv.config();
import crypto from "crypto";
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

        let Data = atob(encodedData);
        let decodedData = await JSON.parse(Data);
        let headersList = {
            Accept: "application/json",
            "Content-Type": "application/json",
        };

        const data = `transaction_code=${decodedData.transaction_code},status=${decodedData.status},total_amount=${decodedData.total_amount},transaction_uuid=${decodedData.transaction_uuid},product_code=${process.env.ESEWA_PRODUCT_CODE},signed_field_names=${decodedData.signed_field_names}`;

        const secretKey = process.env.ESEWA_SECRET_KEY;
        const hash = crypto
            .createHmac("sha256", secretKey)
            .update(data)
            .digest("base64");

        if (hash !== decodedData.signature) {
            throw { message: "Invalid Info", decodedData };
        }

        let reqOptions = {
            url: `${process.env.ESEWA_GATEWAY_URL}/api/epay/transaction/status/?product_code=${process.env.ESEWA_PRODUCT_CODE}&total_amount=${decodedData.total_amount}&transaction_uuid=${decodedData.transaction_uuid}`,
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