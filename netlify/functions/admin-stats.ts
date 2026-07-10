import type { Handler } from "@netlify/functions";
import { requireAdmin } from "../lib/admin-auth.js";
import { getInquiryStats } from "../lib/google-sheets-store.js";
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
    const stats = await getInquiryStats();
    return jsonResponse(stats);
  } catch (error) {
    console.error("[admin-stats] Failed to read inquiry stats:", error);
    return jsonResponse({ error: "Unable to read inquiry stats." }, 500);
  }
};
