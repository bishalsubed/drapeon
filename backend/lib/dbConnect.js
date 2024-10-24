import mongoose from "mongoose";

export const dbConnect = async() => {
    try {
        const conn = await mongoose.connect(process.env.MONGO_URI);
        console.log(`MongoDb connected: ${conn.connection.host}`)
    } catch (error) {
        console.log(`Error accessing to Database: ${error.message}`)
        process.exit(1);
    }
}