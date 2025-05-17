
import { useState, useEffect, useRef } from "react";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { serviceTypeCategories } from "@/data/serviceTypeCategories";

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
  const [availableSymptoms, setAvailableSymptoms] = useState<string[]>([]);
  
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

  // Handle service type change
  const handleServiceTypeChange = (value: string) => {
    setServiceType(value);
    setSymptom("all"); // Reset symptom when changing service type
    
    // Update available symptoms based on service type
    if (value === "all") {
      setAvailableSymptoms(getUniqueValues("Symptom"));
    } else {
      const category = serviceTypeCategories.find(cat => cat.name === value);
      setAvailableSymptoms(category?.symptoms || []);
    }
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

  // Calculate inbound vs missed calls data - Fixed to properly filter by Source
  const calculateCallSourceData = () => {
    const counts = {
      "Call-In": 0,
      "Missed Call": 0
    };
    
    filteredData.forEach(item => {
      const source = item["Source"];
      if (source === "Call-In") {
        counts["Call-In"]++;
      } else if (source === "Missed Call") {
        counts["Missed Call"]++;
      }
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
    
    // Convert to array and ensure it's ordered by day number
    return Object.entries(serviceData)
      .map(([day, count]) => ({ 
        day, 
        count,
        id: day
      }))
      .sort((a, b) => parseInt(a.day) - parseInt(b.day));
  };

  // Update filtered data when main data changes
  useEffect(() => {
    setFilteredData(data);
    
    // Initialize available symptoms
    setAvailableSymptoms(getUniqueValues("Symptom"));
  }, [data]);

  return (
    <div className="space-y-6">
      <Card className="p-6 shadow-lg border-2 border-gray-200">
        <h2 className="text-2xl font-bold mb-6 text-primary">Dashboard Analytics</h2>
        
        {/* Date filter section */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8 bg-gray-50 p-4 rounded-lg">
          <div className="flex-1">
            <Label className="text-sm font-medium text-gray-700 mb-1 block">Start Date</Label>
            <Input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="border-2 focus:ring-2 focus:ring-primary/20"
            />
          </div>
          <div className="flex-1">
            <Label className="text-sm font-medium text-gray-700 mb-1 block">End Date</Label>
            <Input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="border-2 focus:ring-2 focus:ring-primary/20"
            />
          </div>
          <div className="flex items-end">
            <button 
              className="px-6 py-2.5 bg-primary hover:bg-primary/90 text-white rounded-md text-sm font-medium transition-colors"
              onClick={handleDateFilter}
            >
              Apply
            </button>
          </div>
        </div>
        
        {/* Chart tabs */}
        <Tabs defaultValue="location" className="w-full">
          <TabsList className="w-full grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 mb-8 bg-gray-100 p-1 rounded-lg">
            <TabsTrigger value="location" className="font-semibold py-2.5">Location</TabsTrigger>
            <TabsTrigger value="symptom" className="font-semibold py-2.5">Symptom</TabsTrigger>
            <TabsTrigger value="solution" className="font-semibold py-2.5">Solution</TabsTrigger>
            <TabsTrigger value="source" className="font-semibold py-2.5">Source</TabsTrigger>
            <TabsTrigger value="hourly" className="font-semibold py-2.5">By Hour</TabsTrigger>
            <TabsTrigger value="daily" className="font-semibold py-2.5">By Day</TabsTrigger>
            <TabsTrigger value="inbound" className="font-semibold py-2.5">Inbound & Missed</TabsTrigger>
            <TabsTrigger value="servicetype" className="font-semibold py-2.5">Service Type</TabsTrigger>
            <TabsTrigger value="workingshift" className="font-semibold py-2.5">Working Shift</TabsTrigger>
            <TabsTrigger value="suggestion" className="font-semibold py-2.5">Suggestion</TabsTrigger>
          </TabsList>
          
          <div className="border border-gray-200 rounded-lg p-6 bg-white">
            <TabsContent value="location" className="h-[500px]">
              <LocationChart data={filteredData} />
            </TabsContent>
            
            <TabsContent value="symptom" className="h-[500px]">
              <SymptomChart data={filteredData} />
            </TabsContent>
            
            <TabsContent value="solution" className="h-[500px]">
              <SolutionChart data={filteredData} />
            </TabsContent>
            
            <TabsContent value="source" className="h-[500px]">
              <SourceChart data={filteredData} />
            </TabsContent>
            
            <TabsContent value="hourly" className="h-[500px]">
              <HourlyChart data={filteredData} />
            </TabsContent>
            
            <TabsContent value="daily" className="h-[500px]">
              <DailyChart data={filteredData} />
            </TabsContent>
            
            {/* Inbound & Missed Call - Fixed to correctly filter data by Source */}
            <TabsContent value="inbound" className="h-[500px] relative">
              <div ref={inboundChartRef} className="h-full">
                <h3 className="font-bold text-3xl mb-8 text-center">Call-In vs Missed Call Distribution</h3>
                <ChartScreenshot targetRef={inboundChartRef} filename="inbound-missed-calls" />
                {filteredData.length > 0 ? (
                  <ResponsivePie
                    data={calculateCallSourceData()}
                    margin={{ top: 40, right: 100, bottom: 80, left: 100 }}
                    innerRadius={0.5}
                    padAngle={0.7}
                    cornerRadius={3}
                    colors={['#6366f1', '#f97316']} // Custom colors for better visibility
                    borderWidth={1}
                    borderColor={{ from: 'color', modifiers: [['darker', 0.2]] }}
                    arcLabelsTextColor="#ffffff"
                    arcLabelsSkipAngle={10}
                    arcLinkLabelsOffset={3}
                    arcLinkLabelsSkipAngle={10}
                    arcLinkLabelsTextOffset={8}
                    arcLinkLabelsTextColor="#333333"
                    arcLinkLabelsThickness={2}
                    arcLinkLabelsColor={{ from: 'color' }}
                    arcLabelsRadiusOffset={0.6}
                    enableArcLinkLabels={true}
                    arcLinkLabel={d => `${d.id}: ${d.value}`}
                    theme={{
                      labels: {
                        text: {
                          fontSize: 16,
                          fontWeight: 700,
                        }
                      },
                      legends: {
                        text: {
                          fontSize: 16,
                          fontWeight: 700,
                        }
                      },
                      tooltip: {
                        container: {
                          fontSize: 14,
                          fontWeight: 500,
                          padding: 12,
                          borderRadius: 6
                        }
                      }
                    }}
                    legends={[
                      {
                        anchor: 'bottom',
                        direction: 'row',
                        translateY: 56,
                        itemWidth: 120,
                        itemHeight: 20,
                        itemTextColor: '#333',
                        symbolSize: 20,
                        symbolShape: 'circle',
                        effects: [{ on: 'hover', style: { itemTextColor: '#000' } }]
                      }
                    ]}
                  />
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-400 text-xl">
                    No data available
                  </div>
                )}
              </div>
            </TabsContent>
            
            {/* Service Operation Type - Enhanced with dynamic symptom filtering */}
            <TabsContent value="servicetype" className="h-[600px] relative">
              <div className="mb-8 grid grid-cols-1 md:grid-cols-3 gap-6 bg-gray-50 p-6 rounded-lg">
                <div>
                  <Label className="block text-base font-semibold text-gray-700 mb-2">Service Operation Type</Label>
                  <Select value={serviceType} onValueChange={handleServiceTypeChange}>
                    <SelectTrigger className="border-2 focus:ring-2 focus:ring-primary/20 h-12">
                      <SelectValue placeholder="Select Service Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      {serviceTypeCategories.map(category => (
                        <SelectItem key={category.name} value={category.name}>{category.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="block text-base font-semibold text-gray-700 mb-2">Symptom</Label>
                  <Select value={symptom} onValueChange={setSymptom}>
                    <SelectTrigger className="border-2 focus:ring-2 focus:ring-primary/20 h-12">
                      <SelectValue placeholder="Select Symptom" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Symptoms</SelectItem>
                      {availableSymptoms.map(symp => (
                        <SelectItem key={symp} value={symp}>{symp}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="block text-base font-semibold text-gray-700 mb-2">Solution</Label>
                  <Select value={solution} onValueChange={setSolution}>
                    <SelectTrigger className="border-2 focus:ring-2 focus:ring-primary/20 h-12">
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
              
              <div ref={serviceOpChartRef} className="h-[500px]">
                <h3 className="font-bold text-3xl mb-8 text-center">Daily Service Operations</h3>
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
                      legendOffset: 45,
                      format: (v) => `${v}`
                    }}
                    axisLeft={{
                      tickSize: 5,
                      tickPadding: 5,
                      tickRotation: 0,
                      legend: 'Count',
                      legendPosition: 'middle',
                      legendOffset: -45
                    }}
                    labelSkipWidth={12}
                    labelSkipHeight={12}
                    labelTextColor={{ from: 'color', modifiers: [['darker', 1.6]] }}
                    animate={true}
                    theme={{
                      axis: {
                        domain: {
                          line: {
                            strokeWidth: 2,
                            stroke: '#777777'
                          }
                        },
                        ticks: {
                          line: {
                            strokeWidth: 1,
                            stroke: '#777777'
                          },
                          text: {
                            fontSize: 14,
                            fontWeight: 700,
                            fill: '#333333'
                          }
                        },
                        legend: {
                          text: {
                            fontSize: 16,
                            fontWeight: 700,
                            fill: '#333333'
                          }
                        }
                      },
                      labels: {
                        text: {
                          fontSize: 14,
                          fontWeight: 700,
                          fill: '#ffffff'
                        }
                      },
                      tooltip: {
                        container: {
                          fontSize: 14,
                          fontWeight: 500,
                          padding: 12,
                          borderRadius: 6
                        }
                      }
                    }}
                  />
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-400 text-xl">
                    No data available
                  </div>
                )}
              </div>
            </TabsContent>
            
            {/* Working Shift - Improved styling */}
            <TabsContent value="workingshift" className="h-[500px] relative">
              <div ref={workingShiftChartRef} className="h-full">
                <h3 className="font-bold text-3xl mb-8 text-center">Working Hours vs Non-Working Hours</h3>
                <ChartScreenshot targetRef={workingShiftChartRef} filename="working-shift" />
                {filteredData.length > 0 ? (
                  <ResponsivePie
                    data={calculateWorkingHoursData()}
                    margin={{ top: 40, right: 100, bottom: 80, left: 100 }}
                    innerRadius={0.5}
                    padAngle={0.7}
                    cornerRadius={3}
                    colors={['#10b981', '#6366f1']} // Custom colors for better contrast
                    borderWidth={1}
                    borderColor={{ from: 'color', modifiers: [['darker', 0.2]] }}
                    arcLabelsTextColor="#ffffff"
                    arcLabelsSkipAngle={10}
                    arcLinkLabelsOffset={3}
                    arcLinkLabelsSkipAngle={10}
                    arcLinkLabelsTextOffset={8}
                    arcLinkLabelsTextColor="#333333"
                    arcLinkLabelsThickness={2}
                    arcLinkLabelsColor={{ from: 'color' }}
                    arcLabelsRadiusOffset={0.6}
                    enableArcLinkLabels={true}
                    arcLinkLabel={d => `${d.id}: ${d.value}`}
                    theme={{
                      labels: {
                        text: {
                          fontSize: 16,
                          fontWeight: 700,
                        }
                      },
                      legends: {
                        text: {
                          fontSize: 16,
                          fontWeight: 700,
                        }
                      },
                      tooltip: {
                        container: {
                          fontSize: 14,
                          fontWeight: 500,
                          padding: 12,
                          borderRadius: 6
                        }
                      }
                    }}
                    legends={[
                      {
                        anchor: 'bottom',
                        direction: 'row',
                        translateY: 56,
                        itemWidth: 200,
                        itemHeight: 20,
                        itemTextColor: '#333',
                        symbolSize: 20,
                        symbolShape: 'circle',
                        effects: [{ on: 'hover', style: { itemTextColor: '#000' } }]
                      }
                    ]}
                  />
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-400 text-xl">
                    No data available
                  </div>
                )}
              </div>
            </TabsContent>
            
            {/* Suggestion / Top 5 Symptoms - Enhanced styling with alert colors */}
            <TabsContent value="suggestion" className="h-[500px] relative">
              <div ref={topSymptomsChartRef} className="h-full">
                <h3 className="font-bold text-3xl mb-8 text-center">Top 5 Symptoms</h3>
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
                      legendOffset: 90
                    }}
                    axisLeft={{
                      tickSize: 5,
                      tickPadding: 5,
                      tickRotation: 0,
                      legend: 'Count',
                      legendPosition: 'middle',
                      legendOffset: -45
                    }}
                    labelSkipWidth={12}
                    labelSkipHeight={12}
                    labelTextColor={{ from: 'color', modifiers: [['darker', 1.6]] }}
                    animate={true}
                    theme={{
                      axis: {
                        domain: {
                          line: {
                            strokeWidth: 2,
                            stroke: '#777777'
                          }
                        },
                        ticks: {
                          line: {
                            strokeWidth: 1,
                            stroke: '#777777'
                          },
                          text: {
                            fontSize: 14,
                            fontWeight: 700,
                            fill: '#333333'
                          }
                        },
                        legend: {
                          text: {
                            fontSize: 16,
                            fontWeight: 700,
                            fill: '#333333'
                          }
                        }
                      },
                      labels: {
                        text: {
                          fontSize: 14,
                          fontWeight: 700,
                          fill: '#ffffff'
                        }
                      },
                      tooltip: {
                        container: {
                          fontSize: 14,
                          fontWeight: 500,
                          padding: 12,
                          borderRadius: 6
                        }
                      }
                    }}
                  />
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-400 text-xl">
                    No data available
                  </div>
                )}
              </div>
            </TabsContent>
          </div>
        </Tabs>
      </Card>
      
      <Card className="p-6 shadow-lg border-2 border-gray-200">
        <h2 className="text-2xl font-bold mb-6 text-primary">Dashboard Summary</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-blue-100 p-6 rounded-lg text-center shadow-md border border-blue-200">
            <p className="text-sm font-medium text-blue-800 mb-1">Total Calls</p>
            <p className="text-3xl font-bold text-blue-900">{filteredData.length}</p>
          </div>
          <div className="bg-green-100 p-6 rounded-lg text-center shadow-md border border-green-200">
            <p className="text-sm font-medium text-green-800 mb-1">Locations</p>
            <p className="text-3xl font-bold text-green-900">
              {new Set(filteredData.map(item => item.Location)).size}
            </p>
          </div>
          <div className="bg-yellow-100 p-6 rounded-lg text-center shadow-md border border-yellow-200">
            <p className="text-sm font-medium text-yellow-800 mb-1">Avg Duration</p>
            <p className="text-3xl font-bold text-yellow-900">
              {filteredData.length ? 
                calculateAvgDuration(filteredData) : "00:00"}
            </p>
          </div>
          <div className="bg-purple-100 p-6 rounded-lg text-center shadow-md border border-purple-200">
            <p className="text-sm font-medium text-purple-800 mb-1">Service Types</p>
            <p className="text-3xl font-bold text-purple-900">
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
