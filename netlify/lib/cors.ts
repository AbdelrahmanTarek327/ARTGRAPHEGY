/** Standard CORS headers applied to every API response. */
export const corsHeaders: Record<string, string> = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Admin-Key",
  "Access-Control-Max-Age": "86400",
};

/** Respond to an OPTIONS preflight request. */
export function preflight() {
  return {
    statusCode: 204,
    headers: corsHeaders,
    body: "",
  };
}

/** Build a JSON response with CORS headers baked in. */
export function jsonResponse(
  body: unknown,
  statusCode = 200,
  extraHeaders?: Record<string, string>,
) {
  return {
    statusCode,
    headers: {
      "Content-Type": "application/json",
      ...corsHeaders,
      ...extraHeaders,
    },
    body: JSON.stringify(body),
  };
}
