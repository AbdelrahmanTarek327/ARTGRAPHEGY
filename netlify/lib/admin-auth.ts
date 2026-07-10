import type { HandlerEvent } from "@netlify/functions";
import { jsonResponse } from "./cors.js";

/**
 * Validate admin credentials on a Netlify Function event.
 * Returns `null` when auth succeeds, or a ready-made error response to return
 * immediately.
 */
export function requireAdmin(event: HandlerEvent) {
  const adminKey = process.env.ADMIN_API_KEY;

  if (!adminKey || adminKey.length < 16) {
    return jsonResponse(
      { error: "Admin access is not configured on the server." },
      503,
    );
  }

  const auth = event.headers["authorization"] ?? "";
  const xKey = event.headers["x-admin-key"] ?? "";

  let token = "";
  if (auth.startsWith("Bearer ")) {
    token = auth.slice("Bearer ".length).trim();
  } else if (xKey) {
    token = xKey.trim();
  }

  if (!token || token !== adminKey) {
    return jsonResponse({ error: "Unauthorized." }, 401);
  }

  return null; // auth OK
}
