import jwt from "jsonwebtoken"
import User from "../models/user.js";

export const verifyToken = async(req,res,next) => {
    const authHeader = req.headers.authorization;
    if(!authHeader){
        return res.status(401).json({message: "No token provided"})
    }
    const token = authHeader.split(" ")[1];

    try {
        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET
        )
        
        const user = await User.findById(decoded.id);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        req.user = user;
        next()
    } catch (error) {
        res.status(403).json({message: "Invalid token"})
    }
}