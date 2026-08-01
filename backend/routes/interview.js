import express from "express";
const router = express.Router();
import wrapAsync from "../utils/wrapAsync.js";
import { getHistory, getInterview, startInterview, submitAnswer, endInterview } from "../controllers/interviewController.js";
import { verifyToken } from "../middlewares/auth.js";

router.post("/start", verifyToken, wrapAsync(startInterview)) //To Start interview

router.post("/:id/answer", verifyToken, wrapAsync(submitAnswer)) //To Submit Aanswer
router.post("/:id/end", verifyToken, wrapAsync(endInterview)) //End interview early by user

router.get("/history/list", verifyToken, getHistory) //Interview history

router.get("/:id", verifyToken, wrapAsync(getInterview)) //returns full interview oblect

export default router;