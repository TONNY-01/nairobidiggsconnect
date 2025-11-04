import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, Bed, Heart } from "lucide-react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import house from "@/assets/house.jpeg";
import house1 from "@/assets/house1.jpeg";
import house2 from "@/assets/house2.jpeg";

const fallbackImages = [house, house1, house2];

interface PropertyCardProps {
  id: string;
  title: string;
  price: number;
  location: string;
  neighborhood?: string;
  propertyType: string;
  rooms: number;
  imageUrl?: string;
  isFurnished: boolean;
}

const PropertyCard = ({
  id,
  title,
  price,
  location,
  neighborhood,
  propertyType,
  rooms,
  imageUrl,
  isFurnished,
}: PropertyCardProps) => {
  const [isSaved, setIsSaved] = useState(false);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user);
      if (session?.user) {
        checkIfSaved(session.user.id);
      }
    });
  }, [id]);

  const checkIfSaved = async (userId: string) => {
    const { data } = await supabase
      .from("saved_properties")
      .select()
      .eq("user_id", userId)
      .eq("property_id", id)
      .single();
    
    setIsSaved(!!data);
  };

  const toggleSave = async (e: React.MouseEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast.error("Please sign in to save properties");
      return;
    }

    if (isSaved) {
      await supabase
        .from("saved_properties")
        .delete()
        .eq("user_id", user.id)
        .eq("property_id", id);
      setIsSaved(false);
      toast.success("Property removed from saved");
    } else {
      await supabase
        .from("saved_properties")
        .insert({ user_id: user.id, property_id: id });
      setIsSaved(true);
      toast.success("Property saved!");
    }
  };

  const formatPropertyType = (type: string) => {
    return type.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());
  };

  const getFallbackImage = () => {
    const hash = id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return fallbackImages[hash % fallbackImages.length];
  };

  const displayImage = imageUrl || getFallbackImage();

  return (
    <Link to={`/property/${id}`}>
      <Card className="overflow-hidden hover:shadow-lg transition-all duration-300 group">
        <div className="relative h-48 bg-muted overflow-hidden">
          <img 
            src={displayImage} 
            alt={title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
          <Button
            size="icon"
            variant="secondary"
            className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={toggleSave}
          >
            <Heart className={`h-4 w-4 ${isSaved ? "fill-primary text-primary" : ""}`} />
          </Button>
        </div>
        
        <CardContent className="pt-4">
          <h3 className="font-semibold text-lg mb-2 line-clamp-1">{title}</h3>
          <div className="flex items-center text-muted-foreground text-sm mb-3">
            <MapPin className="h-4 w-4 mr-1" />
            <span className="line-clamp-1">
              {neighborhood ? `${neighborhood}, ` : ""}{location}
            </span>
          </div>
          
          <div className="flex items-center gap-2 mb-3">
            <Badge variant="secondary" className="flex items-center gap-1">
              <Bed className="h-3 w-3" />
              {rooms} Room{rooms > 1 ? "s" : ""}
            </Badge>
            <Badge variant="outline">{formatPropertyType(propertyType)}</Badge>
            {isFurnished && <Badge>Furnished</Badge>}
          </div>
          
          <div className="text-2xl font-bold text-primary">
            KSh {price.toLocaleString()}
            <span className="text-sm text-muted-foreground font-normal">/month</span>
          </div>
        </CardContent>
        
        <CardFooter>
          <Button className="w-full" variant="outline">View Details</Button>
        </CardFooter>
      </Card>
    </Link>
  );
};

export default PropertyCard;
