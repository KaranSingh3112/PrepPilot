import express from "express";
const router = express.Router();

router.post("/start", ()=>{}) //To Start interview

router.post("/:id/answer", ()=>{}) //To Submit Aanswer

router.post("/:id", ()=>{}) //Interview report

router.post("/history/list", ()=>{}) //Interview history

export default router;