import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface SeatMapProps {
  transportType: string;
  selectedSeats: string[];
  setSelectedSeats: (seats: string[]) => void;
}

export default function SeatMap({ transportType, selectedSeats, setSelectedSeats }: SeatMapProps) {
  const rows = transportType === 'train' ? 12 : 10;
  const seatsPerRow = 4;

  const occupiedSeats = ['1A', '2B', '3C', '5D', '7A', '8B'];

  const handleSeatClick = (seatId: string) => {
    if (occupiedSeats.includes(seatId)) return;

    if (selectedSeats.includes(seatId)) {
      setSelectedSeats(selectedSeats.filter((s) => s !== seatId));
    } else {
      setSelectedSeats([...selectedSeats, seatId]);
    }
  };

  const getSeatStatus = (seatId: string) => {
    if (occupiedSeats.includes(seatId)) return 'occupied';
    if (selectedSeats.includes(seatId)) return 'selected';
    return 'available';
  };

  const getSeatClass = (status: string) => {
    switch (status) {
      case 'occupied':
        return 'bg-muted text-muted-foreground cursor-not-allowed';
      case 'selected':
        return 'bg-primary text-primary-foreground hover:bg-primary/90';
      default:
        return 'bg-background border-2 border-border hover:border-primary hover:bg-accent cursor-pointer';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Select Your Seats</CardTitle>
        <div className="flex gap-4 text-sm mt-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-background border-2 border-border rounded" />
            <span>Available</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-primary rounded" />
            <span>Selected</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-muted rounded" />
            <span>Occupied</span>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="bg-muted/30 p-6 rounded-lg">
          <div className="text-center mb-6">
            <Badge variant="outline" className="text-sm">Front / Driver</Badge>
          </div>
          <div className="space-y-3">
            {Array.from({ length: rows }, (_, rowIndex) => (
              <div key={rowIndex} className="flex justify-center gap-2">
                {Array.from({ length: seatsPerRow }, (_, colIndex) => {
                  const seatId = `${rowIndex + 1}${String.fromCharCode(65 + colIndex)}`;
                  const status = getSeatStatus(seatId);
                  
                  return (
                    <>
                      <button
                        key={seatId}
                        onClick={() => handleSeatClick(seatId)}
                        disabled={status === 'occupied'}
                        className={cn(
                          'w-12 h-12 rounded-lg font-medium text-sm transition-all',
                          getSeatClass(status)
                        )}
                      >
                        {seatId}
                      </button>
                      {colIndex === 1 && <div key={`spacer-${rowIndex}`} className="w-12" />}
                    </>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
