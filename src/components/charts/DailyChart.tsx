
import { ResponsiveLine } from "@nivo/line";
import { useRef } from "react";
import { ChartScreenshot } from "@/components/ui/chart-screenshot";

interface DailyChartProps {
  data: any[];
}

const DailyChart = ({ data }: DailyChartProps) => {
  // Reference for screenshot functionality
  const chartRef = useRef<HTMLDivElement>(null);
  
  // Process data for the chart
  const processedData = processDailyData(data);

  return (
    <div className="h-full" ref={chartRef}>
      <h3 className="text-2xl font-bold mb-6 text-center">Calls by Day of Week</h3>
      <ChartScreenshot targetRef={chartRef} filename="daily-trend" />
      <div className="h-[350px]">
        {processedData.length > 0 ? (
          <ResponsiveLine
            data={processedData}
            margin={{ top: 40, right: 80, bottom: 80, left: 60 }}
            xScale={{ type: 'point' }}
            yScale={{ 
              type: 'linear', 
              min: 'auto',
              max: 'auto',
              stacked: false,
              reverse: false
            }}
            yFormat=" >-.0f"
            curve="cardinal"
            axisTop={null}
            axisRight={null}
            axisBottom={{
              tickSize: 5,
              tickPadding: 5,
              tickRotation: 0,
              legend: 'Day of Week',
              legendOffset: 45,
              legendPosition: 'middle'
            }}
            axisLeft={{
              tickSize: 5,
              tickPadding: 5,
              tickRotation: 0,
              legend: 'Count',
              legendOffset: -45,
              legendPosition: 'middle'
            }}
            enableGridX={false}
            colors={['#6366F1']}
            lineWidth={4}
            pointSize={10}
            pointColor={{ theme: 'background' }}
            pointBorderWidth={3}
            pointBorderColor={{ from: 'serieColor' }}
            pointLabelYOffset={-12}
            useMesh={true}
            legends={[
              {
                anchor: 'top-right',
                direction: 'column',
                justify: false,
                translateX: 0,
                translateY: 0,
                itemsSpacing: 0,
                itemDirection: 'left-to-right',
                itemWidth: 80,
                itemHeight: 20,
                itemOpacity: 0.75,
                symbolSize: 16,
                symbolShape: 'circle',
                symbolBorderColor: 'rgba(0, 0, 0, .5)',
                effects: [
                  {
                    on: 'hover',
                    style: {
                      itemBackground: 'rgba(0, 0, 0, .03)',
                      itemOpacity: 1
                    }
                  }
                ]
              }
            ]}
            theme={{
              axis: {
                domain: {
                  line: {
                    strokeWidth: 2,
                    stroke: '#777777'
                  }
                },
                legend: {
                  text: {
                    fontSize: 16,
                    fontWeight: 700,
                    fill: '#333',
                  },
                },
                ticks: {
                  line: {
                    strokeWidth: 1,
                    stroke: '#777777'
                  },
                  text: {
                    fontSize: 12,
                    fontWeight: 600,
                    fill: '#333',
                  },
                },
              },
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

// Helper function to process daily data
const processDailyData = (data) => {
  if (!data || data.length === 0) return [];

  // Days of the week
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  
  // Initialize counts for each day
  const dayCounts = days.map(day => ({ x: day, y: 0 }));
  
  // Count calls by day of week
  data.forEach(log => {
    if (!log["Start Support"]) return;
    
    try {
      const startTime = new Date(log["Start Support"]);
      if (isNaN(startTime.getTime())) return; // Skip invalid dates
      
      const dayOfWeek = startTime.getDay(); // 0 = Sunday, 6 = Saturday
      dayCounts[dayOfWeek].y += 1;
    } catch (err) {
      // Skip entries with invalid dates
    }
  });
  
  return [{
    id: "calls",
    color: "#6366F1",
    data: dayCounts
  }];
};

export default DailyChart;
