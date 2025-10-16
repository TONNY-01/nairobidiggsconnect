import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { MapPin, Bed, Home, Calendar, Check, Phone, Mail, ArrowLeft } from "lucide-react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

const PropertyDetail = () => {
  const { id } = useParams();
  const [property, setProperty] = useState<any>(null);
  const [caretaker, setCaretaker] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      fetchProperty();
    }
  }, [id]);

  const fetchProperty = async () => {
    const { data: propertyData, error: propertyError } = await supabase
      .from("properties")
      .select(`
        *,
        property_images(*)
      `)
      .eq("id", id)
      .single();

    if (propertyError) {
      console.error("Error fetching property:", propertyError);
      toast.error("Property not found");
      setLoading(false);
      return;
    }

    setProperty(propertyData);

    const { data: caretakerData } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", propertyData.caretaker_id)
      .single();

    if (caretakerData) {
      setCaretaker(caretakerData);
    }

    setLoading(false);
  };

  const formatPropertyType = (type: string) => {
    return type.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());
  };

  if (loading) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <div className="flex items-center justify-center h-[60vh]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <div className="container mx-auto px-4 py-12 text-center">
          <h1 className="text-2xl font-bold mb-4">Property Not Found</h1>
          <Button asChild>
            <Link to="/listings">Browse Properties</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        <Button variant="ghost" asChild className="mb-6">
          <Link to="/listings">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Listings
          </Link>
        </Button>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            {/* Image Gallery */}
            <div className="grid gap-4">
              {property.property_images && property.property_images.length > 0 ? (
                <>
                  <div className="relative h-96 rounded-lg overflow-hidden">
                    <img
                      src={property.property_images[0].image_url}
                      alt={property.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  {property.property_images.length > 1 && (
                    <div className="grid grid-cols-3 gap-4">
                      {property.property_images.slice(1, 4).map((img: any, index: number) => (
                        <div key={index} className="relative h-32 rounded-lg overflow-hidden">
                          <img
                            src={img.image_url}
                            alt={`${property.title} ${index + 2}`}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ))}
                    </div>
                  )}
                </>
              ) : (
                <div className="h-96 bg-gradient-to-br from-primary/10 to-accent/10 rounded-lg flex items-center justify-center">
                  <Home className="h-24 w-24 text-muted-foreground" />
                </div>
              )}
            </div>

            {/* Property Details */}
            <Card>
              <CardContent className="pt-6">
                <h1 className="text-3xl font-bold mb-4">{property.title}</h1>
                
                <div className="flex items-center text-muted-foreground mb-6">
                  <MapPin className="h-5 w-5 mr-2" />
                  <span className="text-lg">
                    {property.neighborhood && `${property.neighborhood}, `}{property.location}
                  </span>
                </div>

                <div className="flex items-center gap-3 mb-6">
                  <Badge variant="secondary" className="text-base px-4 py-2">
                    <Bed className="h-4 w-4 mr-2" />
                    {property.rooms} Room{property.rooms > 1 ? "s" : ""}
                  </Badge>
                  <Badge variant="outline" className="text-base px-4 py-2">
                    {formatPropertyType(property.property_type)}
                  </Badge>
                  {property.is_furnished && (
                    <Badge className="text-base px-4 py-2">Furnished</Badge>
                  )}
                </div>

                <div className="text-4xl font-bold text-primary mb-6">
                  KSh {property.price.toLocaleString()}
                  <span className="text-lg text-muted-foreground font-normal">/month</span>
                </div>

                <div className="prose max-w-none">
                  <h3 className="text-xl font-semibold mb-3">Description</h3>
                  <p className="text-muted-foreground whitespace-pre-line">
                    {property.description}
                  </p>
                </div>

                {property.amenities && property.amenities.length > 0 && (
                  <div className="mt-6">
                    <h3 className="text-xl font-semibold mb-3">Amenities</h3>
                    <div className="grid grid-cols-2 gap-2">
                      {property.amenities.map((amenity: string, index: number) => (
                        <div key={index} className="flex items-center gap-2">
                          <Check className="h-4 w-4 text-primary" />
                          <span>{amenity}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {property.available_from && (
                  <div className="mt-6 flex items-center gap-2 text-muted-foreground">
                    <Calendar className="h-5 w-5" />
                    <span>
                      Available from {new Date(property.available_from).toLocaleDateString()}
                    </span>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Contact Card */}
          <div className="lg:col-span-1">
            <Card className="sticky top-20">
              <CardContent className="pt-6">
                <h3 className="text-xl font-semibold mb-4">Contact Property Manager</h3>
                
                {caretaker && (
                  <div className="space-y-4">
                    <div>
                      <p className="font-semibold text-lg">{caretaker.full_name}</p>
                      <p className="text-sm text-muted-foreground">Property Caretaker</p>
                    </div>

                    {caretaker.phone && (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Phone className="h-4 w-4" />
                        <span>{caretaker.phone}</span>
                      </div>
                    )}

                    <div className="pt-4 space-y-3">
                      <Button className="w-full" size="lg">
                        <Phone className="mr-2 h-4 w-4" />
                        Call Now
                      </Button>
                      <Button className="w-full" variant="outline" size="lg">
                        <Mail className="mr-2 h-4 w-4" />
                        Send Message
                      </Button>
                    </div>

                    <div className="pt-4 border-t text-sm text-muted-foreground">
                      <p>Response time: Usually within 24 hours</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PropertyDetail;
