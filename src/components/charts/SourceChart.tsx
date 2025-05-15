
import { ResponsivePie } from "@nivo/pie";

interface SourceChartProps {
  data: any[];
}

const SourceChart = ({ data }: SourceChartProps) => {
  // Process data for the chart
  const processedData = processSourceData(data);
  
  // Custom color theme
  const colorTheme = [
    '#F97316', '#FB923C', '#FDBA74', '#FED7AA', '#FFEDD5', // oranges
    '#F59E0B', '#FBBF24', '#FCD34D', '#FDE68A', '#FEF3C7'  // ambers
  ];

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
            colors={colorTheme}
            borderWidth={1}
            borderColor={{ from: "color", modifiers: [["darker", 0.2]] }}
            arcLinkLabelsSkipAngle={10}
            arcLinkLabelsTextColor="#333333"
            arcLinkLabelsThickness={2}
            arcLinkLabelsColor={{ from: "color" }}
            arcLabelsSkipAngle={10}
            arcLabelsTextColor="#ffffff"
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
                itemTextColor: "#333",
                itemDirection: "left-to-right",
                itemOpacity: 1,
                symbolSize: 18,
                symbolShape: "circle",
              }
            ]}
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
