import express from "express"
import "dotenv/config"
import mongoose from "mongoose";
import cors from "cors";
import authRoutes from "./routes/auth.js"
import interviewRoutes from "./routes/interview.js"

const app = express();
app.use(express.json({ limit: "10mb" }));
app.use(cors());

app.use("/api/v1/auth",authRoutes);
app.use("/api/v1/interview",interviewRoutes);

let PORT = process.env.PORT || 8080;

app.listen(PORT, ()=>{
    console.log(`App running on PORT ${PORT}`);
    connectDB()
});

const MONGODB_URI = process.env.MONGODB_URI;
let connectDB = async() => {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log("Database connected!");
    } catch (error) {
        console.log(error);
    }
}

app.use((err,req,res,next) => {
    console.error("Server Error: ", err.stack);
    res.status(500).json({message: "Internal server error", error: err.message});
})

app.use("/",(req,res) => {
    res.send("Backend of PrepPilot is running...")
})