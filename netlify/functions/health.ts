import type { Handler } from "@netlify/functions";
import { jsonResponse } from "../lib/cors.js";

export const handler: Handler = async () => {
  return jsonResponse({ status: "ok" });
};
