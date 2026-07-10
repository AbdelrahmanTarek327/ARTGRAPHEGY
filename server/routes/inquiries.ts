import { Router } from "express";
import rateLimit from "express-rate-limit";
import { inquirySchema } from "../schema/inquiry.js";
import { appendInquiry } from "../services/excel-store.js";

export const inquiriesRouter = Router();

const submitLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many inquiries. Please try again later." },
});

inquiriesRouter.post("/", submitLimiter, async (req, res) => {
  const parsed = inquirySchema.safeParse(req.body);

  if (!parsed.success) {
    return res.status(400).json({
      error: "Invalid inquiry data.",
      details: parsed.error.flatten().fieldErrors,
    });
  }

  try {
    const record = await appendInquiry(parsed.data);
    return res.status(201).json({
      message: "Inquiry received successfully.",
      id: record.id,
    });
  } catch (error) {
    console.error("[inquiries] Failed to save inquiry:", error);
    return res.status(500).json({
      error: "Unable to save your inquiry. Please try again shortly.",
    });
  }
});
