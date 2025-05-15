
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

// Function to read Excel files
export const readExcelFile = (file: File): Promise<any[]> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        const workbook = XLSX.read(data, { type: 'binary' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        
        // Parse Excel data, preserving empty cells
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { 
          defval: null,
          raw: false
        });
        
        // Map column names to ensure consistency with expected format
        const mappedData = jsonData.map(row => {
          const mappedRow = {};
          Object.entries(row).forEach(([key, value]) => {
            // Handle specific column name variations (if any)
            mappedRow[key] = value;
          });
          return mappedRow;
        });
        
        resolve(mappedData);
      } catch (error) {
        reject(new Error("Failed to parse Excel file: " + error.message));
      }
    };
    
    reader.onerror = () => {
      reject(new Error("Failed to read file"));
    };
    
    reader.readAsBinaryString(file);
  });
};

// Function to convert data to Excel and download
export const convertToExcel = (data: any[], filename: string) => {
  try {
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Call Logs");
    
    // Generate Excel file
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    
    // Save file
    const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    saveAs(blob, `${filename}_${formatDate(new Date())}.xlsx`);
  } catch (error) {
    throw new Error("Failed to generate Excel file: " + error.message);
  }
};

// Helper function for formatting date in filename
const formatDate = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hour = String(date.getHours()).padStart(2, '0');
  const minute = String(date.getMinutes()).padStart(2, '0');
  const second = String(date.getSeconds()).padStart(2, '0');
  
  return `${year}${month}${day}${hour}${minute}${second}`;
};
