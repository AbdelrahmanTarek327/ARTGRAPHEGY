import type { Handler } from "@netlify/functions";
import { requireAdmin } from "../lib/admin-auth.js";
import { getAllInquiries } from "../lib/google-sheets-store.js";
import { preflight, jsonResponse } from "../lib/cors.js";

export const handler: Handler = async (event) => {
  if (event.httpMethod === "OPTIONS") {
    return preflight();
  }

  if (event.httpMethod !== "GET") {
    return jsonResponse({ error: "Method not allowed." }, 405);
  }

  // Authenticate
  const authError = requireAdmin(event);
  if (authError) return authError;

  try {
    const inquiries = await getAllInquiries();

    if (inquiries.length === 0) {
      return jsonResponse(
        { error: "No inquiries have been submitted yet." },
        404,
      );
    }

    return jsonResponse({
      count: inquiries.length,
      inquiries,
    });
  } catch (error) {
    console.error("[admin-export] Failed to export inquiries:", error);
    return jsonResponse({ error: "Unable to export inquiries." }, 500);
  }
};
