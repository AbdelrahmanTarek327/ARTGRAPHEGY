import "dotenv/config";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import path from "path";
import { inquiriesRouter } from "./routes/inquiries.js";
import { adminRouter } from "./routes/admin.js";
import { startPendingQueueWorker } from "./services/excel-store.js";

const app = express();
const port = Number(process.env.SERVER_PORT ?? 3001);
const isProduction = process.env.NODE_ENV === "production";

app.use(helmet({ contentSecurityPolicy: false }));
app.use(
  cors({
    origin: isProduction ? false : true,
    credentials: true,
  }),
);
app.use(express.json({ limit: "32kb" }));

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.use("/api/inquiries", inquiriesRouter);
app.use("/api/admin", adminRouter);

if (isProduction) {
  const distPath = path.resolve(process.cwd(), "dist");
  app.use(express.static(distPath));

  app.get(/^(?!\/api).*/, (_req, res) => {
    res.sendFile(path.join(distPath, "index.html"));
  });
}

app.use((_req, res) => {
  res.status(404).json({ error: "Not found." });
});

const server = app.listen(port, "0.0.0.0", () => {
  console.log(`[server] Listening on http://localhost:${port}`);
  if (!process.env.ADMIN_API_KEY) {
    console.warn(
      "[server] ADMIN_API_KEY is not set. Admin export routes are disabled.",
    );
  }
  startPendingQueueWorker();
});

server.on("error", (error: NodeJS.ErrnoException) => {
  if (error.code === "EADDRINUSE") {
    console.error(
      `[server] Port ${port} is already in use. Stop the other dev server (Ctrl+C in its terminal) or set a different SERVER_PORT in .env.`,
    );
    process.exit(1);
  }

  throw error;
});
