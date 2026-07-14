import User from "../models/user.js";
import wrapAsync from "../utils/wrapAsync.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const generateToken = (id) => {
    return jwt.sign({id}, process.env.JWT_SECRET, {expiresIn: "7d"})
};

const formatUser = (user) => ({
    id: user.id,
    name: user.username,
    email: user.email
});

export const register = async (req,res) => {
    const { username, email, password } = req.body;
    const existingUser = await User.findOne({email});
    if(existingUser){
        return res.status(400).json({message: "User already exists!"})
    }
    if(!username || !email || !password){
        return res.status(400).json({message: "Missing some reuired details"})
    }
    const hashedPassword = await bcrypt.hash(password, 10)
    const user = await User.create({
        username: username,
        email: email,
        password: hashedPassword
    })
    const token = generateToken(user._id)
    res.status(201).json({
         message: "User registered successfully",
         token,
         user: formatUser(user)
    })
}

export const login = async (req,res) => {
    const {email, password} = req.body;
    if(!email || !password){
        return res.status(400).json({message: "Please enter Email or password"})
    };
    const user = await User.findOne({email});
    if(!user){
        return res.status(404).json({message: "Invalid Credentails"})
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if(!isMatch){
        return res.status(400).json({message: "Invalid Credentails"})
    }
    const token = generateToken(user._id)
    res.status(200).json({
        token,
        user: formatUser(user)
    })
};

export const me = async(req,res) => {
    
    res.json({
        user: formatUser(req.user)
    });
};