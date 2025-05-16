
import { useState, useEffect } from "react";
import Dashboard from "@/components/Dashboard";
import CallLogTable from "@/components/CallLogTable";
import FileUpload from "@/components/FileUpload";
import SearchFilter from "@/components/SearchFilter";
import Productivity from "@/components/Productivity";
import CSAT from "@/components/CSAT";
import Schedule from "@/components/Schedule";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { convertToExcel } from "@/utils/excelUtils";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const Index = () => {
  const [callLogs, setCallLogs] = useState([]);
  const [filteredLogs, setFilteredLogs] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("dashboard");
  const { toast } = useToast();

  useEffect(() => {
    // Initialize with empty data
    setFilteredLogs(callLogs);
  }, [callLogs]);

  const handleFileUpload = (data) => {
    // Add an id field to each record for easier handling in the table
    const dataWithIds = data.map((item, index) => ({
      id: `call-${index}`,
      ...item
    }));
    
    setCallLogs(dataWithIds);
    setFilteredLogs(dataWithIds);
    toast({
      title: "Upload Successful",
      description: `${data.length} records have been loaded.`,
      variant: "default",
    });
  };

  const handleSearch = (searchResults) => {
    setFilteredLogs(searchResults);
  };

  const handleExport = () => {
    if (filteredLogs.length === 0) {
      toast({
        title: "Export Failed",
        description: "No data to export.",
        variant: "destructive",
      });
      return;
    }

    try {
      convertToExcel(filteredLogs, "call_logs_export");
      toast({
        title: "Export Successful",
        description: "File has been downloaded.",
        variant: "default",
      });
    } catch (error) {
      toast({
        title: "Export Failed",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-primary text-white py-6 shadow-md">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl font-bold">Call Log Management System</h1>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column */}
          <div className="lg:col-span-4 space-y-6">
            {/* File Upload */}
            <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
              <h2 className="text-xl font-semibold mb-4">Upload Call Log Data</h2>
              <FileUpload onUploadSuccess={handleFileUpload} onUploadError={(msg) => toast({ title: "Upload Error", description: msg, variant: "destructive" })} />
            </div>

            {/* Search and Filter */}
            <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
              <h2 className="text-xl font-semibold mb-4">Search & Filter</h2>
              <SearchFilter data={callLogs} onSearch={handleSearch} />
              <div className="mt-4">
                <Button 
                  onClick={handleExport}
                  className="w-full"
                  variant="outline"
                >
                  Export to Excel
                </Button>
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="lg:col-span-8 space-y-6">
            {/* Navigation Tabs */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200">
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <div className="border-b">
                  <TabsList className="w-full flex flex-wrap bg-transparent h-auto p-0">
                    <TabsTrigger 
                      value="dashboard"
                      className={`px-4 py-3 text-sm font-medium rounded-none ${
                        activeTab === "dashboard" 
                          ? "bg-primary text-white" 
                          : "text-gray-600 hover:bg-gray-100"
                      }`}
                    >
                      Dashboard
                    </TabsTrigger>
                    <TabsTrigger 
                      value="records"
                      className={`px-4 py-3 text-sm font-medium rounded-none ${
                        activeTab === "records" 
                          ? "bg-primary text-white" 
                          : "text-gray-600 hover:bg-gray-100"
                      }`}
                    >
                      Records
                    </TabsTrigger>
                    <TabsTrigger 
                      value="productivity"
                      className={`px-4 py-3 text-sm font-medium rounded-none ${
                        activeTab === "productivity" 
                          ? "bg-primary text-white" 
                          : "text-gray-600 hover:bg-gray-100"
                      }`}
                    >
                      Productivity
                    </TabsTrigger>
                    <TabsTrigger 
                      value="csat"
                      className={`px-4 py-3 text-sm font-medium rounded-none ${
                        activeTab === "csat" 
                          ? "bg-primary text-white" 
                          : "text-gray-600 hover:bg-gray-100"
                      }`}
                    >
                      CSAT
                    </TabsTrigger>
                    <TabsTrigger 
                      value="schedule"
                      className={`px-4 py-3 text-sm font-medium rounded-none ${
                        activeTab === "schedule" 
                          ? "bg-primary text-white" 
                          : "text-gray-600 hover:bg-gray-100"
                      }`}
                    >
                      Schedule
                    </TabsTrigger>
                  </TabsList>
                </div>

                <div className="p-6">
                  <TabsContent value="dashboard">
                    <Dashboard data={filteredLogs} />
                  </TabsContent>
                  <TabsContent value="records">
                    <CallLogTable data={filteredLogs} />
                  </TabsContent>
                  <TabsContent value="productivity">
                    <Productivity data={filteredLogs} />
                  </TabsContent>
                  <TabsContent value="csat">
                    <CSAT />
                  </TabsContent>
                  <TabsContent value="schedule">
                    <Schedule />
                  </TabsContent>
                </div>
              </Tabs>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-4">
        <div className="container mx-auto px-4 text-center">
          <p>Call Log Management System © 2025</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
