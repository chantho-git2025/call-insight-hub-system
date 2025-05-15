
import { ResponsiveBar } from "@nivo/bar";

interface SolutionChartProps {
  data: any[];
}

const SolutionChart = ({ data }: SolutionChartProps) => {
  // Process data for the chart
  const processedData = processSolutionData(data);
  
  // Custom color scheme
  const greenColors = ['#10B981', '#34D399', '#6EE7B7', '#A7F3D0', '#D1FAE5'];

  return (
    <div className="h-full">
      <h3 className="text-md font-medium mb-4">Top Solutions Applied</h3>
      <div className="h-[300px]">
        {processedData.length > 0 ? (
          <ResponsiveBar
            data={processedData}
            keys={["count"]}
            indexBy="solution"
            margin={{ top: 10, right: 10, bottom: 50, left: 40 }}
            padding={0.3}
            layout="horizontal"
            valueScale={{ type: "linear" }}
            colors={greenColors}
            borderRadius={4}
            borderColor={{ from: "color", modifiers: [["darker", 1.6]] }}
            axisBottom={{
              tickSize: 5,
              tickPadding: 5,
              tickRotation: 0,
              legend: "Count",
              legendPosition: "middle",
              legendOffset: 36,
            }}
            axisLeft={{
              tickSize: 5,
              tickPadding: 5,
              tickRotation: 0,
            }}
            labelSkipWidth={12}
            labelSkipHeight={12}
            labelTextColor={{ from: "color", modifiers: [["darker", 1.6]] }}
            animate={true}
            theme={{
              grid: {
                line: {
                  stroke: '#ddd',
                  strokeWidth: 1,
                },
              },
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

// Helper function to process solution data
const processSolutionData = (data) => {
  if (!data || data.length === 0) return [];

  // Count occurrences of each solution
  const solutionCounts = {};
  
  data.forEach(log => {
    if (!log.Solution) return;
    
    const solution = log.Solution;
    solutionCounts[solution] = (solutionCounts[solution] || 0) + 1;
  });
  
  // Convert to chart format
  return Object.entries(solutionCounts)
    .map(([solution, count]) => ({ solution, count: Number(count) }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 7); // Limit to top 7 for better visualization
};

export default SolutionChart;
