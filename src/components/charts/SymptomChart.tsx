
import { ResponsivePie } from "@nivo/pie";
import { useRef } from "react";
import { ChartScreenshot } from "@/components/ui/chart-screenshot";

interface SymptomChartProps {
  data: any[];
}

const SymptomChart = ({ data }: SymptomChartProps) => {
  // Reference for screenshot functionality
  const chartRef = useRef<HTMLDivElement>(null);
  
  // Process data for the chart
  const processedData = processSymptomData(data);

  // Custom color theme
  const colorTheme = [
    '#8B5CF6', '#A78BFA', '#C4B5FD', '#DDD6FE', '#EDE9FE', // purples
    '#6366F1', '#818CF8', '#A5B4FC', '#C7D2FE', '#E0E7FF'  // indigos
  ];

  return (
    <div className="h-full" ref={chartRef}>
      <h3 className="text-2xl font-bold mb-6 text-center">Distribution by Symptom</h3>
      <ChartScreenshot targetRef={chartRef} filename="symptom-distribution" />
      <div className="h-[350px]">
        {processedData.length > 0 ? (
          <ResponsivePie
            data={processedData}
            margin={{ top: 40, right: 80, bottom: 80, left: 80 }}
            innerRadius={0.5}
            padAngle={0.7}
            cornerRadius={3}
            colors={colorTheme}
            borderWidth={1}
            borderColor={{ from: "color", modifiers: [["darker", 0.2]] }}
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
                translateY: 56,
                itemWidth: 100,
                itemHeight: 18,
                itemTextColor: "#333",
                itemDirection: "left-to-right",
                itemOpacity: 1,
                symbolSize: 18,
                symbolShape: "circle",
              },
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
