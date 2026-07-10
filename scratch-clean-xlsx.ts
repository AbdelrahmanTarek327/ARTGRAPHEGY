import ExcelJS from "exceljs";
import path from "path";

const FILE_PATH = path.resolve("./data/private/inquiries.xlsx");

const COLUMNS = [
  "Submitted At (UTC)",
  "Name",
  "Email",
  "Company",
  "Project Type",
  "Description"
];

async function run() {
  console.log("Reading workbook from:", FILE_PATH);
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.readFile(FILE_PATH);
  
  const sheet = workbook.getWorksheet("Inquiries");
  if (!sheet) {
    console.error("Sheet 'Inquiries' not found!");
    process.exit(1);
  }

  console.log("Original row count:", sheet.rowCount);

  // 1. Correct the header row
  const headerRow = sheet.getRow(1);
  console.log("Old header row:", headerRow.values);
  headerRow.values = COLUMNS;
  console.log("New header row:", headerRow.values);

  // 2. Shift all data rows left if they start with a UUID
  sheet.eachRow((row, rowNumber) => {
    if (rowNumber === 1) return; // Skip headers

    const vals = row.values as any[];
    if (!vals || vals.length <= 1) return;

    // vals[1] is the first column (ExcelJS row.values is 1-indexed)
    const firstCell = String(vals[1] ?? "");
    const looksLikeUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(firstCell) 
      || firstCell.startsWith("pending-id") 
      || firstCell.startsWith("new-id")
      || firstCell.startsWith("test-inquiry");

    if (looksLikeUUID) {
      console.log(`Row ${rowNumber}: ID found in column 1 ('${firstCell}'). Shifting left...`);
      // Shift left by removing index 1
      const newVals = [null, ...vals.slice(2)];
      row.values = newVals;
      // Re-apply style/alignment if needed
      row.alignment = { vertical: "top", wrapText: true };
    } else {
      console.log(`Row ${rowNumber}: No ID in column 1. First cell is: '${firstCell}'`);
    }
  });

  console.log("Writing cleaned workbook back to disk...");
  await workbook.xlsx.writeFile(FILE_PATH);
  console.log("Workbook successfully cleaned and saved!");
}

run().catch((err) => {
  console.error("Error during cleaning:", err);
  process.exit(1);
});
