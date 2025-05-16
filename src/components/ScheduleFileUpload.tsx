
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import * as XLSX from "xlsx";
import { Upload } from "lucide-react";

interface FileUploadProps {
  onUploadSuccess: (data: any[]) => void;
  onUploadError: (message: string) => void;
}

const ScheduleFileUpload = ({ onUploadSuccess, onUploadError }: FileUploadProps) => {
  const [file, setFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      onUploadError("Please select a file to upload");
      return;
    }

    // Check file extension
    if (!file.name.endsWith(".xlsx") && !file.name.endsWith(".xls")) {
      onUploadError("Invalid file format. Please upload an Excel file (.xlsx or .xls)");
      return;
    }

    setIsLoading(true);
    try {
      // Read file
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = e.target?.result;
          const workbook = XLSX.read(data, { type: 'binary' });
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];
          
          // Parse Excel data
          const jsonData = XLSX.utils.sheet_to_json(worksheet, { 
            defval: null,
            raw: false
          });
          
          // Validate required columns
          const requiredColumns = ["Name", "Date", "Shifts", "Position"];
          
          if (jsonData.length === 0) {
            throw new Error("The Excel file appears to be empty");
          }
          
          // Get the keys from the first object
          const firstRow = jsonData[0] as Record<string, any>;
          const missingColumns = requiredColumns.filter(col => !(col in firstRow));
          
          if (missingColumns.length > 0) {
            throw new Error(`Missing required columns: ${missingColumns.join(", ")}`);
          }
          
          // Save file to uploads directory (this would be handled by the server in a real application)
          // For demo, we'll just log the file info
          console.log(`Schedule file would be saved to: /uploads/${file.name}`);
          
          onUploadSuccess(jsonData);
        } catch (error: any) {
          onUploadError(error.message || "Failed to parse Excel file");
        } finally {
          setIsLoading(false);
        }
      };
      
      reader.onerror = () => {
        onUploadError("Failed to read file");
        setIsLoading(false);
      };
      
      reader.readAsBinaryString(file);
    } catch (error: any) {
      onUploadError(error.message || "An error occurred");
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="grid w-full gap-1.5">
        <label htmlFor="schedule-file-upload" className="text-sm font-medium">
          Select Schedule Excel File (.xlsx)
        </label>
        <Input
          id="schedule-file-upload"
          type="file"
          accept=".xlsx,.xls"
          onChange={handleFileChange}
          disabled={isLoading}
        />
      </div>
      <Button 
        onClick={handleUpload} 
        disabled={!file || isLoading} 
        className="w-full"
      >
        {isLoading ? (
          "Processing..."
        ) : (
          <>
            <Upload className="mr-2 h-4 w-4" />
            Upload Schedule
          </>
        )}
      </Button>
      {file && (
        <p className="text-sm text-gray-500">
          Selected file: {file.name}
        </p>
      )}
    </div>
  );
};

export default ScheduleFileUpload;
