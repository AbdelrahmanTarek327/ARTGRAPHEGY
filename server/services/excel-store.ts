import ExcelJS from "exceljs";
import fs from "fs/promises";
import path from "path";
import { randomUUID } from "crypto";
import type { InquiryInput, InquiryRecord } from "../schema/inquiry.js";

const DATA_DIR = path.resolve(process.cwd(), "data", "private");
const FILE_PATH = path.join(DATA_DIR, "inquiries.xlsx");
const SHEET_NAME = "Inquiries";
const PENDING_FILE_PATH = path.join(DATA_DIR, "inquiries_pending.json");

const COLUMNS: Partial<ExcelJS.Column>[] = [
  { header: "Submitted At (UTC)", key: "submittedAt", width: 24 },
  { header: "Name", key: "name", width: 24 },
  { header: "Email", key: "email", width: 32 },
  { header: "Company", key: "company", width: 28 },
  { header: "Project Type", key: "projectType", width: 22 },
  { header: "Description", key: "description", width: 56 },
];

let writeLock: Promise<void> = Promise.resolve();

async function withWriteLock<T>(operation: () => Promise<T>): Promise<T> {
  const run = writeLock.then(operation);
  writeLock = run.then(
    () => undefined,
    () => undefined,
  );
  return run;
}

async function ensureWorkbook(): Promise<ExcelJS.Workbook> {
  await fs.mkdir(DATA_DIR, { recursive: true });

  const workbook = new ExcelJS.Workbook();
  workbook.creator = "Artgraphegy";
  workbook.created = new Date();

  let exists = false;
  try {
    await fs.access(FILE_PATH);
    exists = true;
  } catch {
    exists = false;
  }

  if (exists) {
    await workbook.xlsx.readFile(FILE_PATH);
    return workbook;
  } else {
    const sheet = workbook.addWorksheet(SHEET_NAME);
    sheet.columns = COLUMNS;
    styleHeaderRow(sheet);
    await workbook.xlsx.writeFile(FILE_PATH);
    return workbook;
  }
}

function getWorksheet(workbook: ExcelJS.Workbook): ExcelJS.Worksheet {
  let sheet = workbook.getWorksheet(SHEET_NAME);
  if (!sheet) {
    sheet = workbook.addWorksheet(SHEET_NAME);
    styleHeaderRow(sheet);
  }
  sheet.columns = COLUMNS;
  return sheet;
}

function styleHeaderRow(sheet: ExcelJS.Worksheet) {
  const headerRow = sheet.getRow(1);
  headerRow.font = { bold: true, color: { argb: "FFFFFFFF" } };
  headerRow.fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "FF1C1C1C" },
  };
  headerRow.alignment = { vertical: "middle", horizontal: "center" };
  headerRow.height = 22;
  sheet.views = [{ state: "frozen", ySplit: 1 }];
}

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

async function readPendingQueue(): Promise<InquiryRecord[]> {
  try {
    const data = await fs.readFile(PENDING_FILE_PATH, "utf-8");
    return JSON.parse(data);
  } catch {
    return [];
  }
}

async function writePendingQueue(queue: InquiryRecord[]): Promise<void> {
  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.writeFile(PENDING_FILE_PATH, JSON.stringify(queue, null, 2), "utf-8");
}

function hasInquiry(sheet: ExcelJS.Worksheet, submittedAt: string, email: string): boolean {
  const submittedAtCol = COLUMNS.findIndex(c => c.key === "submittedAt") + 1;
  const emailCol = COLUMNS.findIndex(c => c.key === "email") + 1;

  let found = false;
  sheet.eachRow((row) => {
    const rowSub = row.getCell(submittedAtCol).value;
    const rowEmail = row.getCell(emailCol).value;

    const subStr = rowSub instanceof Date ? rowSub.toISOString() : String(rowSub ?? "");
    const emailStr = String(rowEmail ?? "");

    if (subStr === submittedAt && emailStr === email) {
      found = true;
    }
  });
  return found;
}

export async function appendInquiry(input: InquiryInput): Promise<InquiryRecord> {
  return withWriteLock(async () => {
    const record: InquiryRecord = {
      id: randomUUID(),
      submittedAt: new Date().toISOString(),
      ...input,
      projectType: formatProjectType(input.projectType),
    };

    const queue = await readPendingQueue();
    queue.push(record);

    try {
      const workbook = await ensureWorkbook();
      const sheet = getWorksheet(workbook);

      for (const item of queue) {
        if (hasInquiry(sheet, item.submittedAt, item.email)) {
          continue;
        }

        const row = sheet.addRow({
          submittedAt: item.submittedAt,
          name: item.name,
          email: item.email,
          company: item.company,
          projectType: item.projectType,
          description: item.description,
        });

        row.alignment = { vertical: "top", wrapText: true };

        const descriptionColIndex =
          COLUMNS.findIndex((column) => column.key === "description") + 1;
        if (descriptionColIndex > 0) {
          row.getCell(descriptionColIndex).alignment = {
            vertical: "top",
            wrapText: true,
          };
        }
      }

      await workbook.xlsx.writeFile(FILE_PATH);

      try {
        await fs.unlink(PENDING_FILE_PATH);
      } catch {
        // ignore if already deleted
      }

      return record;
    } catch (error: any) {
      console.warn("[excel-store] Excel file is locked or busy. Saving to pending queue.", error.message);
      await writePendingQueue(queue);
      return record;
    }
  });
}

export function getInquiriesFilePath(): string {
  return FILE_PATH;
}

export async function inquiriesFileExists(): Promise<boolean> {
  try {
    await fs.access(FILE_PATH);
    return true;
  } catch {
    try {
      await fs.access(PENDING_FILE_PATH);
      return true;
    } catch {
      return false;
    }
  }
}

export async function getInquiriesWorkbookBuffer(): Promise<Buffer> {
  return withWriteLock(async () => {
    const workbook = await ensureWorkbook();
    const sheet = getWorksheet(workbook);
    const queue = await readPendingQueue();

    for (const item of queue) {
      if (!hasInquiry(sheet, item.submittedAt, item.email)) {
        const row = sheet.addRow({
          submittedAt: item.submittedAt,
          name: item.name,
          email: item.email,
          company: item.company,
          projectType: item.projectType,
          description: item.description,
        });

        row.alignment = { vertical: "top", wrapText: true };

        const descriptionColIndex =
          COLUMNS.findIndex((column) => column.key === "description") + 1;
        if (descriptionColIndex > 0) {
          row.getCell(descriptionColIndex).alignment = {
            vertical: "top",
            wrapText: true,
          };
        }
      }
    }

    const buffer = await workbook.xlsx.writeBuffer();
    return Buffer.from(buffer);
  });
}

async function flushPendingQueueInternal(): Promise<void> {
  const queue = await readPendingQueue();
  if (queue.length === 0) {
    return;
  }

  try {
    const workbook = await ensureWorkbook();
    const sheet = getWorksheet(workbook);
    let added = false;

    for (const item of queue) {
      if (hasInquiry(sheet, item.submittedAt, item.email)) {
        continue;
      }

      const row = sheet.addRow({
        submittedAt: item.submittedAt,
        name: item.name,
        email: item.email,
        company: item.company,
        projectType: item.projectType,
        description: item.description,
      });

      row.alignment = { vertical: "top", wrapText: true };

      const descriptionColIndex =
        COLUMNS.findIndex((column) => column.key === "description") + 1;
      if (descriptionColIndex > 0) {
        row.getCell(descriptionColIndex).alignment = {
          vertical: "top",
          wrapText: true,
        };
      }
      added = true;
    }

    await workbook.xlsx.writeFile(FILE_PATH);

    try {
      await fs.unlink(PENDING_FILE_PATH);
      console.log(`[excel-store] Successfully flushed ${queue.length} pending inquiries to Excel.`);
    } catch {
      // ignore
    }
  } catch (error: any) {
    // Only log if it's not a standard lock error (to avoid console spam)
    if (error.code !== "EBUSY" && error.code !== "EPERM") {
      console.error("[excel-store] Failed to flush pending queue:", error);
    }
  }
}

export async function flushPendingQueue(): Promise<void> {
  return withWriteLock(flushPendingQueueInternal);
}

let workerInterval: NodeJS.Timeout | null = null;

export function startPendingQueueWorker(intervalMs = 5000) {
  if (workerInterval) return;

  workerInterval = setInterval(async () => {
    try {
      const queue = await readPendingQueue();
      if (queue.length > 0) {
        await flushPendingQueue();
      }
    } catch {
      // ignore
    }
  }, intervalMs);

  // Run once shortly after startup
  setTimeout(async () => {
    try {
      const queue = await readPendingQueue();
      if (queue.length > 0) {
        await flushPendingQueue();
      }
    } catch {}
  }, 1000);
}

export function stopPendingQueueWorker() {
  if (workerInterval) {
    clearInterval(workerInterval);
    workerInterval = null;
  }
}

export type InquiryStats = {
  count: number;
  lastUpdated: string | null;
  pendingCount: number;
  filePath: string;
};

export async function getInquiryStats(): Promise<InquiryStats> {
  let count = 0;
  let lastUpdated: string | null = null;

  try {
    const stat = await fs.stat(FILE_PATH);
    lastUpdated = stat.mtime.toISOString();
  } catch {
    // File doesn't exist
  }

  const queue = await readPendingQueue();
  const pendingCount = queue.length;
  if (pendingCount > 0) {
    const latestPending = queue[queue.length - 1].submittedAt;
    if (!lastUpdated || latestPending > lastUpdated) {
      lastUpdated = latestPending;
    }
  }

  try {
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.readFile(FILE_PATH);
    const sheet = workbook.getWorksheet(SHEET_NAME);
    if (sheet) {
      count = Math.max(0, sheet.rowCount - 1);
    }
  } catch {
    // If locked or doesn't exist, we can't read rowCount directly.
  }

  count += pendingCount;

  return {
    count,
    lastUpdated,
    pendingCount,
    filePath: FILE_PATH,
  };
}
