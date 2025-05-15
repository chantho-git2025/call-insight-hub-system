
import { ResponsivePie } from "@nivo/pie";

interface SourceChartProps {
  data: any[];
}

const SourceChart = ({ data }: SourceChartProps) => {
  // Process data for the chart
  const processedData = processSourceData(data);

  return (
    <div className="h-full">
      <h3 className="text-md font-medium mb-4">Call Sources Distribution</h3>
      <div className="h-[300px]">
        {processedData.length > 0 ? (
          <ResponsivePie
            data={processedData}
            margin={{ top: 20, right: 20, bottom: 60, left: 20 }}
            innerRadius={0.5}
            padAngle={0.7}
            cornerRadius={3}
            activeOuterRadiusOffset={8}
            colors={{ scheme: "set2" }}
            borderWidth={1}
            borderColor={{ from: "color", modifiers: [["darker", 0.2]] }}
            arcLinkLabelsSkipAngle={10}
            arcLinkLabelsTextColor="#333333"
            arcLinkLabelsThickness={2}
            arcLinkLabelsColor={{ from: "color" }}
            arcLabelsSkipAngle={10}
            arcLabelsTextColor={{ from: "color", modifiers: [["darker", 2]] }}
            legends={[
              {
                anchor: "bottom",
                direction: "row",
                justify: false,
                translateX: 0,
                translateY: 50,
                itemsSpacing: 5,
                itemWidth: 100,
                itemHeight: 18,
                itemTextColor: "#999",
                itemDirection: "left-to-right",
                itemOpacity: 1,
                symbolSize: 18,
                symbolShape: "circle",
              }
            ]}
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

// Helper function to process source data
const processSourceData = (data) => {
  if (!data || data.length === 0) return [];

  // Count occurrences of each source
  const sourceCounts = {};
  
  data.forEach(log => {
    if (!log["Source Name"]) return;
    
    const source = log["Source Name"];
    sourceCounts[source] = (sourceCounts[source] || 0) + 1;
  });
  
  // Convert to chart format
  return Object.entries(sourceCounts)
    .map(([id, value]) => ({ id, label: id, value }));
};

export default SourceChart;
