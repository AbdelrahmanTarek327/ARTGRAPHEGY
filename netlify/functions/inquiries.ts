import type { Handler } from "@netlify/functions";
import { inquirySchema } from "../lib/inquiry-schema.js";
import { appendInquiry } from "../lib/google-sheets-store.js";
import { preflight, jsonResponse } from "../lib/cors.js";

export const handler: Handler = async (event) => {
  if (event.httpMethod === "OPTIONS") {
    return preflight();
  }

  if (event.httpMethod !== "POST") {
    return jsonResponse({ error: "Method not allowed." }, 405);
  }

  // Parse body
  let body: unknown;
  try {
    body = JSON.parse(event.body ?? "{}");
  } catch {
    return jsonResponse({ error: "Invalid JSON." }, 400);
  }

  // Validate
  const parsed = inquirySchema.safeParse(body);
  if (!parsed.success) {
    return jsonResponse(
      {
        error: "Invalid inquiry data.",
        details: parsed.error.flatten().fieldErrors,
      },
      400,
    );
  }

  // Persist to Google Sheets
  try {
    const record = await appendInquiry(parsed.data);
    return jsonResponse(
      { message: "Inquiry received successfully.", id: record.id },
      201,
    );
  } catch (error) {
    console.error("[inquiries] Failed to save inquiry:", error);
    return jsonResponse(
      { error: "Unable to save your inquiry. Please try again shortly." },
      500,
    );
  }
};
