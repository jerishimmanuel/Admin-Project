import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { body, validationResult } from "express-validator";
import User from "../models/User.js";
const router = express.Router();
router.post("/signup",
  body("name").notEmpty(),
  body("email").isEmail(),
  body("password").isLength({ min: 6 }),
  body("role").isIn(["student","alumni","admin"]),
  async (req,res)=>{
    const errors = validationResult(req);
    if(!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
    const { name,email,password,role } = req.body;
    if(role === "student" && !email.endsWith("@kongu.edu")) return res.status(400).json({ message: "Only students with @kongu.edu email can register" });
    const existing = await User.findOne({ email });
    if(existing) return res.status(409).json({ message: "Email already registered" });
    const passwordHash = await bcrypt.hash(password,10);
    const user = await User.create({ name,email,passwordHash,role });
    const token = jwt.sign({ id:user._id, role:user.role, name:user.name }, process.env.JWT_SECRET, { expiresIn:"7d" });
    res.json({ token, user:{ id:user._id, name:user.name, email:user.email, role:user.role } });
  }
);
router.post("/login",
  body("email").isEmail(),
  body("password").notEmpty(),
  async (req,res)=>{
    const errors = validationResult(req);
    if(!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
    const { email,password } = req.body;
    const user = await User.findOne({ email });
    if(!user) return res.status(401).json({ message: "Invalid credentials" });
    const ok = await (await import("bcryptjs")).default.compare(password, user.passwordHash);
    if(!ok) return res.status(401).json({ message: "Invalid credentials" });
    const token = jwt.sign({ id:user._id, role:user.role, name:user.name }, process.env.JWT_SECRET, { expiresIn:"7d" });
    res.json({ token, user:{ id:user._id, name:user.name, email:user.email, role:user.role } });
  }
);
export default router;
