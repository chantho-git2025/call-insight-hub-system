
import { ResponsiveBar } from "@nivo/bar";

interface HourlyChartProps {
  data: any[];
}

const HourlyChart = ({ data }: HourlyChartProps) => {
  // Process data for the chart
  const processedData = processHourlyData(data);

  return (
    <div className="h-full">
      <h3 className="text-md font-medium mb-4">Calls by Hour of Day</h3>
      <div className="h-[300px]">
        {processedData.length > 0 ? (
          <ResponsiveBar
            data={processedData}
            keys={["count"]}
            indexBy="hour"
            margin={{ top: 10, right: 10, bottom: 40, left: 50 }}
            padding={0.3}
            valueScale={{ type: "linear" }}
            colors={{ scheme: "purples" }}
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
            labelTextColor={{ from: "color", modifiers: [["darker", 1.6]] }}
            animate={true}
            motionStiffness={90}
            motionDamping={15}
          />
        ) : (
          <div className="h-full flex items-center justify-center text-gray-400">
            No data available
          </div>
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

export default HourlyChart;
