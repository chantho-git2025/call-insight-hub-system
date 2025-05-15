
import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import SymptomChart from "@/components/charts/SymptomChart";
import SolutionChart from "@/components/charts/SolutionChart";
import SourceChart from "@/components/charts/SourceChart";
import HourlyChart from "@/components/charts/HourlyChart";
import DailyChart from "@/components/charts/DailyChart";
import LocationChart from "@/components/charts/LocationChart";

interface DashboardProps {
  data: any[];
}

const Dashboard = ({ data }: DashboardProps) => {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [filteredData, setFilteredData] = useState(data);

  const handleDateFilter = () => {
    if (!startDate && !endDate) {
      setFilteredData(data);
      return;
    }

    const filtered = data.filter((log) => {
      const supportDate = new Date(log["Start Support"]);
      const start = startDate ? new Date(startDate) : new Date(0);
      const end = endDate ? new Date(endDate) : new Date(8640000000000000);
      
      return supportDate >= start && supportDate <= end;
    });

    setFilteredData(filtered);
  };

  // Update filtered data when main data changes
  useEffect(() => {
    setFilteredData(data);
  }, [data]);

  return (
    <div className="space-y-6">
      <Card className="p-4">
        <h2 className="text-lg font-semibold mb-4">Dashboard Analytics</h2>
        
        {/* Date filter section */}
        <div className="flex flex-col sm:flex-row gap-2 mb-6">
          <div className="flex-1">
            <label className="text-sm text-gray-600">Start Date</label>
            <Input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>
          <div className="flex-1">
            <label className="text-sm text-gray-600">End Date</label>
            <Input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>
          <div className="flex items-end">
            <button 
              className="px-4 py-2 bg-primary text-white rounded-md text-sm"
              onClick={handleDateFilter}
            >
              Apply
            </button>
          </div>
        </div>
        
        {/* Chart tabs */}
        <Tabs defaultValue="location">
          <TabsList className="w-full grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 mb-6">
            <TabsTrigger value="location">Location</TabsTrigger>
            <TabsTrigger value="symptom">Symptom</TabsTrigger>
            <TabsTrigger value="solution">Solution</TabsTrigger>
            <TabsTrigger value="source">Source</TabsTrigger>
            <TabsTrigger value="hourly">By Hour</TabsTrigger>
            <TabsTrigger value="daily">By Day</TabsTrigger>
          </TabsList>
          
          <TabsContent value="location" className="h-[350px]">
            <LocationChart data={filteredData} />
          </TabsContent>
          
          <TabsContent value="symptom" className="h-[350px]">
            <SymptomChart data={filteredData} />
          </TabsContent>
          
          <TabsContent value="solution" className="h-[350px]">
            <SolutionChart data={filteredData} />
          </TabsContent>
          
          <TabsContent value="source" className="h-[350px]">
            <SourceChart data={filteredData} />
          </TabsContent>
          
          <TabsContent value="hourly" className="h-[350px]">
            <HourlyChart data={filteredData} />
          </TabsContent>
          
          <TabsContent value="daily" className="h-[350px]">
            <DailyChart data={filteredData} />
          </TabsContent>
        </Tabs>
      </Card>
      
      <Card className="p-4">
        <h2 className="text-lg font-semibold mb-4">Dashboard Summary</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-blue-100 p-4 rounded-lg text-center">
            <p className="text-sm text-gray-600">Total Calls</p>
            <p className="text-2xl font-bold">{filteredData.length}</p>
          </div>
          <div className="bg-green-100 p-4 rounded-lg text-center">
            <p className="text-sm text-gray-600">Locations</p>
            <p className="text-2xl font-bold">
              {new Set(filteredData.map(item => item.Location)).size}
            </p>
          </div>
          <div className="bg-yellow-100 p-4 rounded-lg text-center">
            <p className="text-sm text-gray-600">Avg Duration</p>
            <p className="text-2xl font-bold">
              {filteredData.length ? 
                calculateAvgDuration(filteredData) : "00:00"}
            </p>
          </div>
          <div className="bg-purple-100 p-4 rounded-lg text-center">
            <p className="text-sm text-gray-600">Service Types</p>
            <p className="text-2xl font-bold">
              {new Set(filteredData.map(item => item["Service Operation Type"])).size}
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
};

// Helper function to calculate average duration
const calculateAvgDuration = (data) => {
  if (!data.length) return "00:00";
  
  let totalMinutes = 0;
  let totalSeconds = 0;
  
  data.forEach(log => {
    if (!log["Support Duration (mn:ss)"]) return;
    
    const [minutes, seconds] = log["Support Duration (mn:ss)"].split(":").map(Number);
    totalMinutes += minutes || 0;
    totalSeconds += seconds || 0;
  });
  
  totalMinutes += Math.floor(totalSeconds / 60);
  totalSeconds = totalSeconds % 60;
  
  const avgMinutes = Math.floor(totalMinutes / data.length);
  const avgSeconds = Math.floor(totalSeconds / data.length);
  
  return `${avgMinutes.toString().padStart(2, '0')}:${avgSeconds.toString().padStart(2, '0')}`;
};

export default Dashboard;
