
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { readExcelFile } from "@/utils/excelUtils";

interface FileUploadProps {
  onUploadSuccess: (data: any[]) => void;
  onUploadError: (message: string) => void;
}

const FileUpload = ({ onUploadSuccess, onUploadError }: FileUploadProps) => {
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
      const data = await readExcelFile(file);
      
      // Validate the expected columns
      const requiredColumns = [
        "No", "CallID", "Create By", "Phone", "3CX Phone Number", 
        "System", "CID", "AID", "SID", "Customer Name", "Splitter Name", 
        "Imported Date", "Start Support", "End Support", 
        "Support Duration (mn:ss)", "Source Name", "Location", "Prob#", 
        "Service Operation Type", "Symptom", "Solution", "Note", "Action"
      ];
      
      // Check if data has the right structure
      if (data.length === 0) {
        throw new Error("The Excel file appears to be empty");
      }
      
      // Get the keys from the first object
      const firstRow = data[0];
      const missingColumns = requiredColumns.filter(col => !(col in firstRow));
      
      if (missingColumns.length > 0) {
        throw new Error(`Missing required columns: ${missingColumns.join(", ")}`);
      }
      
      onUploadSuccess(data);
    } catch (error) {
      console.error("Error parsing Excel file:", error);
      onUploadError(error.message || "Failed to parse Excel file");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="grid w-full gap-1.5">
        <label htmlFor="file-upload" className="text-sm font-medium">
          Select Excel File (.xlsx)
        </label>
        <Input
          id="file-upload"
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
        {isLoading ? "Processing..." : "Upload File"}
      </Button>
      {file && (
        <p className="text-sm text-gray-500">
          Selected file: {file.name}
        </p>
      )}
    </div>
  );
};

export default FileUpload;
