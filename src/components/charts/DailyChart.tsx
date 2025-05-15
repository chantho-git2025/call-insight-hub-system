
import { ResponsiveLine } from "@nivo/line";

interface DailyChartProps {
  data: any[];
}

const DailyChart = ({ data }: DailyChartProps) => {
  // Process data for the chart
  const processedData = processDailyData(data);

  return (
    <div className="h-full">
      <h3 className="text-md font-medium mb-4">Calls by Day of Week</h3>
      <div className="h-[300px]">
        {processedData.length > 0 ? (
          <ResponsiveLine
            data={processedData}
            margin={{ top: 10, right: 50, bottom: 50, left: 50 }}
            xScale={{ type: 'point' }}
            yScale={{ 
              type: 'linear', 
              min: 'auto',
              max: 'auto',
              stacked: false,
              reverse: false
            }}
            yFormat=" >-.2f"
            curve="cardinal"
            axisTop={null}
            axisRight={null}
            axisBottom={{
              tickSize: 5,
              tickPadding: 5,
              tickRotation: 0,
              legend: 'Day of Week',
              legendOffset: 36,
              legendPosition: 'middle'
            }}
            axisLeft={{
              tickSize: 5,
              tickPadding: 5,
              tickRotation: 0,
              legend: 'Count',
              legendOffset: -40,
              legendPosition: 'middle'
            }}
            pointSize={10}
            pointColor={{ theme: 'background' }}
            pointBorderWidth={2}
            pointBorderColor={{ from: 'serieColor' }}
            pointLabelYOffset={-12}
            useMesh={true}
            legends={[
              {
                anchor: 'top-right',
                direction: 'column',
                justify: false,
                translateX: 50,
                translateY: 0,
                itemsSpacing: 0,
                itemDirection: 'left-to-right',
                itemWidth: 80,
                itemHeight: 20,
                itemOpacity: 0.75,
                symbolSize: 12,
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
    color: "hsl(233, 70%, 50%)",
    data: dayCounts
  }];
};

export default DailyChart;
