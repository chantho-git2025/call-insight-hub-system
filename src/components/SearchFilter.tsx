
import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";

interface SearchFilterProps {
  data: any[];
  onSearch: (results: any[]) => void;
}

const SearchFilter = ({ data, onSearch }: SearchFilterProps) => {
  const [searchText, setSearchText] = useState("");
  const [locationFilter, setLocationFilter] = useState("all");
  const [sourceFilter, setSourceFilter] = useState("all");
  const [symptomFilter, setSymptomFilter] = useState("all");
  const [solutionFilter, setSolutionFilter] = useState("all");
  const [uniqueLocations, setUniqueLocations] = useState<string[]>([]);
  const [uniqueSources, setUniqueSources] = useState<string[]>([]);
  const [uniqueSymptoms, setUniqueSymptoms] = useState<string[]>([]);
  const [uniqueSolutions, setUniqueSolutions] = useState<string[]>([]);

  // Extract unique field values for filters
  useEffect(() => {
    if (!data || data.length === 0) {
      return;
    }

    const locations = new Set<string>();
    const sources = new Set<string>();
    const symptoms = new Set<string>();
    const solutions = new Set<string>();

    data.forEach((item) => {
      if (item.Location) locations.add(item.Location);
      if (item.Source) sources.add(item.Source);
      if (item.Symptom) symptoms.add(item.Symptom);
      if (item.Solution) solutions.add(item.Solution);
    });

    setUniqueLocations(Array.from(locations));
    setUniqueSources(Array.from(sources));
    setUniqueSymptoms(Array.from(symptoms));
    setUniqueSolutions(Array.from(solutions));
  }, [data]);

  // Apply all filters
  const applyFilters = () => {
    if (!data || data.length === 0) {
      onSearch([]);
      return;
    }

    let filtered = [...data];

    // Apply text search across all fields
    if (searchText.trim()) {
      const searchLower = searchText.toLowerCase();
      filtered = filtered.filter((item) => {
        return Object.values(item).some((value) => {
          if (value === null || value === undefined) return false;
          return String(value).toLowerCase().includes(searchLower);
        });
      });
    }

    // Apply location filter
    if (locationFilter !== "all") {
      filtered = filtered.filter((item) => item.Location === locationFilter);
    }

    // Apply source filter
    if (sourceFilter !== "all") {
      filtered = filtered.filter((item) => item.Source === sourceFilter);
    }

    // Apply symptom filter
    if (symptomFilter !== "all") {
      filtered = filtered.filter((item) => item.Symptom === symptomFilter);
    }
    
    // Apply solution filter
    if (solutionFilter !== "all") {
      filtered = filtered.filter((item) => item.Solution === solutionFilter);
    }

    onSearch(filtered);
  };

  // Reset all filters
  const resetFilters = () => {
    setSearchText("");
    setLocationFilter("all");
    setSourceFilter("all");
    setSymptomFilter("all");
    setSolutionFilter("all");
    onSearch(data);
  };

  // Apply filters when any filter changes
  useEffect(() => {
    applyFilters();
  }, [searchText, locationFilter, sourceFilter, symptomFilter, solutionFilter]);

  return (
    <div className="space-y-4">
      {/* Text Search */}
      <div>
        <label className="block text-sm font-medium mb-1">
          Search
        </label>
        <Input
          type="text"
          placeholder="Search across all fields..."
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Location Filter */}
        <div>
          <label className="block text-sm font-medium mb-1">
            Location
          </label>
          <Select 
            value={locationFilter} 
            onValueChange={(value) => setLocationFilter(value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Filter by location" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Locations</SelectItem>
              {uniqueLocations.map((location) => (
                <SelectItem key={location} value={location}>
                  {location}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Source Filter */}
        <div>
          <label className="block text-sm font-medium mb-1">
            Source
          </label>
          <Select 
            value={sourceFilter} 
            onValueChange={(value) => setSourceFilter(value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Filter by source" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Sources</SelectItem>
              {uniqueSources.map((source) => (
                <SelectItem key={source} value={source}>
                  {source}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Symptom Filter */}
        <div>
          <label className="block text-sm font-medium mb-1">
            Symptom
          </label>
          <Select 
            value={symptomFilter} 
            onValueChange={(value) => setSymptomFilter(value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Filter by symptom" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Symptoms</SelectItem>
              {uniqueSymptoms.map((symptom) => (
                <SelectItem key={symptom} value={symptom}>
                  {symptom}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        {/* Solution Filter */}
        <div>
          <label className="block text-sm font-medium mb-1">
            Solution
          </label>
          <Select 
            value={solutionFilter} 
            onValueChange={(value) => setSolutionFilter(value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Filter by solution" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Solutions</SelectItem>
              {uniqueSolutions.map((solution) => (
                <SelectItem key={solution} value={solution}>
                  {solution}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 pt-2">
        <Button 
          onClick={applyFilters}
          variant="default"
        >
          Apply Filters
        </Button>
        <Button 
          onClick={resetFilters}
          variant="outline"
        >
          Reset
        </Button>
      </div>
    </div>
  );
};

export default SearchFilter;
