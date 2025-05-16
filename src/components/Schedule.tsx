
import { useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { CalendarIcon } from "lucide-react";

interface ScheduleEntry {
  id: string;
  name: string;
  date: string;
  shifts: string;
  position: string;
}

// Sample data
const sampleScheduleData: ScheduleEntry[] = [
  { id: "1", name: "AUN RATHA", date: "04/12/2025", shifts: "8AM-5PM", position: "CC" },
  { id: "2", name: "Sun Hengly", date: "05/10/2025", shifts: "9PM-3AM", position: "NOC" },
  { id: "3", name: "SEANG MENG HOUR", date: "05/09/2025", shifts: "Day Off", position: "CC" },
  { id: "4", name: "SAM SOKHOM", date: "05/02/2025", shifts: "5PM-10PM", position: "CC" },
  { id: "5", name: "Ly Sopholen", date: "04/03/2025", shifts: "9PM-3AM", position: "NOC" },
  { id: "6", name: "PHANG RATHA", date: "05/02/2025", shifts: "Day Off", position: "CC" },
  { id: "7", name: "MAO SREYNICH", date: "04/02/2025", shifts: "10AM-7PM", position: "CS" },
  { id: "8", name: "PHANG RATHA", date: "04/14/2025", shifts: "Public Holiday", position: "CC" },
  { id: "9", name: "SAM SOKHOM", date: "04/13/2025", shifts: "5PM-10PM", position: "CC" },
  { id: "10", name: "SAM SOKHOM", date: "04/09/2025", shifts: "5PM-10PM", position: "CC" },
  { id: "11", name: "MAO SREYNICH", date: "05/03/2025", shifts: "Day Off", position: "CS" },
  { id: "12", name: "SAO CHANTHO", date: "04/13/2025", shifts: "8AM-5PM", position: "Teamleader" },
  { id: "13", name: "PHANG RATHA", date: "05/07/2025", shifts: "5PM-10PM", position: "CC" },
  { id: "14", name: "MAO SREYNICH", date: "04/24/2025", shifts: "10AM-7PM", position: "CS" },
  { id: "15", name: "PHANG RATHA", date: "05/10/2025", shifts: "5PM-10PM", position: "CC" },
  { id: "16", name: "PHANG RATHA", date: "04/07/2025", shifts: "5PM-10PM", position: "CC" },
  { id: "17", name: "CHEA PISEY", date: "04/24/2025", shifts: "7AM-4PM", position: "CC" },
  { id: "18", name: "CHEA USA", date: "04/14/2025", shifts: "8AM-5PM", position: "CS" }
];

const Schedule = () => {
  const [scheduleData, setScheduleData] = useState<ScheduleEntry[]>(sampleScheduleData);
  const [nameFilter, setNameFilter] = useState("");
  const [dateFilter, setDateFilter] = useState<Date | undefined>(undefined);
  const [shiftsFilter, setShiftsFilter] = useState("");
  const [positionFilter, setPositionFilter] = useState("");

  const filteredData = scheduleData.filter(entry => {
    const nameMatch = entry.name.toLowerCase().includes(nameFilter.toLowerCase());
    const dateMatch = dateFilter ? entry.date === format(dateFilter, "MM/dd/yyyy") : true;
    const shiftsMatch = entry.shifts.toLowerCase().includes(shiftsFilter.toLowerCase());
    const positionMatch = entry.position.toLowerCase().includes(positionFilter.toLowerCase());
    
    return nameMatch && dateMatch && shiftsMatch && positionMatch;
  });

  const clearFilters = () => {
    setNameFilter("");
    setDateFilter(undefined);
    setShiftsFilter("");
    setPositionFilter("");
  };

  return (
    <div className="space-y-6">
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
                    <TableCell>{entry.name}</TableCell>
                    <TableCell>{entry.date}</TableCell>
                    <TableCell>{entry.shifts}</TableCell>
                    <TableCell>{entry.position}</TableCell>
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
    </div>
  );
};

export default Schedule;
