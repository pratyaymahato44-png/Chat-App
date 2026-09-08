import mongoose from "mongoose";
import { DB_NAME } from "../constant.js";

const connectDB = async () => {
    try {
        const connectionInstance = await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)

        console.log("\n MongoDB conneted !! DB Host:",connectionInstance.connection.host);
        
    } catch (error) {
        console.log("MongoDB connection FAILED !!");
        console.error(error.message);
        process.exit(1)       
    }
}

export default connectDB
