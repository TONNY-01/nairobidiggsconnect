import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Star, MapPin, Bike, Truck as TruckIcon, Phone, Mail } from "lucide-react";
import BookMoverDialog from "@/components/BookMoverDialog";

const Movers = () => {
  const [selectedArea, setSelectedArea] = useState<string | null>(null);
  const [vehicleType, setVehicleType] = useState<string | null>(null);
  const [bookingMover, setBookingMover] = useState<any>(null);

  const { data: movers, isLoading } = useQuery({
    queryKey: ["movers", selectedArea, vehicleType],
    queryFn: async () => {
      let query = supabase
        .from("movers")
        .select("*, mover_services(*), mover_reviews(rating)")
        .eq("verification_status", "verified");

      if (selectedArea) {
        query = query.contains("service_areas", [selectedArea]);
      }

      const { data, error } = await query;
      if (error) throw error;
      
      // Filter by vehicle type if selected
      if (vehicleType && data) {
        return data.filter(mover => 
          mover.mover_services?.some((service: any) => service.van_size === vehicleType)
        );
      }
      
      return data;
    },
  });

  const getVehicleIcon = (vanSize: string) => {
    if (vanSize === 'motorbike') return <Bike className="w-4 h-4" />;
    return <TruckIcon className="w-4 h-4" />;
  };

  const neighborhoods = [
    "Westlands", "Kilimani", "Karen", "Kileleshwa", "South B", "South C",
    "Embakasi", "Kasarani", "Kahawa", "Ruaka", "Ngong Road", "Kibera"
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-4">Movers Marketplace</h1>
          <p className="text-muted-foreground">Find trusted, verified movers in Nairobi - Motorbikes, Pickups & Trucks</p>
        </div>

        <Tabs defaultValue="all" className="mb-6" onValueChange={(v) => setVehicleType(v === 'all' ? null : v)}>
          <TabsList className="grid w-full max-w-md grid-cols-4">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="motorbike">
              <Bike className="w-4 h-4 mr-1" />
              Bikes
            </TabsTrigger>
            <TabsTrigger value="pickup">
              <TruckIcon className="w-4 h-4 mr-1" />
              Pickups
            </TabsTrigger>
            <TabsTrigger value="truck">
              <TruckIcon className="w-4 h-4 mr-1" />
              Trucks
            </TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="mb-6 flex flex-wrap gap-2">
          <Button
            variant={selectedArea === null ? "default" : "outline"}
            onClick={() => setSelectedArea(null)}
            size="sm"
          >
            All Areas
          </Button>
          {neighborhoods.map((area) => (
            <Button
              key={area}
              variant={selectedArea === area ? "default" : "outline"}
              onClick={() => setSelectedArea(area)}
              size="sm"
            >
              {area}
            </Button>
          ))}
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader className="h-40 bg-muted" />
                <CardContent className="space-y-4 pt-6">
                  <div className="h-4 bg-muted rounded" />
                  <div className="h-4 bg-muted rounded w-3/4" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {movers?.map((mover) => {
              const avgRating = mover.mover_reviews?.length
                ? mover.mover_reviews.reduce((sum, r) => sum + r.rating, 0) / mover.mover_reviews.length
                : mover.rating;

              return (
                <Card key={mover.id} className="hover:shadow-lg transition-all overflow-hidden">
                  <div className="relative h-40 overflow-hidden">
                    <img 
                      src={mover.avatar_url} 
                      alt={mover.business_name}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-2 right-2">
                      {mover.verification_status === "verified" && (
                        <Badge className="bg-background/90 backdrop-blur">Verified</Badge>
                      )}
                    </div>
                  </div>
                  
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-xl">{mover.business_name}</CardTitle>
                        <div className="flex items-center gap-2 mt-2">
                          <div className="flex items-center gap-1">
                            <Star className="w-4 h-4 fill-primary text-primary" />
                            <span className="font-semibold">{avgRating.toFixed(1)}</span>
                          </div>
                          <span className="text-sm text-muted-foreground">
                            ({mover.total_jobs} jobs)
                          </span>
                        </div>
                      </div>
                    </div>
                    <CardDescription className="mt-3 line-clamp-2">
                      {mover.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm">
                        <MapPin className="w-4 h-4 text-muted-foreground" />
                        <span className="text-muted-foreground line-clamp-1">
                          {mover.service_areas?.slice(0, 3).join(", ")}
                          {mover.service_areas && mover.service_areas.length > 3 && " +more"}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Phone className="w-4 h-4 text-muted-foreground" />
                        <span className="text-muted-foreground">{mover.phone}</span>
                      </div>
                    </div>

                    {mover.mover_services && mover.mover_services.length > 0 && (
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          {getVehicleIcon(mover.mover_services[0].van_size)}
                          <span className="text-sm font-medium capitalize">
                            {mover.mover_services[0].van_size}
                          </span>
                        </div>
                        <div className="p-3 bg-muted rounded-lg">
                          <p className="text-sm text-muted-foreground mb-1">Starting from</p>
                          <p className="text-xl font-bold text-primary">
                            KSh {mover.mover_services[0].hourly_rate.toLocaleString()}/hr
                          </p>
                          {mover.mover_services[0].fixed_rate && (
                            <p className="text-sm text-muted-foreground mt-1">
                              Fixed: KSh {mover.mover_services[0].fixed_rate.toLocaleString()}
                            </p>
                          )}
                        </div>
                      </div>
                    )}

                    <Button 
                      className="w-full" 
                      onClick={() => setBookingMover(mover)}
                    >
                      Book Now
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {!isLoading && movers?.length === 0 && (
          <Card className="p-12 text-center">
            <TruckIcon className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-xl font-semibold mb-2">No movers found</h3>
            <p className="text-muted-foreground">
              {selectedArea
                ? `No verified movers available in ${selectedArea} yet.`
                : "No verified movers available yet."}
            </p>
          </Card>
        )}
      </main>

      <BookMoverDialog 
        open={!!bookingMover} 
        onOpenChange={(open) => !open && setBookingMover(null)}
        mover={bookingMover || { id: '', business_name: '', mover_services: [] }}
      />
    </div>
  );
};

export default Movers;
