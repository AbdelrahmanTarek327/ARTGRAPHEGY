import ExcelJS from "exceljs";
import path from "path";

const FILE_PATH = path.resolve("./data/private/inquiries.xlsx");

async function run() {
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.readFile(FILE_PATH);
  
  const sheet = workbook.getWorksheet("Inquiries");
  if (!sheet) {
    console.error("Sheet 'Inquiries' not found!");
    process.exit(1);
  }

  console.log("Sheet row count:", sheet.rowCount);
  
  // Print headers
  const firstRow = sheet.getRow(1);
  console.log("Header row values:", firstRow.values);

  // Print first data row if exists
  if (sheet.rowCount > 1) {
    const secondRow = sheet.getRow(2);
    console.log("Second row values:", secondRow.values);
  }
}

run().catch((err) => {
  console.error("Error running script:", err);
  process.exit(1);
});
