import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, Package } from "lucide-react";
import { format } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Switch } from "@/components/ui/switch";

interface BookMoverDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mover: {
    id: string;
    business_name: string;
    mover_services?: Array<{
      van_size: string;
      hourly_rate: number;
      fixed_rate: number | null;
    }>;
  };
}

const BookMoverDialog = ({ open, onOpenChange, mover }: BookMoverDialogProps) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [moveDate, setMoveDate] = useState<Date>();
  const [pickupLocation, setPickupLocation] = useState("");
  const [dropoffLocation, setDropoffLocation] = useState("");
  const [notes, setNotes] = useState("");
  const [packingHelp, setPackingHelp] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      toast.error("Please sign in to book a mover");
      navigate("/auth");
      return;
    }

    if (!moveDate || !pickupLocation || !dropoffLocation) {
      toast.error("Please fill in all required fields");
      return;
    }

    setLoading(true);

    const selectedService = mover.mover_services?.[0];
    const estimatedCost = selectedService?.fixed_rate || selectedService?.hourly_rate || 0;

    const { error } = await supabase.from("move_requests").insert({
      tenant_id: user.id,
      mover_id: mover.id,
      move_date: format(moveDate, "yyyy-MM-dd"),
      pickup_location: pickupLocation,
      dropoff_location: dropoffLocation,
      van_size: selectedService?.van_size || "pickup",
      notes,
      packing_help: packingHelp,
      estimated_cost: estimatedCost,
      status: "pending"
    });

    setLoading(false);

    if (error) {
      toast.error("Failed to submit booking request");
      console.error(error);
    } else {
      toast.success("Booking request submitted! The mover will contact you soon.");
      onOpenChange(false);
      setPickupLocation("");
      setDropoffLocation("");
      setNotes("");
      setPackingHelp(false);
      setMoveDate(undefined);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Book {mover.business_name}</DialogTitle>
          <DialogDescription>
            Fill in the details below to request a moving quote
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="moveDate">Move Date *</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-start text-left font-normal"
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {moveDate ? format(moveDate, "PPP") : "Pick a date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={moveDate}
                  onSelect={setMoveDate}
                  disabled={(date) => date < new Date()}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="space-y-2">
            <Label htmlFor="pickup">Pickup Location *</Label>
            <Input
              id="pickup"
              value={pickupLocation}
              onChange={(e) => setPickupLocation(e.target.value)}
              placeholder="Enter pickup address"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="dropoff">Drop-off Location *</Label>
            <Input
              id="dropoff"
              value={dropoffLocation}
              onChange={(e) => setDropoffLocation(e.target.value)}
              placeholder="Enter drop-off address"
              required
            />
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="packing"
              checked={packingHelp}
              onCheckedChange={setPackingHelp}
            />
            <Label htmlFor="packing" className="cursor-pointer">
              Need packing help
            </Label>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Additional Notes</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Any special requirements or items to move..."
              rows={3}
            />
          </div>

          {mover.mover_services?.[0] && (
            <div className="p-3 bg-muted rounded-lg">
              <div className="flex items-center gap-2 text-sm mb-1">
                <Package className="h-4 w-4" />
                <span className="font-medium">Estimated Cost</span>
              </div>
              <p className="text-lg font-bold text-primary">
                KSh {mover.mover_services[0].fixed_rate?.toLocaleString() || 
                     `${mover.mover_services[0].hourly_rate.toLocaleString()}/hr`}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Final price may vary based on distance and items
              </p>
            </div>
          )}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Submitting..." : "Request Booking"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default BookMoverDialog;
