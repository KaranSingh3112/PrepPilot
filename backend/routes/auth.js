import express from "express";
import { Router } from "express";
import wrapAsync from "../utils/wrapAsync.js";
import { login, register, me } from "../controllers/authController.js";
import { verifyToken } from "../middlewares/auth.js";

const router = express.Router();

router.post("/register", wrapAsync(register))

router.post("/login", wrapAsync(login))

router.get("/me",verifyToken, wrapAsync(me))

export default router;