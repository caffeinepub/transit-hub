import { useNavigate } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { CheckCircle } from 'lucide-react';

export default function PaymentSuccessPage() {
  const navigate = useNavigate();

  return (
    <div className="container py-16">
      <Card className="max-w-2xl mx-auto text-center">
        <CardContent className="pt-12 pb-12">
          <img
            src="/assets/generated/booking-success.dim_400x300.png"
            alt="Success"
            className="mx-auto mb-6 max-w-xs"
          />
          <div className="flex justify-center mb-4">
            <CheckCircle className="h-16 w-16 text-green-500" />
          </div>
          <h1 className="text-3xl font-bold mb-4">Booking Confirmed!</h1>
          <p className="text-muted-foreground mb-8">
            Your payment was successful. You will receive a confirmation email shortly.
          </p>
          <div className="flex gap-4 justify-center">
            <Button onClick={() => navigate({ to: '/bookings' })}>View My Bookings</Button>
            <Button variant="outline" onClick={() => navigate({ to: '/search' })}>
              Book Another Trip
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
