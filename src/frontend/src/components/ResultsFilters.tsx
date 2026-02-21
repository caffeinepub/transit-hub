import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Separator } from '@/components/ui/separator';

interface ResultsFiltersProps {
  priceRange: [number, number];
  setPriceRange: (range: [number, number]) => void;
  selectedTypes: string[];
  setSelectedTypes: (types: string[]) => void;
  minRating: number;
  setMinRating: (rating: number) => void;
}

export default function ResultsFilters({
  priceRange,
  setPriceRange,
  selectedTypes,
  setSelectedTypes,
  minRating,
  setMinRating,
}: ResultsFiltersProps) {
  const handleTypeToggle = (type: string) => {
    setSelectedTypes(
      selectedTypes.includes(type)
        ? selectedTypes.filter((t) => t !== type)
        : [...selectedTypes, type]
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Filters</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-3">
          <Label>Price Range</Label>
          <div className="px-2">
            <Slider
              value={priceRange}
              onValueChange={(value) => setPriceRange(value as [number, number])}
              min={0}
              max={500000}
              step={5000}
              className="w-full"
            />
          </div>
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>₹{(priceRange[0] / 100).toFixed(0)}</span>
            <span>₹{(priceRange[1] / 100).toFixed(0)}</span>
          </div>
        </div>

        <Separator />

        <div className="space-y-3">
          <Label>Transport Type</Label>
          <div className="space-y-2">
            {['train', 'bus', 'taxi'].map((type) => (
              <div key={type} className="flex items-center space-x-2">
                <Checkbox
                  id={type}
                  checked={selectedTypes.includes(type)}
                  onCheckedChange={() => handleTypeToggle(type)}
                />
                <Label htmlFor={type} className="capitalize cursor-pointer">
                  {type}
                </Label>
              </div>
            ))}
          </div>
        </div>

        <Separator />

        <div className="space-y-3">
          <Label>Minimum Rating</Label>
          <div className="px-2">
            <Slider
              value={[minRating]}
              onValueChange={(value) => setMinRating(value[0])}
              min={0}
              max={5}
              step={0.5}
              className="w-full"
            />
          </div>
          <p className="text-sm text-muted-foreground text-center">{minRating.toFixed(1)}+ stars</p>
        </div>
      </CardContent>
    </Card>
  );
}
