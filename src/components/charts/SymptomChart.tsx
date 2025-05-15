
import { ResponsivePie } from "@nivo/pie";

interface SymptomChartProps {
  data: any[];
}

const SymptomChart = ({ data }: SymptomChartProps) => {
  // Process data for the chart
  const processedData = processSymptomData(data);

  return (
    <div className="h-full">
      <h3 className="text-md font-medium mb-4">Distribution by Symptom</h3>
      <div className="h-[300px]">
        {processedData.length > 0 ? (
          <ResponsivePie
            data={processedData}
            margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
            innerRadius={0.5}
            padAngle={0.7}
            cornerRadius={3}
            colors={{ scheme: "category10" }}
            borderWidth={1}
            borderColor={{ from: "color", modifiers: [["darker", 0.2]] }}
            radialLabelsSkipAngle={10}
            radialLabelsTextColor="#333333"
            radialLabelsLinkColor={{ from: "color" }}
            sliceLabelsSkipAngle={10}
            sliceLabelsTextColor="#ffffff"
            legends={[
              {
                anchor: "bottom",
                direction: "row",
                translateY: 20,
                itemWidth: 100,
                itemHeight: 18,
                itemTextColor: "#999",
                symbolSize: 18,
                symbolShape: "circle",
              },
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
    .map(([id, value]) => ({ id, label: id, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 8); // Limit to top 8 for better visualization
};

export default SymptomChart;
