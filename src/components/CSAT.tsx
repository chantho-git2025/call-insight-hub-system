
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ChartContainer } from "@/components/ui/chart";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from "recharts";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { CalendarIcon } from "lucide-react";
import FileUpload from "./CSATFileUpload";
import { useToast } from "@/components/ui/use-toast";

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

interface CSATData {
  id: string;
  "Survey No.": string;
  "Created By": string;
  "Phone": string;
  "CID": string;
  "AID": string;
  "Customer Name": string;
  "Start Time": string;
  "End Time": string;
  "Duration (mn:ss)": string;
  "Survey Type": string;
  "Contact Result": string;
  "Question": string;
  "Rating Point": string | number;
  "Summary Note": string;
  "Note": string;
  "Solution": string;
  "Find MKN": string;
  "Note All Comment": string;
}

const CSAT = () => {
  const [data, setData] = useState<CSATData[]>([]);
  const [filteredData, setFilteredData] = useState<CSATData[]>([]);
  const [fromDate, setFromDate] = useState<Date | undefined>(undefined);
  const [toDate, setToDate] = useState<Date | undefined>(undefined);
  const [ratingFilter, setRatingFilter] = useState<string>("all");
  const [contactResultFilter, setContactResultFilter] = useState<string>("all");
  const [mknFilter, setMknFilter] = useState<string>("all");
  const { toast } = useToast();

  // Handle file upload success
  const handleUploadSuccess = (uploadedData: any[]) => {
    // Add unique IDs to the data
    const dataWithIds = uploadedData.map((item, index) => ({
      id: `csat-${index}`,
      ...item
    }));
    
    setData(dataWithIds);
    setFilteredData(dataWithIds);
    toast({
      title: "Upload Successful",
      description: `${dataWithIds.length} CSAT records have been loaded.`,
      variant: "default",
    });
  };

  // Apply filters
  useEffect(() => {
    if (data.length === 0) {
      setFilteredData([]);
      return;
    }
    
    let result = [...data];

    // Apply date filter
    if (fromDate && toDate) {
      result = result.filter(item => {
        // Make sure Start Time exists before trying to create a date
        if (!item["Start Time"]) return false;
        
        try {
          const itemDate = new Date(item["Start Time"]);
          return itemDate >= fromDate && itemDate <= toDate;
        } catch (error) {
          console.error("Invalid date format:", item["Start Time"]);
          return false;
        }
      });
    }

    // Apply rating filter
    if (ratingFilter !== "all") {
      result = result.filter(item => {
        // Make sure Rating Point exists and convert to string safely
        const rating = item["Rating Point"];
        return rating !== null && 
               rating !== undefined && 
               rating.toString() === ratingFilter;
      });
    }

    // Apply contact result filter
    if (contactResultFilter !== "all") {
      result = result.filter(item => 
        item["Contact Result"] === contactResultFilter
      );
    }

    // Apply MKN filter
    if (mknFilter !== "all") {
      result = result.filter(item => 
        item["Find MKN"] === mknFilter
      );
    }

    setFilteredData(result);
  }, [data, fromDate, toDate, ratingFilter, contactResultFilter, mknFilter]);

  // Prepare data for Rating Point chart
  const getRatingPointChartData = () => {
    const counts: Record<string, number> = {};
    
    filteredData.forEach(item => {
      const rating = item["Rating Point"];
      const ratingStr = rating !== null && rating !== undefined 
        ? rating.toString() 
        : "No Rating";
      
      counts[ratingStr] = (counts[ratingStr] || 0) + 1;
    });

    return Object.entries(counts).map(([rating, count]) => ({
      name: rating === "No Rating" ? "No Rating" : `${rating} Stars`,
      value: count
    })).sort((a, b) => {
      // Sort numerically, with "No Rating" at the end
      if (a.name === "No Rating") return 1;
      if (b.name === "No Rating") return -1;
      
      const aNum = parseInt(a.name);
      const bNum = parseInt(b.name);
      return isNaN(bNum) || isNaN(aNum) ? 0 : bNum - aNum;
    });
  };

  // Prepare data for Contact Result chart
  const getContactResultChartData = () => {
    const counts: Record<string, number> = {};
    
    filteredData.forEach(item => {
      const result = item["Contact Result"] || "Unknown";
      counts[result] = (counts[result] || 0) + 1;
    });

    return Object.entries(counts).map(([result, count]) => ({
      name: result,
      value: count
    })).sort((a, b) => b.value - a.value);
  };

  // Prepare data for Find MKN chart
  const getMknChartData = () => {
    const counts: Record<string, number> = {};
    
    filteredData.forEach(item => {
      const mkn = item["Find MKN"] || "Unknown";
      counts[mkn] = (counts[mkn] || 0) + 1;
    });

    return Object.entries(counts).map(([mkn, count]) => ({
      name: mkn,
      value: count
    }));
  };

  // Get unique contact results for filter dropdown
  const getUniqueContactResults = () => {
    const results = new Set<string>();
    data.forEach(item => {
      if (item["Contact Result"]) {
        results.add(item["Contact Result"]);
      }
    });
    return Array.from(results);
  };

  // Get unique MKN values for filter dropdown
  const getUniqueMknValues = () => {
    const values = new Set<string>();
    data.forEach(item => {
      if (item["Find MKN"]) {
        values.add(item["Find MKN"]);
      }
    });
    return Array.from(values);
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
        <h2 className="text-xl font-semibold mb-4">Upload CSAT Data</h2>
        <FileUpload 
          onUploadSuccess={handleUploadSuccess} 
          onUploadError={(msg) => toast({
            title: "Upload Error",
            description: msg,
            variant: "destructive"
          })} 
        />
      </div>

      <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
        <h2 className="text-xl font-semibold mb-4">Filters</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {/* Date Range Filter */}
          <div>
            <Label>From Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal mt-1",
                    !fromDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {fromDate ? format(fromDate, "PPP") : <span>Pick a date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={fromDate}
                  onSelect={setFromDate}
                  initialFocus
                  className={cn("p-3 pointer-events-auto")}
                />
              </PopoverContent>
            </Popover>
          </div>
          
          <div>
            <Label>To Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal mt-1",
                    !toDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {toDate ? format(toDate, "PPP") : <span>Pick a date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={toDate}
                  onSelect={setToDate}
                  initialFocus
                  className={cn("p-3 pointer-events-auto")}
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Rating Point Filter */}
          <div>
            <Label>Rating Point</Label>
            <Select value={ratingFilter} onValueChange={setRatingFilter}>
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="All Ratings" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Ratings</SelectItem>
                <SelectItem value="1">1 Star</SelectItem>
                <SelectItem value="2">2 Stars</SelectItem>
                <SelectItem value="3">3 Stars</SelectItem>
                <SelectItem value="4">4 Stars</SelectItem>
                <SelectItem value="5">5 Stars</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Contact Result Filter */}
          <div>
            <Label>Contact Result</Label>
            <Select value={contactResultFilter} onValueChange={setContactResultFilter}>
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="All Results" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Results</SelectItem>
                {getUniqueContactResults().map(result => (
                  <SelectItem key={result} value={result}>{result}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Find MKN Filter */}
          <div>
            <Label>Find MKN</Label>
            <Select value={mknFilter} onValueChange={setMknFilter}>
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="All MKN" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All MKN</SelectItem>
                {getUniqueMknValues().map(mkn => (
                  <SelectItem key={mkn} value={mkn}>{mkn}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Rating Point Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Rating Point Distribution</CardTitle>
          </CardHeader>
          <CardContent className="h-[400px]">
            {filteredData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={getRatingPointChartData()}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="value" name="Count" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-muted-foreground">
                No data available - Please upload CSAT data
              </div>
            )}
          </CardContent>
        </Card>

        {/* Contact Result Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Contact Result Distribution</CardTitle>
          </CardHeader>
          <CardContent className="h-[400px]">
            {filteredData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={getContactResultChartData()}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="value" name="Count" fill="#82ca9d" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-muted-foreground">
                No data available - Please upload CSAT data
              </div>
            )}
          </CardContent>
        </Card>

        {/* Find MKN Chart */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Find MKN Distribution</CardTitle>
          </CardHeader>
          <CardContent className="h-[400px]">
            {filteredData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={getMknChartData()}
                    cx="50%"
                    cy="50%"
                    labelLine={true}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={150}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {getMknChartData().map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-muted-foreground">
                No data available - Please upload CSAT data
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CSAT;
