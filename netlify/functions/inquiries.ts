import type { Handler } from "@netlify/functions";
import { randomUUID } from "crypto";
import { inquirySchema } from "../lib/inquiry-schema.js";
import { sendInquiryEmail } from "../lib/email.js";
import { preflight, jsonResponse } from "../lib/cors.js";

function formatProjectType(value: string): string {
  const labels: Record<string, string> = {
    exhibition: "Exhibition Booth",
    cladding: "Wall Cladding",
    fitout: "Fit-Out",
    facade: "Glass Facade",
    printing: "Advertising/Printing",
    other: "Other",
  };
  return labels[value] ?? value;
}

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

  // Send Email
  try {
    const record = {
      id: randomUUID(),
      submittedAt: new Date().toISOString(),
      ...parsed.data,
      projectType: formatProjectType(parsed.data.projectType),
    };

    await sendInquiryEmail(record);

    return jsonResponse(
      { message: "Inquiry received successfully.", id: record.id },
      201,
    );
  } catch (error) {
    console.error("[inquiries] Failed to process inquiry:", error);
    return jsonResponse(
      { error: "Unable to save your inquiry. Please try again shortly." },
      500,
    );
  }
};
