
import { ResponsivePie } from "@nivo/pie";

interface SymptomChartProps {
  data: any[];
}

const SymptomChart = ({ data }: SymptomChartProps) => {
  // Process data for the chart
  const processedData = processSymptomData(data);

  // Custom color theme
  const colorTheme = [
    '#8B5CF6', '#A78BFA', '#C4B5FD', '#DDD6FE', '#EDE9FE', // purples
    '#6366F1', '#818CF8', '#A5B4FC', '#C7D2FE', '#E0E7FF'  // indigos
  ];

  return (
    <div className="h-full">
      <h3 className="text-md font-medium mb-4">Distribution by Symptom</h3>
      <div className="h-[300px]">
        {processedData.length > 0 ? (
          <ResponsivePie
            data={processedData}
            margin={{ top: 20, right: 20, bottom: 50, left: 20 }}
            innerRadius={0.5}
            padAngle={0.7}
            cornerRadius={3}
            colors={colorTheme}
            borderWidth={1}
            borderColor={{ from: "color", modifiers: [["darker", 0.2]] }}
            radialLabelsSkipAngle={10}
            radialLabelsTextColor="#333333"
            radialLabelsLinkColor={{ from: "color" }}
            arcLabelsSkipAngle={10}
            arcLabelsTextColor="#ffffff"
            arcLabelsRadiusOffset={0.4}
            legends={[
              {
                anchor: "bottom",
                direction: "row",
                justify: false,
                translateY: 30,
                itemWidth: 100,
                itemHeight: 18,
                itemTextColor: "#333",
                itemDirection: "left-to-right",
                itemOpacity: 1,
                symbolSize: 12,
                symbolShape: "circle",
              },
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

// Helper function to process symptom data
const processSymptomData = (data) => {
  if (!data || data.length === 0) return [];

  // Count occurrences of each symptom
  const symptomCounts = {};
  
  data.forEach(log => {
    if (!log.Symptom) return;
    
    const symptom = log.Symptom;
    symptomCounts[symptom] = (symptomCounts[symptom] || 0) + 1;
  });
  
  // Convert to chart format
  return Object.entries(symptomCounts)
    .map(([id, value]) => ({ id, label: id, value: Number(value) }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 8); // Limit to top 8 for better visualization
};

export default SymptomChart;
