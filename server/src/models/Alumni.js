import mongoose from "mongoose";

const alumniSchema = new mongoose.Schema({
  name: { type: String, required: true },
  phone: { type: String },
  registerNumber: { type: String },
  email: { type: String, required: true, unique: true },
  department: { type: String, required: true },
  section: { type: String, enum: ["A","B","C","D","E","F"], required: true },
  passOutYear: { type: Number, required: true },
  courseDurationYears: { type: Number, required: true },
  placed: { type: Boolean, default: false },
  company: { type: String, default: "" },
  location: { type: String, default: "" },
  minCTC: { type: Number, default: 0 },
  designation: { type: String, default: "" }
}, { timestamps: true });

export default mongoose.model("Alumni", alumniSchema);