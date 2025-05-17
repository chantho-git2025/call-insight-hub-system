
import { ResponsivePie } from "@nivo/pie";
import { useRef } from "react";
import { ChartScreenshot } from "@/components/ui/chart-screenshot";

interface SourceChartProps {
  data: any[];
}

const SourceChart = ({ data }: SourceChartProps) => {
  // Reference for screenshot functionality
  const chartRef = useRef<HTMLDivElement>(null);
  
  // Process data for the chart
  const processedData = processSourceData(data);
  
  // Custom color theme
  const colorTheme = [
    '#F97316', '#FB923C', '#FDBA74', '#FED7AA', '#FFEDD5', // oranges
    '#F59E0B', '#FBBF24', '#FCD34D', '#FDE68A', '#FEF3C7'  // ambers
  ];

  return (
    <div className="h-full" ref={chartRef}>
      <h3 className="text-2xl font-bold mb-6 text-center">Call Sources Distribution</h3>
      <ChartScreenshot targetRef={chartRef} filename="source-distribution" />
      <div className="h-[350px]">
        {processedData.length > 0 ? (
          <ResponsivePie
            data={processedData}
            margin={{ top: 40, right: 80, bottom: 80, left: 80 }}
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
            arcLabelsRadiusOffset={0.6}
            enableArcLinkLabels={true}
            arcLinkLabel={d => `${d.id}: ${d.value}`}
            legends={[
              {
                anchor: "bottom",
                direction: "row",
                justify: false,
                translateX: 0,
                translateY: 56,
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
              labels: {
                text: {
                  fontSize: 16,
                  fontWeight: 700,
                }
              },
              legends: {
                text: {
                  fontSize: 14,
                  fontWeight: 600,
                }
              },
              tooltip: {
                container: {
                  background: 'white',
                  color: '#333',
                  fontSize: '14px',
                  fontWeight: 500,
                  borderRadius: '6px',
                  boxShadow: '0 3px 10px rgba(0, 0, 0, 0.25)',
                  padding: '10px 14px',
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
    if (!log["Source"]) return;
    
    const source = log["Source"];
    sourceCounts[source] = (sourceCounts[source] || 0) + 1;
  });
  
  // Convert to chart format
  return Object.entries(sourceCounts)
    .map(([id, value]) => ({ id, label: id, value }));
};

export default SourceChart;
