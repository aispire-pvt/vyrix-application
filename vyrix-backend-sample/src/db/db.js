const mongoose= require("mongoose");

async function connectDB()
{
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("database has been successfully connected....");
    } catch (error) {
        console.error("DB connection failed:", error);
        process.exit(1);
    }
}
module.exports=connectDB;