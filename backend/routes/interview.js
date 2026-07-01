import express from "express";
const router = express.Router();
import wrapAsync from "../utils/wrapAsync.js";
import { startInterview } from "../controllers/interviewController.js";
import { verifyToken } from "../middlewares/auth.js";

router.post("/start", verifyToken, wrapAsync(startInterview)) //To Start interview

router.post("/:id/answer", ()=>{}) //To Submit Aanswer

router.post("/:id", ()=>{}) //Interview report

router.post("/history/list", ()=>{}) //Interview history

export default router;