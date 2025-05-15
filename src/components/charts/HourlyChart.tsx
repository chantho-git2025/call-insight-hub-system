
import { useState } from "react";
import { ResponsiveBar } from "@nivo/bar";
import { Button } from "@/components/ui/button";

interface HourlyChartProps {
  data: any[];
}

const HourlyChart = ({ data }: HourlyChartProps) => {
  const [showMinutes, setShowMinutes] = useState(false);
  const [selectedHour, setSelectedHour] = useState<string | null>(null);
  
  // Process data for the chart
  const hourlyData = processHourlyData(data);
  const minuteData = selectedHour ? processMinuteData(data, selectedHour) : [];

  const handleBarClick = (bar) => {
    setSelectedHour(bar.indexValue);
    setShowMinutes(true);
  };
  
  const handleBackToHours = () => {
    setShowMinutes(false);
    setSelectedHour(null);
  };

  // Custom color theme
  const colorTheme = [
    '#8B5CF6', '#6366F1', '#3B82F6', '#0EA5E9', '#06B6D4', 
    '#14B8A6', '#10B981', '#34D399', '#4ADE80'
  ];

  return (
    <div className="h-full">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-md font-medium">
          {showMinutes 
            ? `Calls at ${selectedHour} (By Minute)` 
            : "Calls by Hour of Day"}
        </h3>
        {showMinutes && (
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleBackToHours}
          >
            Back to Hours
          </Button>
        )}
      </div>
      
      <div className="h-[300px]">
        {!showMinutes ? (
          hourlyData.length > 0 ? (
            <ResponsiveBar
              data={hourlyData}
              keys={["count"]}
              indexBy="hour"
              margin={{ top: 10, right: 10, bottom: 50, left: 50 }}
              padding={0.3}
              valueScale={{ type: "linear" }}
              colors={colorTheme}
              borderRadius={4}
              borderColor={{ from: "color", modifiers: [["darker", 1.6]] }}
              axisBottom={{
                tickSize: 5,
                tickPadding: 5,
                tickRotation: 0,
                legend: "Hour of Day",
                legendPosition: "middle",
                legendOffset: 32,
              }}
              axisLeft={{
                tickSize: 5,
                tickPadding: 5,
                tickRotation: 0,
                legend: "Number of Calls",
                legendPosition: "middle",
                legendOffset: -40,
              }}
              labelSkipWidth={12}
              labelSkipHeight={12}
              labelTextColor="#ffffff"
              animate={true}
              onClick={handleBarClick}
              tooltip={({ value, indexValue }) => (
                <div className="bg-white p-2 shadow-md rounded-md border border-gray-200">
                  <strong>{indexValue}</strong>: {value} calls
                </div>
              )}
              theme={{
                tooltip: {
                  container: {
                    background: 'white',
                    color: '#333',
                    fontSize: '12px',
                    borderRadius: '4px',
                    boxShadow: '0 1px 2px rgba(0, 0, 0, 0.25)',
                    padding: '8px 12px',
                  },
                },
                grid: {
                  line: {
                    stroke: '#ddd',
                    strokeWidth: 1,
                  },
                },
                axis: {
                  legend: {
                    text: {
                      fontSize: 12,
                      fontWeight: 'bold',
                      fill: '#333',
                    },
                  },
                  ticks: {
                    text: {
                      fontSize: 11,
                      fill: '#333',
                    },
                  },
                },
              }}
            />
          ) : (
            <div className="h-full flex items-center justify-center text-gray-400">
              No data available
            </div>
          )
        ) : (
          minuteData.length > 0 ? (
            <ResponsiveBar
              data={minuteData}
              keys={["count"]}
              indexBy="minute"
              margin={{ top: 10, right: 10, bottom: 50, left: 50 }}
              padding={0.2}
              valueScale={{ type: "linear" }}
              colors={colorTheme} // Using the same colorTheme array for consistency
              borderRadius={4}
              borderColor={{ from: "color", modifiers: [["darker", 1.6]] }}
              axisBottom={{
                tickSize: 5,
                tickPadding: 5,
                tickRotation: 45,
                legend: "Minute",
                legendPosition: "middle",
                legendOffset: 42,
                format: v => `${v}m`,
              }}
              axisLeft={{
                tickSize: 5,
                tickPadding: 5,
                tickRotation: 0,
                legend: "Number of Calls",
                legendPosition: "middle",
                legendOffset: -40,
              }}
              labelSkipWidth={12}
              labelSkipHeight={12}
              labelTextColor="#ffffff"
              animate={true}
              tooltip={({ value, indexValue }) => (
                <div className="bg-white p-2 shadow-md rounded-md border border-gray-200">
                  <strong>{selectedHour}:{indexValue}</strong>: {value} calls
                </div>
              )}
              theme={{
                tooltip: {
                  container: {
                    background: 'white',
                    color: '#333',
                    fontSize: '12px',
                    borderRadius: '4px',
                    boxShadow: '0 1px 2px rgba(0, 0, 0, 0.25)',
                    padding: '8px 12px',
                  },
                },
              }}
            />
          ) : (
            <div className="h-full flex items-center justify-center text-gray-400">
              No data available for the selected hour
            </div>
          )
        )}
      </div>
    </div>
  );
};

// Helper function to process hourly data
const processHourlyData = (data) => {
  if (!data || data.length === 0) return [];

  // Initialize hours (0-23)
  const hourCounts = Array.from({ length: 24 }, (_, i) => ({
    hour: i.toString().padStart(2, '0') + ':00',
    count: 0
  }));
  
  data.forEach(log => {
    if (!log["Start Support"]) return;
    
    try {
      const startTime = new Date(log["Start Support"]);
      if (isNaN(startTime.getTime())) return; // Skip invalid dates
      
      const hour = startTime.getHours();
      hourCounts[hour].count += 1;
    } catch (err) {
      // Skip entries with invalid dates
    }
  });
  
  return hourCounts;
};

// Helper function to process minute data for a selected hour
const processMinuteData = (data, selectedHour) => {
  if (!data || data.length === 0) return [];
  
  const hourValue = parseInt(selectedHour.split(':')[0], 10);
  
  // Initialize minutes (0-59)
  const minuteCounts = Array.from({ length: 60 }, (_, i) => ({
    minute: i.toString().padStart(2, '0'),
    count: 0
  }));
  
  data.forEach(log => {
    if (!log["Start Support"]) return;
    
    try {
      const startTime = new Date(log["Start Support"]);
      if (isNaN(startTime.getTime())) return; // Skip invalid dates
      
      const hour = startTime.getHours();
      const minute = startTime.getMinutes();
      
      if (hour === hourValue) {
        minuteCounts[minute].count += 1;
      }
    } catch (err) {
      // Skip entries with invalid dates
    }
  });
  
  return minuteCounts;
};

export default HourlyChart;
