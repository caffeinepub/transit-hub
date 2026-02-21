import { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { Calendar } from '@/components/ui/calendar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Card, CardContent } from '@/components/ui/card';
import { CalendarIcon, Search, MapPin, Users } from 'lucide-react';
import { format } from 'date-fns';

export default function SearchPage() {
  const navigate = useNavigate();
  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');
  const [date, setDate] = useState<Date>();
  const [passengers, setPassengers] = useState('1');
  const [transportMode, setTransportMode] = useState('all');

  const handleSearch = () => {
    if (!origin || !destination || !date) {
      return;
    }

    navigate({
      to: '/results',
      search: {
        origin,
        destination,
        date: date.toISOString(),
        passengers,
        mode: transportMode,
      },
    });
  };

  return (
    <div className="min-h-[calc(100vh-8rem)]">
      <div
        className="relative h-[400px] bg-cover bg-center"
        style={{ backgroundImage: 'url(/assets/generated/hero-banner.dim_1920x600.png)' }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 to-black/40" />
        <div className="relative container h-full flex flex-col justify-center items-center text-center text-white">
          <h1 className="text-4xl md:text-6xl font-bold mb-4">Your Journey Starts Here</h1>
          <p className="text-lg md:text-xl text-white/90 max-w-2xl">
            Book trains, buses, and taxis across India. Fast, easy, and reliable.
          </p>
        </div>
      </div>

      <div className="container -mt-20 pb-16 relative z-10">
        <Card className="shadow-2xl">
          <CardContent className="p-6 md:p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              <div className="space-y-2">
                <Label htmlFor="origin" className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-primary" />
                  From
                </Label>
                <Input
                  id="origin"
                  placeholder="Enter origin city"
                  value={origin}
                  onChange={(e) => setOrigin(e.target.value)}
                  className="h-12"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="destination" className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-primary" />
                  To
                </Label>
                <Input
                  id="destination"
                  placeholder="Enter destination city"
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  className="h-12"
                />
              </div>

              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <CalendarIcon className="h-4 w-4 text-primary" />
                  Date
                </Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full h-12 justify-start text-left font-normal">
                      {date ? format(date, 'PPP') : <span className="text-muted-foreground">Pick a date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar mode="single" selected={date} onSelect={setDate} initialFocus disabled={(date) => date < new Date()} />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-2">
                <Label htmlFor="passengers" className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-primary" />
                  Passengers
                </Label>
                <Select value={passengers} onValueChange={setPassengers}>
                  <SelectTrigger id="passengers" className="h-12">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[1, 2, 3, 4, 5, 6].map((num) => (
                      <SelectItem key={num} value={num.toString()}>
                        {num} {num === 1 ? 'Passenger' : 'Passengers'}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="mode">Transport Mode</Label>
                <Select value={transportMode} onValueChange={setTransportMode}>
                  <SelectTrigger id="mode" className="h-12">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Modes</SelectItem>
                    <SelectItem value="train">Train</SelectItem>
                    <SelectItem value="bus">Bus</SelectItem>
                    <SelectItem value="taxi">Taxi</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Button
              onClick={handleSearch}
              disabled={!origin || !destination || !date}
              className="w-full mt-6 h-12 text-lg"
              size="lg"
            >
              <Search className="mr-2 h-5 w-5" />
              Search Routes
            </Button>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
          <Card className="text-center p-6 hover:shadow-lg transition-shadow">
            <img src="/assets/generated/train-icon.dim_128x128.png" alt="Train" className="h-20 w-20 mx-auto mb-4" />
            <h3 className="font-semibold text-lg mb-2">Trains</h3>
            <p className="text-sm text-muted-foreground">Fast and comfortable rail journeys across India</p>
          </Card>
          <Card className="text-center p-6 hover:shadow-lg transition-shadow">
            <img src="/assets/generated/bus-icon.dim_128x128.png" alt="Bus" className="h-20 w-20 mx-auto mb-4" />
            <h3 className="font-semibold text-lg mb-2">Buses</h3>
            <p className="text-sm text-muted-foreground">Affordable travel to every destination</p>
          </Card>
          <Card className="text-center p-6 hover:shadow-lg transition-shadow">
            <img src="/assets/generated/taxi-icon.dim_128x128.png" alt="Taxi" className="h-20 w-20 mx-auto mb-4" />
            <h3 className="font-semibold text-lg mb-2">Taxis</h3>
            <p className="text-sm text-muted-foreground">Door-to-door convenience</p>
          </Card>
        </div>
      </div>
    </div>
  );
}
