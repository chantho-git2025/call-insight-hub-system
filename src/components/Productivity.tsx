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
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Info } from "lucide-react";

interface ProductivityProps {
  data: any[];
}

type CountsRecord = Record<string, number>;

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

  useEffect(() => {
    // Set initial filtered data when component mounts or data changes
    setFilteredData(data);
    // Initially apply filters to show data right away
    applyFilters();
  }, [data]);

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
      
      // Count calls by time period
      const period8amTo5pm = staffCalls.filter(call => {
        const hour = new Date(call["Start Support"]).getHours();
        return hour >= 8 && hour < 17;
      }).length;
      
      const period5pmTo10pm = staffCalls.filter(call => {
        const hour = new Date(call["Start Support"]).getHours();
        return hour >= 17 && hour < 22;
      }).length;
      
      const period10pmTo3am = staffCalls.filter(call => {
        const hour = new Date(call["Start Support"]).getHours();
        return hour >= 22 || hour < 3;
      }).length;
      
      const period3amTo8am = staffCalls.filter(call => {
        const hour = new Date(call["Start Support"]).getHours();
        return hour >= 3 && hour < 8;
      }).length;
      
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
      const solutionCounts: CountsRecord = {};
      solutions.forEach(solution => {
        solutionCounts[solution] = staffCalls.filter(call => call.Solution === solution).length;
      });

      // Count symptoms by type
      const symptomCounts: CountsRecord = {};
      const symptoms = [...new Set(staffCalls.map(call => call.Symptom))].filter(Boolean);
      symptoms.forEach(symptom => {
        symptomCounts[symptom] = staffCalls.filter(call => call.Symptom === symptom).length;
      });

      // Count sources
      const sourceCounts: CountsRecord = {};
      const sources = [...new Set(staffCalls.map(call => call.Source))].filter(Boolean);
      sources.forEach(source => {
        sourceCounts[source] = staffCalls.filter(call => call.Source === source).length;
      });
      
      // Calculate efficiency score (simple metric: calls per minute of total time spent)
      const totalMinutes = totalDurationMinutes + (totalDurationSeconds / 60);
      const efficiency = totalMinutes > 0 ? (totalCalls / totalMinutes).toFixed(2) : 0;
      
      return {
        staff,
        totalCalls,
        periodCounts: {
          morning: period8amTo5pm,
          evening: period5pmTo10pm,
          night: period10pmTo3am,
          earlyMorning: period3amTo8am
        },
        avgDuration,
        solutionCounts,
        symptomCounts,
        sourceCounts,
        efficiency
      };
    })
    .sort((a, b) => b.totalCalls - a.totalCalls); // Sort by most productive
    
    setProductivityMetrics(metrics);
  }, [filteredData, staffMembers, solutions]);

  // Format data for the chart
  const chartData = productivityMetrics.map(metric => {
    return {
      staff: metric.staff,
      "8AM-5PM": metric.periodCounts.morning,
      "5PM-10PM": metric.periodCounts.evening,
      "10PM-3AM": metric.periodCounts.night,
      "3AM-8AM": metric.periodCounts.earlyMorning,
      "Total": metric.totalCalls
    };
  });

  // Custom colors for the chart
  const colorTheme = [
    "#6366F1", // Morning (8AM-5PM)
    "#8B5CF6", // Evening (5PM-10PM)
    "#4F46E5", // Night (10PM-3AM)
    "#A78BFA", // Early Morning (3AM-8AM)
    "#3B82F6"  // Total
  ];

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
              keys={["8AM-5PM", "5PM-10PM", "10PM-3AM", "3AM-8AM", "Total"]}
              indexBy="staff"
              margin={{ top: 10, right: 130, bottom: 50, left: 60 }}
              padding={0.3}
              valueScale={{ type: "linear" }}
              colors={colorTheme}
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
        <TooltipProvider>
          <Table>
            <TableCaption>Staff Productivity Metrics</TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead>Staff Name</TableHead>
                <TableHead className="text-right">8AM-5PM</TableHead>
                <TableHead className="text-right">5PM-10PM</TableHead>
                <TableHead className="text-right">10PM-3AM</TableHead>
                <TableHead className="text-right">3AM-8AM</TableHead>
                <TableHead className="text-right">Total Count</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {productivityMetrics.length > 0 ? (
                productivityMetrics.map((metric, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-medium">
                      <HoverCard>
                        <HoverCardTrigger asChild>
                          <span className="cursor-help flex items-center">
                            {metric.staff}
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Info className="ml-1 h-4 w-4 text-gray-500" />
                              </TooltipTrigger>
                              <TooltipContent>
                                View detailed metrics
                              </TooltipContent>
                            </Tooltip>
                          </span>
                        </HoverCardTrigger>
                        <HoverCardContent className="w-80">
                          <div className="space-y-2">
                            <h4 className="font-semibold">{metric.staff} Details</h4>
                            <div className="text-sm">
                              <p><span className="font-medium">Avg. Duration:</span> {metric.avgDuration}</p>
                              <p><span className="font-medium">Efficiency Score:</span> {metric.efficiency}</p>
                              
                              <div className="mt-2">
                                <p className="font-medium">Top Solutions:</p>
                                <ul className="list-disc list-inside pl-2">
                                  {Object.entries(metric.solutionCounts)
                                    .sort(([, aCount], [, bCount]) => ((bCount as number) - (aCount as number)))
                                    .slice(0, 3)
                                    .map(([solution, count]) => (
                                      <li key={solution}>{solution}: {count as number}</li>
                                    ))}
                                </ul>
                              </div>
                              
                              <div className="mt-2">
                                <p className="font-medium">Top Symptoms:</p>
                                <ul className="list-disc list-inside pl-2">
                                  {Object.entries(metric.symptomCounts)
                                    .sort(([, aCount], [, bCount]) => ((bCount as number) - (aCount as number)))
                                    .slice(0, 3)
                                    .map(([symptom, count]) => (
                                      <li key={symptom}>{symptom}: {count as number}</li>
                                    ))}
                                </ul>
                              </div>
                              
                              <div className="mt-2">
                                <p className="font-medium">Sources:</p>
                                <ul className="list-disc list-inside pl-2">
                                  {Object.entries(metric.sourceCounts)
                                    .sort(([, aCount], [, bCount]) => ((bCount as number) - (aCount as number)))
                                    .slice(0, 3)
                                    .map(([source, count]) => (
                                      <li key={source}>{source}: {count as number}</li>
                                    ))}
                                </ul>
                              </div>
                            </div>
                          </div>
                        </HoverCardContent>
                      </HoverCard>
                    </TableCell>
                    <TableCell className="text-right">{metric.periodCounts.morning}</TableCell>
                    <TableCell className="text-right">{metric.periodCounts.evening}</TableCell>
                    <TableCell className="text-right">{metric.periodCounts.night}</TableCell>
                    <TableCell className="text-right">{metric.periodCounts.earlyMorning}</TableCell>
                    <TableCell className="text-right font-bold">{metric.totalCalls}</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="text-center">No data available</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TooltipProvider>
      </Card>
    </div>
  );
};

export default Productivity;
