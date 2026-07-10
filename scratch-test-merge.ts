import fs from "fs/promises";
import path from "path";
import ExcelJS from "exceljs";
const COLUMNS = [
  { header: "ID", key: "id", width: 38 },
  { header: "Submitted At (UTC)", key: "submittedAt", width: 24 },
  { header: "Name", key: "name", width: 24 },
  { header: "Email", key: "email", width: 32 },
  { header: "Company", key: "company", width: 28 },
  { header: "Project Type", key: "projectType", width: 22 },
  { header: "Description", key: "description", width: 56 },
];
async function run() {
  const dataDir = path.resolve("data", "private");
  const origExcel = path.join(dataDir, "inquiries.xlsx");
  const tempExcel = path.join(dataDir, "inquiries_temp_test.xlsx");
  const pendingFile = path.join(dataDir, "inquiries_pending.json");
  console.log("Setting up temp test files...");
  try {
    await fs.copyFile(origExcel, tempExcel);
    console.log("Copied inquiries.xlsx to inquiries_temp_test.xlsx");
  } catch (err) {
    console.log("No inquiries.xlsx found, starting clean sheet");
  }
  // Write some custom pending inquiries to inquiries_pending.json
  const initialPending = [
    {
      id: "pending-id-123",
      submittedAt: new Date().toISOString(),
      name: "Queue Item 1",
      company: "Pending Co",
      projectType: "Wall Cladding",
      description: "This item was queued when the spreadsheet was locked.",
      email: "queue1@example.com"
    }
  ];
  await fs.writeFile(pendingFile, JSON.stringify(initialPending, null, 2), "utf-8");
  console.log("Wrote pending item to inquiries_pending.json");
  console.log("Running the merge logic test...");
  
  const workbook = new ExcelJS.Workbook();
  try {
    await workbook.xlsx.readFile(tempExcel);
    console.log("Loaded workbook.");
  } catch {
    console.log("Created new workbook.");
    workbook.creator = "Artgraphegy";
    workbook.created = new Date();
  }
  let sheet = workbook.getWorksheet("Inquiries");
  if (!sheet) {
    sheet = workbook.addWorksheet("Inquiries");
  }
  
  // Re-assign columns to restore the key mappings!
  sheet.columns = COLUMNS;
  // Read pending
  const queue = JSON.parse(await fs.readFile(pendingFile, "utf-8"));
  // Add a new one
  queue.push({
    id: "new-id-456",
    submittedAt: new Date().toISOString(),
    name: "Queue Item 2",
    company: "New Co",
    projectType: "Fit-Out",
    description: "This item is submitted now when the spreadsheet is unlocked.",
    email: "queue2@example.com"
  });
  const hasInquiryId = (sheet, id) => {
    let found = false;
    sheet.eachRow((row) => {
      if (row.getCell(1).value === id) found = true;
    });
    return found;
  };
  for (const item of queue) {
    if (hasInquiryId(sheet, item.id)) {
      console.log(`Skipping already existing id: ${item.id}`);
      continue;
    }
    const row = sheet.addRow(item);
    row.alignment = { vertical: "top", wrapText: true };
  }
  await workbook.xlsx.writeFile(tempExcel);
  await fs.unlink(pendingFile);
  console.log("Successfully wrote to temp Excel and cleared pending queue file!");
  // Verify rows in the tempExcel
  const checkWorkbook = new ExcelJS.Workbook();
  await checkWorkbook.xlsx.readFile(tempExcel);
  const checkSheet = checkWorkbook.getWorksheet("Inquiries");
  console.log(`Resulting rows count: ${checkSheet.rowCount}`);
  checkSheet.eachRow((row, index) => {
    console.log(`Row ${index}:`, row.values);
  });
  // Clean up
  await fs.unlink(tempExcel);
  console.log("Cleaned up temp test files.");
}
run();