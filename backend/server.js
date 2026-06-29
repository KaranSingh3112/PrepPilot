import express from "express"
import "dotenv/config"
import mongoose from "mongoose";
import cors from "cors";

app.use(express.json());
app.use(cors());

const app = express();
let PORT = process.env.PORT || 8080;

app.use("/",(req,res) => {
    res.send("Backend of PrepPilot is running...")
})

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