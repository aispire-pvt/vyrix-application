const mongoose= require("mongoose");

async function connectDB()
{
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("database has been successfully connected....");
    } catch (error) {
        console.error("DB connection failed: ",error);
    }
}
module.exports=connectDB;