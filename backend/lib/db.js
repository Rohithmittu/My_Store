import mongoose from "mongoose"

export const connectDB = async() => {
    try {
        const response = await mongoose.connect(process.env.MONGO_URI);

        console.log(`MongoDB connected Succesfully`);

    } catch (error) {

        console.log("Error connecting to MongoDB",error.message);
        process.exit(1);
        
    }
}