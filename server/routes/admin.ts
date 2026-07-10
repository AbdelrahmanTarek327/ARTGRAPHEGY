import { Router } from "express";
import fs from "fs/promises";
import { requireAdmin } from "../middleware/admin-auth.js";
import {
  getInquiriesFilePath,
  inquiriesFileExists,
  getInquiriesWorkbookBuffer,
  getInquiryStats,
} from "../services/excel-store.js";

export const adminRouter = Router();

adminRouter.use(requireAdmin);

adminRouter.get("/inquiries/export", async (_req, res) => {
  const filePath = getInquiriesFilePath();

  if (!(await inquiriesFileExists())) {
    return res.status(404).json({
      error: "No inquiries have been submitted yet.",
    });
  }

  try {
    const file = await getInquiriesWorkbookBuffer();
    const filename = `artgraphegy-inquiries-${new Date().toISOString().slice(0, 10)}.xlsx`;

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    );
    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
    res.setHeader("Cache-Control", "no-store");
    return res.send(file);
  } catch (error) {
    console.error("[admin] Failed to export inquiries:", error);
    return res.status(500).json({ error: "Unable to export inquiries." });
  }
});

adminRouter.get("/inquiries/stats", async (_req, res) => {
  const filePath = getInquiriesFilePath();

  if (!(await inquiriesFileExists())) {
    return res.json({ count: 0, lastUpdated: null });
  }

  try {
    const stats = await getInquiryStats();
    return res.json(stats);
  } catch (error) {
    console.error("[admin] Failed to read inquiry stats:", error);
    return res.status(500).json({ error: "Unable to read inquiry stats." });
  }
});
