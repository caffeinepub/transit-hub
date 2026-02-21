import { useNavigate } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { XCircle } from 'lucide-react';

export default function PaymentFailurePage() {
  const navigate = useNavigate();

  return (
    <div className="container py-16">
      <Card className="max-w-2xl mx-auto text-center">
        <CardContent className="pt-12 pb-12">
          <div className="flex justify-center mb-4">
            <XCircle className="h-16 w-16 text-destructive" />
          </div>
          <h1 className="text-3xl font-bold mb-4">Payment Failed</h1>
          <p className="text-muted-foreground mb-8">
            Your payment could not be processed. Please try again or contact support.
          </p>
          <div className="flex gap-4 justify-center">
            <Button onClick={() => navigate({ to: '/search' })}>Try Again</Button>
            <Button variant="outline" onClick={() => navigate({ to: '/' })}>
              Back to Home
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
