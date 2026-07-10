import type { Request, Response, NextFunction } from "express";

function extractToken(req: Request): string | null {
  const header = req.get("Authorization");
  if (header?.startsWith("Bearer ")) {
    return header.slice("Bearer ".length).trim();
  }

  const apiKey = req.get("X-Admin-Key");
  return apiKey?.trim() ?? null;
}

export function requireAdmin(req: Request, res: Response, next: NextFunction) {
  const adminKey = process.env.ADMIN_API_KEY;

  if (!adminKey || adminKey.length < 16) {
    return res.status(503).json({
      error: "Admin access is not configured on the server.",
    });
  }

  const token = extractToken(req);
  if (!token || token !== adminKey) {
    return res.status(401).json({ error: "Unauthorized." });
  }

  next();
}
