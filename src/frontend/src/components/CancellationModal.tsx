import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useUpdateBooking } from '../hooks/useQueries';
import { useNavigate } from '@tanstack/react-router';
import { toast } from 'sonner';
import type { Booking } from '../backend';

interface CancellationModalProps {
  booking: Booking;
  onClose: () => void;
}

export default function CancellationModal({ booking, onClose }: CancellationModalProps) {
  const updateBooking = useUpdateBooking();
  const navigate = useNavigate();

  const handleCancel = async () => {
    try {
      await updateBooking.mutateAsync({
        ...booking,
        status: { cancelled: null } as any,
      });
      toast.success('Booking cancelled successfully');
      onClose();
      navigate({ to: '/bookings' });
    } catch (error) {
      toast.error('Failed to cancel booking');
      console.error(error);
    }
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Cancel Booking</DialogTitle>
          <DialogDescription>
            Are you sure you want to cancel this booking? This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <p className="text-sm text-muted-foreground">
            <strong>Refund Policy:</strong> Cancellations made more than 24 hours before departure are eligible for a full refund.
            Cancellations within 24 hours may incur a cancellation fee.
          </p>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Keep Booking
          </Button>
          <Button variant="destructive" onClick={handleCancel} disabled={updateBooking.isPending}>
            {updateBooking.isPending ? 'Cancelling...' : 'Cancel Booking'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
