import express from "express";
import multer from "multer";
import xlsx from "xlsx";
import { body, validationResult } from "express-validator";
import Alumni from "../models/Alumni.js";
import { auth } from "../middleware/auth.js";
import { SECTIONS } from "../utils/departments.js";
import { isGraduated } from "../utils/validateGraduation.js";
import { sendCongratsEmail } from "../utils/mailer.js";

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

// Admin: add alumni manually
router.post("/",
  auth(["admin"]),
  body("name").notEmpty(),
  body("email").isEmail(),
  body("phone").isLength({ min: 10, max: 10 }).withMessage("Phone must be 10 digits"),
  body("registerNumber").notEmpty(),
  body("department").notEmpty(),
  body("section").isIn(SECTIONS),
  body("passOutYear").isInt({ min: 1900 }),
  body("courseDurationYears").isInt({ min: 1, max: 6 }),
  // Optionally validate placed/company/location/minCTC/designation
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array(), message: "Validation failed" });

    const {
      name, email, phone, registerNumber, department, section,
      passOutYear, courseDurationYears,
      placed = false,
      company = "",
      location = "",
      minCTC = 0,
      designation = ""
    } = req.body;

    if (!isGraduated({ passOutYear, courseDurationYears })) {
      return res.status(400).json({ message: "Not graduated yet. Please enter pass-out year and course duration correctly." });
    }

    const exists = await Alumni.findOne({ email });
    if (exists) return res.status(409).json({ message: "Alumni already exists" });

    const alum = await Alumni.create({
      name,
      email,
      phone,
      registerNumber,
      department,
      section,
      passOutYear,
      courseDurationYears,
      placed,
      company: placed ? company : "",
      location: placed ? location : "",
      minCTC: placed ? minCTC : 0,
      designation: placed ? designation : ""
    });
    try { await sendCongratsEmail(email, name); } catch (e) { console.warn("Email send failed", e.message); }
    res.json(alum);
  }
);

// Admin: bulk upload via Excel
// Expect columns: name,email,phone,registerNumber,department,section,passOutYear,courseDurationYears,placed,company,location,minCTC,designation
router.post("/upload", auth(["admin"]), upload.single("file"), async (req, res) => {
  if (!req.file) return res.status(400).json({ message: "File is required" });
  const wb = xlsx.read(req.file.buffer, { type: "buffer" });
  const sheet = wb.Sheets[wb.SheetNames[0]];
  const rows = xlsx.utils.sheet_to_json(sheet);
  const results = { created: 0, skipped: [], errors: [] };

  for (let i = 0; i < rows.length; i++) {
    const r = rows[i];
    try {
      if (!r.name || !r.email || !r.phone || !r.registerNumber || !r.department || !r.section || !r.passOutYear || !r.courseDurationYears) {
        results.errors.push({ row: i+2, reason: "Missing fields" });
        continue;
      }
      if (!SECTIONS.includes(String(r.section))) {
        results.errors.push({ row: i+2, reason: "Invalid section" });
        continue;
      }
      if (!/^\d{10}$/.test(r.phone)) {
        results.errors.push({ row: i+2, reason: "Invalid phone number" });
        continue;
      }
      if (!isGraduated({ passOutYear: Number(r.passOutYear), courseDurationYears: Number(r.courseDurationYears) })) {
        results.skipped.push({ row: i+2, reason: "Not graduated" });
        continue;
      }
      const exists = await Alumni.findOne({ email: r.email });
      if (exists) {
        results.skipped.push({ row: i+2, reason: "Duplicate email" });
        continue;
      }
      const placed = r.placed === true || r.placed === "true" || r.placed === 1 || r.placed === "1";
      const alum = await Alumni.create({
        name: r.name,
        email: r.email,
        phone: r.phone,
        registerNumber: r.registerNumber,
        department: r.department,
        section: String(r.section),
        passOutYear: Number(r.passOutYear),
        courseDurationYears: Number(r.courseDurationYears),
        placed: placed,
        company: placed ? (r.company || "") : "",
        location: placed ? (r.location || "") : "",
        minCTC: placed ? Number(r.minCTC || 0) : 0,
        designation: placed ? (r.designation || "") : ""
      });
      try { await sendCongratsEmail(alum.email, alum.name); } catch {}
      results.created++;
    } catch (e) {
      results.errors.push({ row: i+2, reason: e.message });
    }
  }

  res.json(results);
});

// View alumni by department and section with counts
router.get("/stats", auth(["admin"]), async (req, res) => {
  const pipeline = [
    { $group: { _id: { department: "$department", section: "$section" }, count: { $sum: 1 } } },
    { $sort: { "_id.department": 1, "_id.section": 1 } }
  ];
  const agg = await Alumni.aggregate(pipeline);
  res.json(agg);
});

router.get("/", auth(["admin", "alumni", "student"]), async (req, res) => {
  const { department, section } = req.query;
  const q = {};
  if (department) q.department = department;
  if (section) q.section = section;
  const list = await Alumni.find(q).sort({ department: 1, section: 1, name: 1 });
  res.json(list);
});

export default router;