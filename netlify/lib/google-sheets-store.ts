import { GoogleSpreadsheet } from "google-spreadsheet";
import { JWT } from "google-auth-library";
import { randomUUID } from "crypto";
import type { InquiryInput, InquiryRecord } from "./inquiry-schema.js";

// ── Helpers ──────────────────────────────────────────────────────────────────

const SHEET_NAME = "Inquiries";

const HEADER_VALUES = [
  "Submitted At (UTC)",
  "Name",
  "Email",
  "Company",
  "Project Type",
  "Description",
];

function getAuth(): JWT {
  const email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  const key = process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY;

  if (!email || !key) {
    throw new Error(
      "Missing GOOGLE_SERVICE_ACCOUNT_EMAIL or GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY environment variables.",
    );
  }

  return new JWT({
    email,
    // Netlify stores the key with literal "\n" — convert to real newlines.
    key: key.replace(/\\n/g, "\n"),
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });
}

async function getSheet() {
  const spreadsheetId = process.env.GOOGLE_SHEETS_SPREADSHEET_ID;
  if (!spreadsheetId) {
    throw new Error("Missing GOOGLE_SHEETS_SPREADSHEET_ID environment variable.");
  }

  const auth = getAuth();
  const doc = new GoogleSpreadsheet(spreadsheetId, auth);
  await doc.loadInfo();

  let sheet = doc.sheetsByTitle[SHEET_NAME];
  if (!sheet) {
    // First run — create the sheet with headers
    sheet = await doc.addSheet({
      title: SHEET_NAME,
      headerValues: HEADER_VALUES,
    });
  }

  return sheet;
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

// ── Public API ───────────────────────────────────────────────────────────────

/**
 * Append a new inquiry row to the Google Sheet and return the full record
 * (including generated `id` and `submittedAt`).
 */
export async function appendInquiry(
  input: InquiryInput,
): Promise<InquiryRecord> {
  const record: InquiryRecord = {
    id: randomUUID(),
    submittedAt: new Date().toISOString(),
    ...input,
    projectType: formatProjectType(input.projectType),
  };

  const sheet = await getSheet();

  await sheet.addRow({
    "Submitted At (UTC)": record.submittedAt,
    Name: record.name,
    Email: record.email,
    Company: record.company,
    "Project Type": record.projectType,
    Description: record.description,
  });

  return record;
}

/**
 * Read every inquiry from the sheet (for admin export).
 */
export async function getAllInquiries(): Promise<InquiryRecord[]> {
  const sheet = await getSheet();
  const rows = await sheet.getRows();

  return rows.map((row) => ({
    id: randomUUID(),
    submittedAt: row.get("Submitted At (UTC)") ?? "",
    name: row.get("Name") ?? "",
    email: row.get("Email") ?? "",
    company: row.get("Company") ?? "",
    projectType: row.get("Project Type") ?? "",
    description: row.get("Description") ?? "",
  }));
}

/**
 * Return high-level stats: total count + last submission timestamp.
 */
export async function getInquiryStats(): Promise<{
  count: number;
  lastUpdated: string | null;
}> {
  const sheet = await getSheet();
  const rows = await sheet.getRows();
  const count = rows.length;

  let lastUpdated: string | null = null;
  if (count > 0) {
    lastUpdated = rows[count - 1].get("Submitted At (UTC)") ?? null;
  }

  return { count, lastUpdated };
}
