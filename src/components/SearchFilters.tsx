import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Card, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";

interface SearchFiltersProps {
  onFilterChange: (filters: any) => void;
}

const SearchFilters = ({ onFilterChange }: SearchFiltersProps) => {
  const [maxPrice, setMaxPrice] = useState([100000]);
  const [propertyType, setPropertyType] = useState("all");
  const [rooms, setRooms] = useState("all");
  const [furnished, setFurnished] = useState(false);
  const [location, setLocation] = useState("");

  const handleFilterChange = () => {
    onFilterChange({
      maxPrice: maxPrice[0],
      propertyType: propertyType === "all" ? null : propertyType,
      rooms: rooms === "all" ? null : parseInt(rooms),
      furnished,
      location: location.trim() || null,
    });
  };

  return (
    <Card>
      <CardContent className="pt-6 space-y-6">
        <div className="space-y-2">
          <Label>Location / Neighborhood</Label>
          <Input
            placeholder="e.g., Westlands, Kilimani..."
            value={location}
            onChange={(e) => {
              setLocation(e.target.value);
              handleFilterChange();
            }}
          />
        </div>

        <div className="space-y-2">
          <Label>Property Type</Label>
          <Select value={propertyType} onValueChange={(value) => {
            setPropertyType(value);
            handleFilterChange();
          }}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="studio">Studio</SelectItem>
              <SelectItem value="one_bedroom">1 Bedroom</SelectItem>
              <SelectItem value="two_bedroom">2 Bedrooms</SelectItem>
              <SelectItem value="three_bedroom_plus">3+ Bedrooms</SelectItem>
              <SelectItem value="bedsitter">Bedsitter</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Number of Rooms</Label>
          <Select value={rooms} onValueChange={(value) => {
            setRooms(value);
            handleFilterChange();
          }}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Any</SelectItem>
              <SelectItem value="1">1 Room</SelectItem>
              <SelectItem value="2">2 Rooms</SelectItem>
              <SelectItem value="3">3 Rooms</SelectItem>
              <SelectItem value="4">4+ Rooms</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-3">
          <Label>Max Price: KSh {maxPrice[0].toLocaleString()}/month</Label>
          <Slider
            value={maxPrice}
            onValueChange={(value) => {
              setMaxPrice(value);
              handleFilterChange();
            }}
            max={200000}
            min={5000}
            step={5000}
            className="w-full"
          />
        </div>

        <div className="flex items-center justify-between">
          <Label htmlFor="furnished">Furnished Only</Label>
          <Switch
            id="furnished"
            checked={furnished}
            onCheckedChange={(checked) => {
              setFurnished(checked);
              handleFilterChange();
            }}
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default SearchFilters;
