
import { ResponsiveBar } from "@nivo/bar";
import { Card } from "@/components/ui/card";

interface LocationChartProps {
  data: any[];
}

const LocationChart = ({ data }: LocationChartProps) => {
  // Process data for the chart
  const processedData = processLocationData(data);

  return (
    <div className="h-full">
      <h3 className="text-md font-medium mb-4">Support Duration by Location</h3>
      <div className="h-[300px]">
        {processedData.length > 0 ? (
          <ResponsiveBar
            data={processedData}
            keys={["duration"]}
            indexBy="location"
            margin={{ top: 10, right: 10, bottom: 50, left: 60 }}
            padding={0.3}
            valueScale={{ type: "linear" }}
            colors={{ scheme: "nivo" }}
            axisBottom={{
              tickSize: 5,
              tickPadding: 5,
              tickRotation: -45,
              legend: "Location",
              legendPosition: "middle",
              legendOffset: 40,
            }}
            axisLeft={{
              tickSize: 5,
              tickPadding: 5,
              tickRotation: 0,
              legend: "Duration (minutes)",
              legendPosition: "middle",
              legendOffset: -50,
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

// Helper function to process location data
const processLocationData = (data) => {
  if (!data || data.length === 0) return [];

  // Group by location and sum duration
  const locationMap = new Map();
  
  data.forEach(log => {
    if (!log.Location) return;
    
    const location = log.Location;
    const duration = parseDuration(log["Support Duration (mn:ss)"]);
    
    if (locationMap.has(location)) {
      locationMap.set(location, locationMap.get(location) + duration);
    } else {
      locationMap.set(location, duration);
    }
  });
  
  // Convert to chart format
  return Array.from(locationMap.entries())
    .map(([location, duration]) => ({
      location,
      duration: Number((duration / 60).toFixed(2))
    }))
    .sort((a, b) => b.duration - a.duration);
};

// Helper function to parse duration string to seconds
const parseDuration = (durationStr) => {
  if (!durationStr) return 0;
  
  const [minutes, seconds] = durationStr.split(":").map(Number);
  return (minutes * 60) + seconds || 0;
};

export default LocationChart;
