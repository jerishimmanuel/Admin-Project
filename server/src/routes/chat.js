import express from "express";
import { auth } from "../middleware/auth.js";
import Message from "../models/Message.js";
const router = express.Router();
router.get("/:userId", auth(["admin","alumni","student"]), async (req,res)=>{
  const other = req.params.userId;
  const me = req.user.id;
  const msgs = await Message.find({ $or: [ { from: me, to: other }, { from: other, to: me } ] }).sort({ createdAt: 1 });
  res.json(msgs);
});
export default router;
