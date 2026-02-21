import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface PassengerDetailsFormProps {
  details: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
  };
  setDetails: (details: any) => void;
  onSubmit: (e: React.FormEvent) => void;
  isLoading: boolean;
}

export default function PassengerDetailsForm({ details, setDetails, onSubmit, isLoading }: PassengerDetailsFormProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Passenger Details</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName">First Name *</Label>
              <Input
                id="firstName"
                value={details.firstName}
                onChange={(e) => setDetails({ ...details, firstName: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">Last Name *</Label>
              <Input
                id="lastName"
                value={details.lastName}
                onChange={(e) => setDetails({ ...details, lastName: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email *</Label>
            <Input
              id="email"
              type="email"
              value={details.email}
              onChange={(e) => setDetails({ ...details, email: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Phone Number *</Label>
            <Input
              id="phone"
              type="tel"
              value={details.phone}
              onChange={(e) => setDetails({ ...details, phone: e.target.value })}
              required
            />
          </div>

          <Button type="submit" className="w-full" size="lg" disabled={isLoading}>
            {isLoading ? 'Processing...' : 'Proceed to Payment'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
