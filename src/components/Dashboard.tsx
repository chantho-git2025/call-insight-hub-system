import { useState, useEffect, useRef } from "react";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ResponsivePie } from "@nivo/pie";
import { ResponsiveBar } from "@nivo/bar";
import { ChartScreenshot } from "@/components/ui/chart-screenshot";
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
  const [serviceType, setServiceType] = useState("all");
  const [symptom, setSymptom] = useState("all");
  const [solution, setSolution] = useState("all");
  
  // Refs for chart containers to enable screenshots
  const inboundChartRef = useRef<HTMLDivElement>(null);
  const serviceOpChartRef = useRef<HTMLDivElement>(null);
  const workingShiftChartRef = useRef<HTMLDivElement>(null);
  const topSymptomsChartRef = useRef<HTMLDivElement>(null);
  
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

  // Get unique values for dropdown filters
  const getUniqueValues = (field: string) => {
    const values = new Set<string>();
    data.forEach(item => {
      if (item[field] && typeof item[field] === 'string') {
        values.add(item[field]);
      }
    });
    return Array.from(values);
  };

  // Filter data for service operation charts
  const filterServiceData = () => {
    let filtered = [...filteredData];
    
    if (serviceType !== 'all') {
      filtered = filtered.filter(item => item["Service Operation Type"] === serviceType);
    }
    
    if (symptom !== 'all') {
      filtered = filtered.filter(item => item["Symptom"] === symptom);
    }
    
    if (solution !== 'all') {
      filtered = filtered.filter(item => item["Solution"] === solution);
    }
    
    return filtered;
  };

  // Calculate inbound vs missed calls data
  const calculateCallSourceData = () => {
    const counts = {
      "Call-In": 0,
      "Missed Call": 0
    };
    
    filteredData.forEach(item => {
      const source = item["Source"];
      if (source === "Call-In") counts["Call-In"]++;
      else if (source === "Missed Call") counts["Missed Call"]++;
    });
    
    return [
      { id: "Call-In", label: "Call-In", value: counts["Call-In"] },
      { id: "Missed Call", label: "Missed Call", value: counts["Missed Call"] }
    ];
  };

  // Calculate working hours vs non-working hours
  const calculateWorkingHoursData = () => {
    const counts = {
      "Working Hours (8AM-5PM)": 0,
      "Non-Working Hours (5PM-8AM)": 0
    };
    
    filteredData.forEach(item => {
      const time = item["Start Support"];
      if (!time) return;
      
      try {
        const date = new Date(time);
        const hour = date.getHours();
        
        if (hour >= 8 && hour < 17) {
          counts["Working Hours (8AM-5PM)"]++;
        } else {
          counts["Non-Working Hours (5PM-8AM)"]++;
        }
      } catch (error) {
        console.error("Invalid date:", time);
      }
    });
    
    return [
      { id: "Working Hours", label: "Working Hours (8AM-5PM)", value: counts["Working Hours (8AM-5PM)"] },
      { id: "Non-Working Hours", label: "Non-Working Hours (5PM-8AM)", value: counts["Non-Working Hours (5PM-8AM)"] }
    ];
  };

  // Calculate top 5 symptoms
  const calculateTopSymptoms = () => {
    const counts: Record<string, number> = {};
    
    filteredData.forEach(item => {
      const symptom = item["Symptom"];
      if (symptom) {
        counts[symptom] = (counts[symptom] || 0) + 1;
      }
    });
    
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([name, value]) => ({ id: name, value, [name]: value }));
  };
  
  // Calculate daily service operations by date
  const calculateDailyServiceData = () => {
    const serviceData: { [key: string]: number } = {};
    
    // Initialize days 1-31
    for (let i = 1; i <= 31; i++) {
      const day = i.toString().padStart(2, '0');
      serviceData[day] = 0;
    }
    
    const filteredServiceData = filterServiceData();
    
    filteredServiceData.forEach(item => {
      const date = item["Start Support"];
      if (!date) return;
      
      try {
        const day = new Date(date).getDate().toString().padStart(2, '0');
        serviceData[day] = (serviceData[day] || 0) + 1;
      } catch (error) {
        console.error("Invalid date:", date);
      }
    });
    
    return Object.entries(serviceData)
      .map(([day, count]) => ({ 
        day, 
        count,
        id: day
      }));
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
          <TabsList className="w-full grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 mb-6">
            <TabsTrigger value="location">Location</TabsTrigger>
            <TabsTrigger value="symptom">Symptom</TabsTrigger>
            <TabsTrigger value="solution">Solution</TabsTrigger>
            <TabsTrigger value="source">Source</TabsTrigger>
            <TabsTrigger value="hourly">By Hour</TabsTrigger>
            <TabsTrigger value="daily">By Day</TabsTrigger>
            <TabsTrigger value="inbound">Inbound & Missed</TabsTrigger>
            <TabsTrigger value="servicetype">Service Type</TabsTrigger>
            <TabsTrigger value="workingshift">Working Shift</TabsTrigger>
            <TabsTrigger value="suggestion">Suggestion</TabsTrigger>
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
          
          {/* New Tabs */}
          
          {/* Inbound & Missed Call */}
          <TabsContent value="inbound" className="h-[400px] relative">
            <div ref={inboundChartRef} className="h-full">
              <h3 className="font-bold text-xl mb-4 text-center">Call-In vs Missed Call Distribution</h3>
              <ChartScreenshot targetRef={inboundChartRef} filename="inbound-missed-calls" />
              {filteredData.length > 0 ? (
                <ResponsivePie
                  data={calculateCallSourceData()}
                  margin={{ top: 40, right: 80, bottom: 80, left: 80 }}
                  innerRadius={0.5}
                  padAngle={0.7}
                  cornerRadius={3}
                  colors={{ scheme: 'category10' }}
                  borderWidth={1}
                  borderColor={{ from: 'color', modifiers: [['darker', 0.2]] }}
                  arcLabelsTextColor="#333333"
                  arcLabelsSkipAngle={10}
                  arcLinkLabelsOffset={0}
                  arcLinkLabelsSkipAngle={10}
                  arcLinkLabelsTextOffset={6}
                  arcLinkLabelsTextColor="#333333"
                  arcLinkLabelsThickness={2}
                  arcLinkLabelsColor={{ from: 'color' }}
                  arcLabelsRadiusOffset={0.6}
                  enableArcLinkLabels={true}
                  arcLinkLabel={d => `${d.id}: ${d.value}`}
                  theme={{
                    labels: {
                      text: {
                        fontSize: '14px',
                        fontWeight: 'bold',
                      }
                    },
                    legends: {
                      text: {
                        fontSize: '14px',
                        fontWeight: 'bold',
                      }
                    }
                  }}
                  legends={[
                    {
                      anchor: 'bottom',
                      direction: 'row',
                      translateY: 56,
                      itemWidth: 100,
                      itemHeight: 18,
                      itemTextColor: '#333',
                      symbolSize: 18,
                      symbolShape: 'circle',
                      effects: [{ on: 'hover', style: { itemTextColor: '#000' } }]
                    }
                  ]}
                />
              ) : (
                <div className="flex items-center justify-center h-full text-gray-400">
                  No data available
                </div>
              )}
            </div>
          </TabsContent>
          
          {/* Service Operation Type */}
          <TabsContent value="servicetype" className="h-[500px] relative">
            <div className="mb-4 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Service Operation Type</label>
                <Select value={serviceType} onValueChange={setServiceType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select Service Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    {getUniqueValues("Service Operation Type").map(type => (
                      <SelectItem key={type} value={type}>{type}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Symptom</label>
                <Select value={symptom} onValueChange={setSymptom}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select Symptom" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Symptoms</SelectItem>
                    {getUniqueValues("Symptom").map(symp => (
                      <SelectItem key={symp} value={symp}>{symp}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Solution</label>
                <Select value={solution} onValueChange={setSolution}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select Solution" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Solutions</SelectItem>
                    {getUniqueValues("Solution").map(sol => (
                      <SelectItem key={sol} value={sol}>{sol}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div ref={serviceOpChartRef} className="h-[400px]">
              <h3 className="font-bold text-xl mb-4 text-center">Daily Service Operations</h3>
              <ChartScreenshot targetRef={serviceOpChartRef} filename="service-operations" />
              {filteredData.length > 0 ? (
                <ResponsiveBar
                  data={calculateDailyServiceData()}
                  keys={['count']}
                  indexBy="day"
                  margin={{ top: 50, right: 50, bottom: 70, left: 60 }}
                  padding={0.3}
                  colors={{ scheme: 'nivo' }}
                  borderColor={{ from: 'color', modifiers: [['darker', 1.6]] }}
                  axisTop={null}
                  axisRight={null}
                  axisBottom={{
                    tickSize: 5,
                    tickPadding: 5,
                    tickRotation: 0,
                    legend: 'Day of Month',
                    legendPosition: 'middle',
                    legendOffset: 40,
                    format: (v) => `${v}`
                  }}
                  axisLeft={{
                    tickSize: 5,
                    tickPadding: 5,
                    tickRotation: 0,
                    legend: 'Count',
                    legendPosition: 'middle',
                    legendOffset: -40
                  }}
                  labelSkipWidth={12}
                  labelSkipHeight={12}
                  labelTextColor={{ from: 'color', modifiers: [['darker', 1.6]] }}
                  animate={true}
                  theme={{
                    axis: {
                      ticks: {
                        text: {
                          fontSize: 12,
                          fontWeight: 'bold'
                        }
                      },
                      legend: {
                        text: {
                          fontSize: 14,
                          fontWeight: 'bold'
                        }
                      }
                    },
                    labels: {
                      text: {
                        fontSize: 14,
                        fontWeight: 'bold'
                      }
                    }
                  }}
                />
              ) : (
                <div className="flex items-center justify-center h-full text-gray-400">
                  No data available
                </div>
              )}
            </div>
          </TabsContent>
          
          {/* Working Shift */}
          <TabsContent value="workingshift" className="h-[400px] relative">
            <div ref={workingShiftChartRef} className="h-full">
              <h3 className="font-bold text-xl mb-4 text-center">Working Hours vs Non-Working Hours</h3>
              <ChartScreenshot targetRef={workingShiftChartRef} filename="working-shift" />
              {filteredData.length > 0 ? (
                <ResponsivePie
                  data={calculateWorkingHoursData()}
                  margin={{ top: 40, right: 80, bottom: 80, left: 80 }}
                  innerRadius={0.5}
                  padAngle={0.7}
                  cornerRadius={3}
                  colors={{ scheme: 'paired' }}
                  borderWidth={1}
                  borderColor={{ from: 'color', modifiers: [['darker', 0.2]] }}
                  arcLabelsTextColor="#333333"
                  arcLabelsSkipAngle={10}
                  arcLinkLabelsOffset={0}
                  arcLinkLabelsSkipAngle={10}
                  arcLinkLabelsTextOffset={6}
                  arcLinkLabelsTextColor="#333333"
                  arcLinkLabelsThickness={2}
                  arcLinkLabelsColor={{ from: 'color' }}
                  arcLabelsRadiusOffset={0.6}
                  enableArcLinkLabels={true}
                  arcLinkLabel={d => `${d.id}: ${d.value}`}
                  theme={{
                    labels: {
                      text: {
                        fontSize: '14px',
                        fontWeight: 'bold',
                      }
                    },
                    legends: {
                      text: {
                        fontSize: '14px',
                        fontWeight: 'bold',
                      }
                    }
                  }}
                  legends={[
                    {
                      anchor: 'bottom',
                      direction: 'row',
                      translateY: 56,
                      itemWidth: 180,
                      itemHeight: 18,
                      itemTextColor: '#333',
                      symbolSize: 18,
                      symbolShape: 'circle',
                      effects: [{ on: 'hover', style: { itemTextColor: '#000' } }]
                    }
                  ]}
                />
              ) : (
                <div className="flex items-center justify-center h-full text-gray-400">
                  No data available
                </div>
              )}
            </div>
          </TabsContent>
          
          {/* Suggestion / Top 5 Symptoms */}
          <TabsContent value="suggestion" className="h-[400px] relative">
            <div ref={topSymptomsChartRef} className="h-full">
              <h3 className="font-bold text-xl mb-4 text-center">Top 5 Symptoms</h3>
              <ChartScreenshot targetRef={topSymptomsChartRef} filename="top-symptoms" />
              {filteredData.length > 0 ? (
                <ResponsiveBar
                  data={calculateTopSymptoms()}
                  keys={['value']}
                  indexBy="id"
                  margin={{ top: 50, right: 50, bottom: 130, left: 60 }}
                  padding={0.3}
                  colors={{ scheme: 'red_yellow_blue' }}
                  colorBy="indexValue"
                  borderColor={{ from: 'color', modifiers: [['darker', 1.6]] }}
                  axisTop={null}
                  axisRight={null}
                  axisBottom={{
                    tickSize: 5,
                    tickPadding: 5,
                    tickRotation: 45,
                    legend: 'Symptom',
                    legendPosition: 'middle',
                    legendOffset: 80
                  }}
                  axisLeft={{
                    tickSize: 5,
                    tickPadding: 5,
                    tickRotation: 0,
                    legend: 'Count',
                    legendPosition: 'middle',
                    legendOffset: -40
                  }}
                  labelSkipWidth={12}
                  labelSkipHeight={12}
                  labelTextColor={{ from: 'color', modifiers: [['darker', 1.6]] }}
                  animate={true}
                  theme={{
                    axis: {
                      ticks: {
                        text: {
                          fontSize: 12,
                          fontWeight: 'bold'
                        }
                      },
                      legend: {
                        text: {
                          fontSize: 14,
                          fontWeight: 'bold'
                        }
                      }
                    },
                    labels: {
                      text: {
                        fontSize: 12,
                        fontWeight: 'bold'
                      }
                    }
                  }}
                />
              ) : (
                <div className="flex items-center justify-center h-full text-gray-400">
                  No data available
                </div>
              )}
            </div>
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
