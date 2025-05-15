
import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { ResponsiveBar } from "@nivo/bar";

interface ProductivityProps {
  data: any[];
}

const Productivity = ({ data }: ProductivityProps) => {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [selectedSolution, setSelectedSolution] = useState("all");
  const [filteredData, setFilteredData] = useState(data);
  const [productivityMetrics, setProductivityMetrics] = useState<any[]>([]);

  // Extract unique solutions for the filter dropdown
  const solutions = [...new Set(data.map(item => item.Solution))].filter(Boolean).sort();

  // Extract unique "Created By" values
  const staffMembers = [...new Set(data.map(item => item["Created By"]))].filter(Boolean);

  const applyFilters = () => {
    const filtered = data.filter((log) => {
      // Date filters
      let dateMatches = true;
      if (startDate || endDate) {
        const supportDate = new Date(log["Start Support"]);
        const start = startDate ? new Date(startDate) : new Date(0);
        const end = endDate ? new Date(endDate) : new Date(8640000000000000);
        dateMatches = supportDate >= start && supportDate <= end;
      }

      // Solution filter
      const solutionMatches = selectedSolution === "all" || log.Solution === selectedSolution;

      return dateMatches && solutionMatches;
    });

    setFilteredData(filtered);
  };

  // Calculate productivity metrics when filtered data changes
  useEffect(() => {
    // Group by staff member
    const metrics = staffMembers.map(staff => {
      const staffCalls = filteredData.filter(log => log["Created By"] === staff);
      
      // Calculate total calls
      const totalCalls = staffCalls.length;
      
      // Calculate average resolution time
      let totalDurationMinutes = 0;
      let totalDurationSeconds = 0;
      
      staffCalls.forEach(call => {
        if (call["Support Duration (mn:ss)"]) {
          const [minutes, seconds] = call["Support Duration (mn:ss)"].split(":").map(Number);
          totalDurationMinutes += minutes || 0;
          totalDurationSeconds += seconds || 0;
        }
      });
      
      totalDurationMinutes += Math.floor(totalDurationSeconds / 60);
      totalDurationSeconds = totalDurationSeconds % 60;
      
      const avgDuration = totalCalls > 0 
        ? `${Math.floor(totalDurationMinutes / totalCalls).toString().padStart(2, '0')}:${Math.floor(totalDurationSeconds / totalCalls).toString().padStart(2, '0')}`
        : "00:00";
      
      // Count solutions by type
      const solutionCounts = {};
      solutions.forEach(solution => {
        solutionCounts[solution] = staffCalls.filter(call => call.Solution === solution).length;
      });
      
      // Calculate efficiency score (simple metric: calls per minute of total time spent)
      const totalMinutes = totalDurationMinutes + (totalDurationSeconds / 60);
      const efficiency = totalMinutes > 0 ? (totalCalls / totalMinutes).toFixed(2) : 0;
      
      return {
        staff,
        totalCalls,
        avgDuration,
        solutionCounts,
        efficiency
      };
    })
    .sort((a, b) => b.totalCalls - a.totalCalls); // Sort by most productive
    
    setProductivityMetrics(metrics);
  }, [filteredData, staffMembers, solutions]);

  // Format data for the chart
  const chartData = productivityMetrics.map(metric => {
    const data = {
      staff: metric.staff,
      "Total Calls": metric.totalCalls,
    };
    
    // Add top solutions to the chart
    solutions.slice(0, 3).forEach(solution => {
      data[solution] = metric.solutionCounts[solution] || 0;
    });
    
    return data;
  });

  return (
    <div className="space-y-6">
      <Card className="p-4">
        <h2 className="text-lg font-semibold mb-4">Staff Productivity</h2>
        
        {/* Filter controls */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <div>
            <Label htmlFor="startDate">Start Date</Label>
            <Input
              id="startDate"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="endDate">End Date</Label>
            <Input
              id="endDate"
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="solution">Solution</Label>
            <Select value={selectedSolution} onValueChange={setSelectedSolution}>
              <SelectTrigger id="solution">
                <SelectValue placeholder="Select solution" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Solutions</SelectItem>
                {solutions.map((solution) => (
                  <SelectItem key={solution} value={solution}>
                    {solution}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <div className="flex justify-end mb-4">
          <Button onClick={applyFilters}>Apply Filters</Button>
        </div>
        
        {/* Productivity chart */}
        <div className="h-[350px] mb-6">
          {chartData.length > 0 ? (
            <ResponsiveBar
              data={chartData}
              keys={["Total Calls", ...solutions.slice(0, 3)]}
              indexBy="staff"
              margin={{ top: 10, right: 130, bottom: 50, left: 60 }}
              padding={0.3}
              valueScale={{ type: "linear" }}
              colors={['#3B82F6', '#10B981', '#F59E0B', '#EF4444']}
              borderRadius={4}
              borderColor={{ from: "color", modifiers: [["darker", 1.6]] }}
              axisBottom={{
                tickSize: 5,
                tickPadding: 5,
                tickRotation: 45,
                legend: "Staff Member",
                legendPosition: "middle",
                legendOffset: 40,
              }}
              axisLeft={{
                tickSize: 5,
                tickPadding: 5,
                tickRotation: 0,
                legend: "Number of Calls",
                legendPosition: "middle",
                legendOffset: -50,
              }}
              labelSkipWidth={12}
              labelSkipHeight={12}
              labelTextColor="#ffffff"
              legends={[
                {
                  dataFrom: "keys",
                  anchor: "bottom-right",
                  direction: "column",
                  justify: false,
                  translateX: 120,
                  translateY: 0,
                  itemsSpacing: 2,
                  itemWidth: 100,
                  itemHeight: 20,
                  itemDirection: "left-to-right",
                  itemOpacity: 0.85,
                  symbolSize: 20,
                },
              ]}
              animate={true}
            />
          ) : (
            <div className="h-full flex items-center justify-center text-gray-400">
              No data available
            </div>
          )}
        </div>
        
        {/* Productivity table */}
        <Table>
          <TableCaption>Staff Productivity Metrics</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead>Staff Name</TableHead>
              <TableHead className="text-right">Total Calls</TableHead>
              <TableHead className="text-right">Avg. Duration</TableHead>
              <TableHead className="text-right">Efficiency Score</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {productivityMetrics.map((metric, index) => (
              <TableRow key={index}>
                <TableCell className="font-medium">{metric.staff}</TableCell>
                <TableCell className="text-right">{metric.totalCalls}</TableCell>
                <TableCell className="text-right">{metric.avgDuration}</TableCell>
                <TableCell className="text-right">{metric.efficiency}</TableCell>
              </TableRow>
            ))}
            {productivityMetrics.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} className="text-center">No data available</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
};

export default Productivity;
