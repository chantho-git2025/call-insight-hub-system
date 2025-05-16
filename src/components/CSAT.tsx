
import { useState, useEffect } from "react";
import { ResponsivePie } from "@nivo/pie";
import { ResponsiveBar } from "@nivo/bar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { DatePickerWithRange } from "@/components/ui/date-picker-with-range";
import { addDays } from "date-fns";
import CSATFileUpload from "./CSATFileUpload";
import { useToast } from "@/components/ui/use-toast";

// Define the proper types for the chart data
interface RatingDataItem {
  id: string;
  label: string;
  value: number;
}

// Interface for the bar chart data that satisfies BarDatum requirements
interface FindMknDataItem {
  id: string;
  value: number;
  [key: string]: string | number; // Add index signature for string keys
}

const CSAT = () => {
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [fromDate, setFromDate] = useState(addDays(new Date(), -30));
  const [toDate, setToDate] = useState(new Date());
  const [ratingFilter, setRatingFilter] = useState("all");
  const [contactResultFilter, setContactResultFilter] = useState("all");
  const [findMknFilter, setFindMknFilter] = useState("all");
  const { toast } = useToast();

  const handleFileUpload = (data) => {
    // Add an id field to each record for easier handling
    const dataWithIds = data.map((item, index) => ({
      id: `csat-${index}`,
      ...item
    }));
    
    setData(dataWithIds);
    setFilteredData(dataWithIds);
    toast({
      title: "Upload Successful",
      description: `${data.length} CSAT records have been loaded.`,
      variant: "default",
    });
  };

  const handleUploadError = (message) => {
    toast({
      title: "Upload Error",
      description: message,
      variant: "destructive",
    });
  };

  const handleDateRangeChange = (range) => {
    setFromDate(range.from);
    setToDate(range.to);
  };

  const handleRatingChange = (value) => {
    setRatingFilter(value);
  };

  const handleContactResultChange = (value) => {
    setContactResultFilter(value);
  };

  const handleFindMknChange = (value) => {
    setFindMknFilter(value);
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
      result = result.filter((item) => {
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
      result = result.filter((item) => {
        // Make sure Rating Point exists and convert to string safely
        const rating = item["Rating Point"];
        return rating !== null && rating !== undefined && rating.toString() === ratingFilter;
      });
    }

    // Apply contact result filter
    if (contactResultFilter !== "all") {
      result = result.filter((item) => item["Contact Result"] === contactResultFilter);
    }

    // Apply find MKN filter
    if (findMknFilter !== "all") {
      result = result.filter((item) => item["Find MKN"] === findMknFilter);
    }

    setFilteredData(result);
  }, [data, fromDate, toDate, ratingFilter, contactResultFilter, findMknFilter]);

  // Calculate data for the Rating Point chart
  const calculateRatingData = (): RatingDataItem[] => {
    const counts: Record<string, number> = {};
    
    filteredData.forEach((item) => {
      const rating = item["Rating Point"];
      const ratingStr = rating !== null && rating !== undefined ? rating.toString() : "No Rating";
      counts[ratingStr] = (counts[ratingStr] || 0) + 1;
    });

    return Object.entries(counts)
      .map(([rating, count]) => ({
        id: rating,
        label: rating,
        value: count
      }))
      .sort((a, b) => {
        // Sort numerically, with "No Rating" at the end
        if (a.id === "No Rating") return 1;
        if (b.id === "No Rating") return -1;
        const aNum = parseInt(a.id);
        const bNum = parseInt(b.id);
        return isNaN(bNum) || isNaN(aNum) ? 0 : bNum - aNum;
      });
  };

  // Calculate data for Find MKN chart - now as bar chart
  const calculateFindMknData = (): FindMknDataItem[] => {
    const counts: Record<string, number> = {};
    
    filteredData.forEach((item) => {
      const findMkn = item["Find MKN"] || "Unknown";
      counts[findMkn] = (counts[findMkn] || 0) + 1;
    });

    return Object.entries(counts).map(([name, value]) => ({
      id: name,
      value,
      [name]: value // Add the key-value pair to satisfy BarDatum
    }));
  };

  // Get unique contact results for filter dropdown
  const getContactResults = () => {
    const results = new Set();
    data.forEach((item) => {
      if (item["Contact Result"]) {
        results.add(item["Contact Result"]);
      }
    });
    return Array.from(results);
  };

  // Get unique Find MKN values for filter dropdown
  const getFindMknValues = () => {
    const values = new Set();
    data.forEach((item) => {
      if (item["Find MKN"]) {
        values.add(item["Find MKN"]);
      }
    });
    return Array.from(values);
  };

  return (
    <Tabs defaultValue="main">
      <TabsContent value="main" className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Upload CSAT Data</CardTitle>
          </CardHeader>
          <CardContent>
            <CSATFileUpload 
              onUploadSuccess={handleFileUpload} 
              onUploadError={handleUploadError} 
            />
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>CSAT Filters</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              
              <div>
                <label className="block text-sm font-medium mb-1">
                  Date Range
                </label>
                <DatePickerWithRange
                  selected={{
                    from: fromDate,
                    to: toDate
                  }}
                  onSelect={handleDateRangeChange}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">
                  Rating
                </label>
                <Select value={ratingFilter} onValueChange={handleRatingChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select Rating" />
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
              
              <div>
                <label className="block text-sm font-medium mb-1">
                  Contact Result
                </label>
                <Select value={contactResultFilter} onValueChange={handleContactResultChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select Contact Result" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Results</SelectItem>
                    {getContactResults().map((result: string) => (
                      <SelectItem key={result} value={result}>
                        {result}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">
                  Find MKN
                </label>
                <Select value={findMknFilter} onValueChange={handleFindMknChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select Find MKN" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    {getFindMknValues().map((value: string) => (
                      <SelectItem key={value} value={value}>
                        {value}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* CSAT Rating Distribution */}
          <Card>
            <CardHeader>
              <CardTitle>CSAT Rating Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[350px]">
                {filteredData.length > 0 ? (
                  <ResponsivePie
                    data={calculateRatingData()}
                    margin={{ top: 40, right: 80, bottom: 80, left: 80 }}
                    innerRadius={0.5}
                    padAngle={0.7}
                    cornerRadius={3}
                    colors={{ scheme: 'nivo' }}
                    borderWidth={1}
                    borderColor={{ from: 'color', modifiers: [['darker', 0.2]] }}
                    arcLabelsSkipAngle={10}
                    arcLabelsTextColor="#333333"
                    arcLinkLabelsOffset={0}
                    arcLinkLabelsSkipAngle={10}
                    arcLinkLabelsTextOffset={6}
                    arcLinkLabelsTextColor="#333333"
                    arcLinkLabelsThickness={1}
                    arcLinkLabelsColor={{ from: 'color' }}
                    activeOuterRadiusOffset={8}
                    legends={[
                      {
                        anchor: 'bottom',
                        direction: 'row',
                        translateY: 56,
                        itemWidth: 100,
                        itemHeight: 18,
                        itemTextColor: '#999',
                        symbolSize: 18,
                        symbolShape: 'circle',
                        effects: [{ on: 'hover', style: { itemTextColor: '#000' } }]
                      }
                    ]}
                  />
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-400">
                    No data available
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Find MKN Distribution (Bar Chart) */}
          <Card>
            <CardHeader>
              <CardTitle>Find MKN Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[350px]">
                {filteredData.length > 0 ? (
                  <ResponsiveBar
                    data={calculateFindMknData()}
                    indexBy="id"
                    keys={['value']}
                    margin={{ top: 50, right: 50, bottom: 100, left: 60 }}
                    padding={0.3}
                    colors={{ scheme: 'nivo' }}
                    borderColor={{ from: 'color', modifiers: [['darker', 1.6]] }}
                    axisTop={null}
                    axisRight={null}
                    axisBottom={{
                      tickSize: 5,
                      tickPadding: 5,
                      tickRotation: 45,
                      legend: 'Find MKN Categories',
                      legendPosition: 'middle',
                      legendOffset: 80
                    }}
                    axisLeft={{
                      tickSize: 5,
                      tickPadding: 5,
                      tickRotation: 0,
                      legend: 'Count',
                      legendPosition: 'middle',
                      legendOffset: -50
                    }}
                    labelSkipWidth={12}
                    labelSkipHeight={12}
                    labelTextColor={{ from: 'color', modifiers: [['darker', 1.6]] }}
                    animate={true}
                  />
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-400">
                    No data available
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Summary Card */}
        <Card>
          <CardHeader>
            <CardTitle>CSAT Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="bg-blue-50 p-4 rounded-lg text-center">
                <p className="text-sm text-gray-600">Total Surveys</p>
                <p className="text-2xl font-bold">{filteredData.length}</p>
              </div>
              
              <div className="bg-green-50 p-4 rounded-lg text-center">
                <p className="text-sm text-gray-600">Average Rating</p>
                <p className="text-2xl font-bold">
                  {filteredData.length > 0 
                    ? (filteredData.reduce((sum, item) => {
                        const rating = parseInt(item["Rating Point"]);
                        return isNaN(rating) ? sum : sum + rating;
                      }, 0) / filteredData.filter(item => !isNaN(parseInt(item["Rating Point"]))).length).toFixed(1)
                    : "N/A"}
                </p>
              </div>
              
              <div className="bg-yellow-50 p-4 rounded-lg text-center">
                <p className="text-sm text-gray-600">5-Star Ratings</p>
                <p className="text-2xl font-bold">
                  {filteredData.filter(item => item["Rating Point"] === "5").length}
                </p>
              </div>
              
              <div className="bg-red-50 p-4 rounded-lg text-center">
                <p className="text-sm text-gray-600">Low Ratings (1-2)</p>
                <p className="text-2xl font-bold">
                  {filteredData.filter(item => {
                    const rating = parseInt(item["Rating Point"]);
                    return rating === 1 || rating === 2;
                  }).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
};

export default CSAT;
