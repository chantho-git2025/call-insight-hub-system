
import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";

interface SearchFilterProps {
  data: any[];
  onSearch: (results: any[]) => void;
}

const SearchFilter = ({ data, onSearch }: SearchFilterProps) => {
  const [searchValue, setSearchValue] = useState("");
  const [searchField, setSearchField] = useState("phone");
  const [locationFilter, setLocationFilter] = useState("all");
  const [symptomFilter, setSymptomFilter] = useState("all");
  const [sourceFilter, setSourceFilter] = useState("all");
  const [operationTypeFilter, setOperationTypeFilter] = useState("all");
  
  // Extract unique values for filter dropdowns
  const locations = [...new Set(data.map(item => item.Location))].filter(Boolean).sort();
  const symptoms = [...new Set(data.map(item => item.Symptom))].filter(Boolean).sort();
  const sources = [...new Set(data.map(item => item["Source Name"]))].filter(Boolean).sort();
  const operationTypes = [...new Set(data.map(item => item["Service Operation Type"]))].filter(Boolean).sort();

  useEffect(() => {
    // Apply filters whenever they change or data changes
    applyFilters();
  }, [data, locationFilter, symptomFilter, sourceFilter, operationTypeFilter]);

  const handleSearch = () => {
    if (!searchValue.trim()) {
      applyFilters();
      return;
    }

    let fieldToSearch;
    switch (searchField) {
      case "cid":
        fieldToSearch = "CID";
        break;
      case "aid":
        fieldToSearch = "AID";
        break;
      case "name":
        fieldToSearch = "Customer Name";
        break;
      case "phone":
        fieldToSearch = "Phone";
        break;
      default:
        fieldToSearch = "Phone";
    }

    const searchTerm = searchValue.toLowerCase();
    
    const filteredResults = data.filter(item => {
      // First apply the dropdown filters
      const matchesLocation = locationFilter === "all" || item.Location === locationFilter;
      const matchesSymptom = symptomFilter === "all" || item.Symptom === symptomFilter;
      const matchesSource = sourceFilter === "all" || item["Source Name"] === sourceFilter;
      const matchesOperationType = operationTypeFilter === "all" || item["Service Operation Type"] === operationTypeFilter;
      
      // Then apply the search
      let itemValue = String(item[fieldToSearch] || "").toLowerCase();
      const matchesSearch = itemValue.includes(searchTerm);
      
      return matchesLocation && matchesSymptom && matchesSource && 
             matchesOperationType && matchesSearch;
    });
    
    onSearch(filteredResults);
  };

  const applyFilters = () => {
    const filteredResults = data.filter(item => {
      const matchesLocation = locationFilter === "all" || item.Location === locationFilter;
      const matchesSymptom = symptomFilter === "all" || item.Symptom === symptomFilter;
      const matchesSource = sourceFilter === "all" || item["Source Name"] === sourceFilter;
      const matchesOperationType = operationTypeFilter === "all" || item["Service Operation Type"] === operationTypeFilter;
      
      let matchesSearch = true;
      if (searchValue) {
        let fieldToSearch;
        switch (searchField) {
          case "cid":
            fieldToSearch = "CID";
            break;
          case "aid":
            fieldToSearch = "AID";
            break;
          case "name":
            fieldToSearch = "Customer Name";
            break;
          case "phone":
            fieldToSearch = "Phone";
            break;
          default:
            fieldToSearch = "Phone";
        }
        
        let itemValue = String(item[fieldToSearch] || "").toLowerCase();
        matchesSearch = itemValue.includes(searchValue.toLowerCase());
      }
      
      return matchesLocation && matchesSymptom && matchesSource && 
             matchesOperationType && matchesSearch;
    });
    
    onSearch(filteredResults);
  };

  const resetFilters = () => {
    setSearchValue("");
    setLocationFilter("all");
    setSymptomFilter("all");
    setSourceFilter("all");
    setOperationTypeFilter("all");
    onSearch(data);
  };

  return (
    <div className="space-y-6">
      {/* Search Section */}
      <div className="space-y-4">
        <div className="space-y-2">
          <Label>Search By</Label>
          <Tabs 
            defaultValue="phone" 
            value={searchField}
            onValueChange={setSearchField}
            className="w-full"
          >
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="phone">Phone</TabsTrigger>
              <TabsTrigger value="name">Name</TabsTrigger>
              <TabsTrigger value="cid">CID</TabsTrigger>
              <TabsTrigger value="aid">AID</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
        
        <div className="flex space-x-2">
          <Input
            placeholder={`Search by ${searchField}...`}
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            className="flex-1"
          />
          <Button onClick={handleSearch}>Search</Button>
        </div>
      </div>
      
      {/* Filters Section */}
      <div className="space-y-4">
        <h3 className="font-medium">Filters</h3>
        
        <div className="space-y-2">
          <Label htmlFor="location-filter">Location</Label>
          <Select
            value={locationFilter}
            onValueChange={setLocationFilter}
          >
            <SelectTrigger id="location-filter">
              <SelectValue placeholder="Select location" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Locations</SelectItem>
              {locations.map((location) => (
                <SelectItem key={location} value={location}>
                  {location}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="symptom-filter">Symptom</Label>
          <Select
            value={symptomFilter}
            onValueChange={setSymptomFilter}
          >
            <SelectTrigger id="symptom-filter">
              <SelectValue placeholder="Select symptom" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Symptoms</SelectItem>
              {symptoms.map((symptom) => (
                <SelectItem key={symptom} value={symptom}>
                  {symptom}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="source-filter">Source</Label>
          <Select
            value={sourceFilter}
            onValueChange={setSourceFilter}
          >
            <SelectTrigger id="source-filter">
              <SelectValue placeholder="Select source" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Sources</SelectItem>
              {sources.map((source) => (
                <SelectItem key={source} value={source}>
                  {source}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="operation-filter">Service Type</Label>
          <Select
            value={operationTypeFilter}
            onValueChange={setOperationTypeFilter}
          >
            <SelectTrigger id="operation-filter">
              <SelectValue placeholder="Select service type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Service Types</SelectItem>
              {operationTypes.map((type) => (
                <SelectItem key={type} value={type}>
                  {type}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <Button 
          variant="outline" 
          onClick={resetFilters}
          className="w-full mt-4"
        >
          Reset Filters
        </Button>
      </div>
    </div>
  );
};

export default SearchFilter;
