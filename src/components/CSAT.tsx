
import { useState, useEffect } from "react";
import { ResponsivePie } from "@nivo/pie";
import { ResponsiveBar } from "@nivo/bar"; 
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TabsContent } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { DatePickerWithRange } from "@/components/ui/date-picker-with-range";
import { addDays } from "date-fns";
import CSATFileUpload from "./CSATFileUpload";
import { useToast } from "@/components/ui/use-toast";

const CSAT = () => {
  const [data, setData] = useState<any[]>([]);
  const [filteredData, setFilteredData] = useState<any[]>([]);
  const [fromDate, setFromDate] = useState<Date | undefined>(addDays(new Date(), -30));
  const [toDate, setToDate] = useState<Date | undefined>(new Date());
  const [ratingFilter, setRatingFilter] = useState<string>("all");
  const [contactResultFilter, setContactResultFilter] = useState<string>("all");
  const [findMknFilter, setFindMknFilter] = useState<string>("all");
  const { toast } = useToast();

  const handleFileUpload = (data: any[]) => {
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

  const handleUploadError = (message: string) => {
    toast({
      title: "Upload Error",
      description: message,
      variant: "destructive",
    });
  };

  const handleDateRangeChange = (range: { from?: Date; to?: Date }) => {
    setFromDate(range.from);
    setToDate(range.to);
  };

  const handleRatingChange = (value: string) => {
    setRatingFilter(value);
  };

  const handleContactResultChange = (value: string) => {
    setContactResultFilter(value);
  };

  const handleFindMknChange = (value: string) => {
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
      result = result.filter(item => item["Contact Result"] === contactResultFilter);
    }

    // Apply find MKN filter
    if (findMknFilter !== "all") {
      result = result.filter(item => item["Find MKN"] === findMknFilter);
    }

    setFilteredData(result);
  }, [data, fromDate, toDate, ratingFilter, contactResultFilter, findMknFilter]);

  // Calculate data for the Rating Point chart
  const calculateRatingData = () => {
    const counts: Record<string, number> = {};
    
    filteredData.forEach(item => {
      const rating = item["Rating Point"];
      const ratingStr = rating !== null && rating !== undefined 
        ? rating.toString() 
        : "No Rating";
      
      counts[ratingStr] = (counts[ratingStr] || 0) + 1;
    });

    return Object.entries(counts).map(([rating, count]) => ({
      id: rating,
      label: rating,
      name: rating,
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

  // Calculate data for Find MKN chart - now as bar chart
  const calculateFindMknData = () => {
    const counts: Record<string, number> = {};
    
    filteredData.forEach(item => {
      const findMkn = item["Find MKN"] || "Unknown";
      counts[findMkn] = (counts[findMkn] || 0) + 1;
    });

    return Object.entries(counts).map(([name, value]) => ({
      name,
      value
    }));
  };

  // Get unique contact results for filter dropdown
  const getContactResults = () => {
    const results = new Set<string>();
    data.forEach(item => {
      if (item["Contact Result"]) {
        results.add(item["Contact Result"]);
      }
    });
    return Array.from(results);
  };

  // Get unique Find MKN values for filter dropdown
  const getFindMknValues = () => {
    const values = new Set<string>();
    data.forEach(item => {
      if (item["Find MKN"]) {
        values.add(item["Find MKN"]);
      }
    });
    return Array.from(values);
  };

  return (
    <TabsContent value="csat" className="space-y-6">
      {/* File Upload Card */}
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

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>CSAT Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Date Range Filter */}
            <div>
              <label className="block text-sm font-medium mb-1">Date Range</label>
              <DatePickerWithRange
                selected={{ from: fromDate, to: toDate }}
                onSelect={handleDateRangeChange}
              />
            </div>

            {/* Rating Filter */}
            <div>
              <label className="block text-sm font-medium mb-1">Rating</label>
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

            {/* Contact Result Filter */}
            <div>
              <label className="block text-sm font-medium mb-1">Contact Result</label>
              <Select value={contactResultFilter} onValueChange={handleContactResultChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Contact Result" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Results</SelectItem>
                  {getContactResults().map((result) => (
                    <SelectItem key={result} value={result}>
                      {result}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Find MKN Filter */}
            <div>
              <label className="block text-sm font-medium mb-1">Find MKN</label>
              <Select value={findMknFilter} onValueChange={handleFindMknChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Find MKN" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  {getFindMknValues().map((value) => (
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

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Rating Chart */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Rating Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              {filteredData.length > 0 ? (
                <ResponsivePie
                  data={calculateRatingData()}
                  margin={{ top: 40, right: 80, bottom: 80, left: 80 }}
                  innerRadius={0.5}
                  padAngle={0.7}
                  cornerRadius={3}
                  activeOuterRadiusOffset={8}
                  colors={{ scheme: 'nivo' }}
                  borderWidth={1}
                  borderColor={{ from: 'color', modifiers: [['darker', 0.2]] }}
                  arcLinkLabelsSkipAngle={10}
                  arcLinkLabelsTextColor="#333333"
                  arcLinkLabelsThickness={2}
                  arcLinkLabelsColor={{ from: 'color' }}
                  arcLabelsSkipAngle={10}
                  arcLabelsTextColor={{ from: 'color', modifiers: [['darker', 2]] }}
                  legends={[
                    {
                      anchor: 'bottom',
                      direction: 'row',
                      justify: false,
                      translateX: 0,
                      translateY: 56,
                      itemsSpacing: 0,
                      itemWidth: 100,
                      itemHeight: 18,
                      itemTextColor: '#999',
                      itemDirection: 'left-to-right',
                      itemOpacity: 1,
                      symbolSize: 18,
                      symbolShape: 'circle',
                      effects: [{ on: 'hover', style: { itemTextColor: '#000' } }]
                    }
                  ]}
                />
              ) : (
                <div className="flex items-center justify-center h-full">
                  <p className="text-muted-foreground">No data available</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Summary Card */}
        <Card>
          <CardHeader>
            <CardTitle>CSAT Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Total Surveys</h3>
                <p className="text-2xl font-bold">{filteredData.length}</p>
              </div>
              <Separator />
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Average Rating</h3>
                <p className="text-2xl font-bold">
                  {filteredData.length > 0
                    ? (
                        filteredData.reduce((acc, item) => {
                          const rating = parseFloat(item["Rating Point"] || "0");
                          return acc + rating;
                        }, 0) / filteredData.length
                      ).toFixed(1)
                    : "N/A"}
                </p>
              </div>
              <Separator />
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">5-Star Ratings</h3>
                <p className="text-2xl font-bold">
                  {
                    filteredData.filter(item => 
                      item["Rating Point"] && item["Rating Point"].toString() === "5"
                    ).length
                  }
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Additional Charts */}
      <Card>
        <CardHeader>
          <CardTitle>Find MKN Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            {filteredData.length > 0 ? (
              <ResponsiveBar
                data={calculateFindMknData()}
                keys={['value']}
                indexBy="name"
                margin={{ top: 50, right: 130, bottom: 50, left: 60 }}
                padding={0.3}
                valueScale={{ type: 'linear' }}
                indexScale={{ type: 'band', round: true }}
                colors={{ scheme: 'nivo' }}
                borderColor={{ from: 'color', modifiers: [['darker', 1.6]] }}
                axisTop={null}
                axisRight={null}
                axisBottom={{
                  tickSize: 5,
                  tickPadding: 5,
                  tickRotation: -45,
                  legend: 'Find MKN',
                  legendPosition: 'middle',
                  legendOffset: 40
                }}
                axisLeft={{
                  tickSize: 5,
                  tickPadding: 5,
                  tickRotation: 0,
                  legend: 'Count',
                  legendPosition: 'middle',
                  legendOffset: -40
                }}
                labelSkipWidth={12}
                labelSkipHeight={12}
                labelTextColor={{ from: 'color', modifiers: [['darker', 1.6]] }}
                legends={[
                  {
                    dataFrom: 'keys',
                    anchor: 'bottom-right',
                    direction: 'column',
                    justify: false,
                    translateX: 120,
                    translateY: 0,
                    itemsSpacing: 2,
                    itemWidth: 100,
                    itemHeight: 20,
                    itemDirection: 'left-to-right',
                    itemOpacity: 0.85,
                    symbolSize: 20,
                    effects: [
                      {
                        on: 'hover',
                        style: {
                          itemOpacity: 1
                        }
                      }
                    ]
                  }
                ]}
              />
            ) : (
              <div className="flex items-center justify-center h-full">
                <p className="text-muted-foreground">No data available</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </TabsContent>
  );
};

export default CSAT;
