
import { ResponsiveBar } from "@nivo/bar";

interface LocationChartProps {
  data: any[];
}

const LocationChart = ({ data }: LocationChartProps) => {
  // Process data for the chart
  const processedData = processLocationData(data);

  return (
    <div className="h-full">
      <h3 className="text-md font-medium mb-4">Average Support Duration by Location</h3>
      <div className="h-[300px]">
        {processedData.length > 0 ? (
          <ResponsiveBar
            data={processedData}
            keys={["duration"]}
            indexBy="location"
            margin={{ top: 10, right: 10, bottom: 50, left: 50 }}
            padding={0.3}
            valueScale={{ type: "linear" }}
            colors={{ scheme: "blues" }}
            axisBottom={{
              tickSize: 5,
              tickPadding: 5,
              tickRotation: 45,
              legend: "Location",
              legendPosition: "middle",
              legendOffset: 40,
            }}
            axisLeft={{
              tickSize: 5,
              tickPadding: 5,
              tickRotation: 0,
              legend: "Avg. Duration (min)",
              legendPosition: "middle",
              legendOffset: -40,
            }}
            labelSkipWidth={12}
            labelSkipHeight={12}
            labelTextColor={{ from: "color", modifiers: [["darker", 1.6]] }}
            animate={true}
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

  // Group by location and calculate average duration
  const locationDurations = {};
  const locationCounts = {};
  
  data.forEach(log => {
    if (!log.Location || !log["Support Duration (mn:ss)"]) return;
    
    const location = log.Location;
    const durationMatch = log["Support Duration (mn:ss)"].match(/(\d+):(\d+)/);
    
    if (durationMatch) {
      const minutes = parseInt(durationMatch[1], 10);
      const seconds = parseInt(durationMatch[2], 10);
      const totalMinutes = minutes + seconds / 60;
      
      if (!locationDurations[location]) {
        locationDurations[location] = 0;
        locationCounts[location] = 0;
      }
      
      locationDurations[location] += totalMinutes;
      locationCounts[location]++;
    }
  });
  
  // Calculate averages
  return Object.keys(locationDurations).map(location => ({
    location,
    duration: Number((locationDurations[location] / locationCounts[location]).toFixed(2))
  }));
};

export default LocationChart;
