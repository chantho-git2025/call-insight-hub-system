
import { useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { CalendarIcon } from "lucide-react";
import ScheduleFileUpload from "./ScheduleFileUpload";
import { useToast } from "@/components/ui/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface ScheduleEntry {
  id: string;
  Name: string;
  Date: string;
  Shifts: string;
  Position: string;
}

// Sample data
const sampleScheduleData: ScheduleEntry[] = [
  { id: "1", Name: "AUN RATHA", Date: "04/12/2025", Shifts: "8AM-5PM", Position: "CC" },
  { id: "2", Name: "Sun Hengly", Date: "05/10/2025", Shifts: "9PM-3AM", Position: "NOC" },
  { id: "3", Name: "SEANG MENG HOUR", Date: "05/09/2025", Shifts: "Day Off", Position: "CC" },
  { id: "4", Name: "SAM SOKHOM", Date: "05/02/2025", Shifts: "5PM-10PM", Position: "CC" },
  { id: "5", Name: "Ly Sopholen", Date: "04/03/2025", Shifts: "9PM-3AM", Position: "NOC" },
  { id: "6", Name: "PHANG RATHA", Date: "05/02/2025", Shifts: "Day Off", Position: "CC" },
  { id: "7", Name: "MAO SREYNICH", Date: "04/02/2025", Shifts: "10AM-7PM", Position: "CS" },
  { id: "8", Name: "PHANG RATHA", Date: "04/14/2025", Shifts: "Public Holiday", Position: "CC" },
  { id: "9", Name: "SAM SOKHOM", Date: "04/13/2025", Shifts: "5PM-10PM", Position: "CC" },
  { id: "10", Name: "SAM SOKHOM", Date: "04/09/2025", Shifts: "5PM-10PM", Position: "CC" },
  { id: "11", Name: "MAO SREYNICH", Date: "05/03/2025", Shifts: "Day Off", Position: "CS" },
  { id: "12", Name: "SAO CHANTHO", Date: "04/13/2025", Shifts: "8AM-5PM", Position: "Teamleader" },
  { id: "13", Name: "PHANG RATHA", Date: "05/07/2025", Shifts: "5PM-10PM", Position: "CC" },
  { id: "14", Name: "MAO SREYNICH", Date: "04/24/2025", Shifts: "10AM-7PM", Position: "CS" },
  { id: "15", Name: "PHANG RATHA", Date: "05/10/2025", Shifts: "5PM-10PM", Position: "CC" },
  { id: "16", Name: "PHANG RATHA", Date: "04/07/2025", Shifts: "5PM-10PM", Position: "CC" },
  { id: "17", Name: "CHEA PISEY", Date: "04/24/2025", Shifts: "7AM-4PM", Position: "CC" },
  { id: "18", Name: "CHEA USA", Date: "04/14/2025", Shifts: "8AM-5PM", Position: "CS" }
];

const Schedule = () => {
  const [scheduleData, setScheduleData] = useState<ScheduleEntry[]>(sampleScheduleData);
  const [nameFilter, setNameFilter] = useState("");
  const [dateFilter, setDateFilter] = useState<Date | undefined>(undefined);
  const [shiftsFilter, setShiftsFilter] = useState("");
  const [positionFilter, setPositionFilter] = useState("");
  const { toast } = useToast();

  const filteredData = scheduleData.filter(entry => {
    const nameMatch = entry.Name.toLowerCase().includes(nameFilter.toLowerCase());
    const dateMatch = dateFilter ? entry.Date === format(dateFilter, "MM/dd/yyyy") : true;
    const shiftsMatch = entry.Shifts.toLowerCase().includes(shiftsFilter.toLowerCase());
    const positionMatch = entry.Position.toLowerCase().includes(positionFilter.toLowerCase());
    
    return nameMatch && dateMatch && shiftsMatch && positionMatch;
  });

  const clearFilters = () => {
    setNameFilter("");
    setDateFilter(undefined);
    setShiftsFilter("");
    setPositionFilter("");
  };

  const handleUploadSuccess = (data: any[]) => {
    // Add an id field to each record for easier handling in the table
    const scheduleWithIds = data.map((item, index) => ({
      id: `schedule-${index}`,
      ...item
    }));
    
    setScheduleData(scheduleWithIds);
    toast({
      title: "Upload Successful",
      description: `${data.length} schedule entries have been loaded.`,
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

  return (
    <div className="space-y-6">
      <Tabs defaultValue="schedule" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="schedule">Schedule</TabsTrigger>
          <TabsTrigger value="upload">Upload Schedule</TabsTrigger>
        </TabsList>
        
        <TabsContent value="upload">
          <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
            <h2 className="text-xl font-semibold mb-4">Upload Schedule Data</h2>
            <ScheduleFileUpload 
              onUploadSuccess={handleUploadSuccess} 
              onUploadError={handleUploadError} 
            />
          </div>
        </TabsContent>
        
        <TabsContent value="schedule">
          <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
            <h2 className="text-xl font-semibold mb-4">Staff Schedule</h2>

            {/* Filters */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
              <div>
                <label htmlFor="name-filter" className="block text-sm font-medium mb-1">
                  Name
                </label>
                <Input
                  id="name-filter"
                  value={nameFilter}
                  onChange={(e) => setNameFilter(e.target.value)}
                  placeholder="Filter by name..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Date
                </label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left",
                        !dateFilter && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {dateFilter ? format(dateFilter, "PPP") : <span>Pick a date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={dateFilter}
                      onSelect={setDateFilter}
                      initialFocus
                      className={cn("p-3 pointer-events-auto")}
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div>
                <label htmlFor="shifts-filter" className="block text-sm font-medium mb-1">
                  Shifts
                </label>
                <Input
                  id="shifts-filter"
                  value={shiftsFilter}
                  onChange={(e) => setShiftsFilter(e.target.value)}
                  placeholder="Filter by shifts..."
                />
              </div>

              <div>
                <label htmlFor="position-filter" className="block text-sm font-medium mb-1">
                  Position
                </label>
                <Input
                  id="position-filter"
                  value={positionFilter}
                  onChange={(e) => setPositionFilter(e.target.value)}
                  placeholder="Filter by position..."
                />
              </div>

              <div className="flex items-end">
                <Button onClick={clearFilters} variant="outline" className="w-full">
                  Clear Filters
                </Button>
              </div>
            </div>

            {/* Schedule Table */}
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="font-medium">Name</TableHead>
                    <TableHead className="font-medium">Date</TableHead>
                    <TableHead className="font-medium">Shifts</TableHead>
                    <TableHead className="font-medium">Position</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredData.length > 0 ? (
                    filteredData.map((entry) => (
                      <TableRow key={entry.id}>
                        <TableCell>{entry.Name}</TableCell>
                        <TableCell>{entry.Date}</TableCell>
                        <TableCell>{entry.Shifts}</TableCell>
                        <TableCell>{entry.Position}</TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-6 text-muted-foreground">
                        No schedule entries found matching your filters.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Schedule;
