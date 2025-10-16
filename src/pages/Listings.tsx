import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import PropertyCard from "@/components/PropertyCard";
import SearchFilters from "@/components/SearchFilters";
import { Loader2 } from "lucide-react";

const Listings = () => {
  const [properties, setProperties] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<any>({});

  useEffect(() => {
    fetchProperties();
  }, [filters]);

  const fetchProperties = async () => {
    setLoading(true);
    let query = supabase
      .from("properties")
      .select(`
        *,
        property_images(image_url)
      `)
      .eq("status", "available")
      .order("created_at", { ascending: false });

    if (filters.maxPrice) {
      query = query.lte("price", filters.maxPrice);
    }
    
    if (filters.propertyType) {
      query = query.eq("property_type", filters.propertyType);
    }
    
    if (filters.rooms) {
      query = query.eq("rooms", filters.rooms);
    }
    
    if (filters.furnished) {
      query = query.eq("is_furnished", true);
    }
    
    if (filters.location) {
      query = query.or(`location.ilike.%${filters.location}%,neighborhood.ilike.%${filters.location}%`);
    }

    const { data, error } = await query;

    if (error) {
      console.error("Error fetching properties:", error);
    } else {
      setProperties(data || []);
    }
    
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Available Properties</h1>
          <p className="text-muted-foreground">Find your perfect home in Nairobi</p>
        </div>

        <div className="grid lg:grid-cols-4 gap-8">
          <aside className="lg:col-span-1">
            <div className="sticky top-20">
              <SearchFilters onFilterChange={setFilters} />
            </div>
          </aside>

          <main className="lg:col-span-3">
            {loading ? (
              <div className="flex items-center justify-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : properties.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-xl text-muted-foreground">No properties found matching your criteria</p>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
                {properties.map((property) => (
                  <PropertyCard
                    key={property.id}
                    id={property.id}
                    title={property.title}
                    price={property.price}
                    location={property.location}
                    neighborhood={property.neighborhood}
                    propertyType={property.property_type}
                    rooms={property.rooms}
                    imageUrl={property.property_images?.[0]?.image_url}
                    isFurnished={property.is_furnished}
                  />
                ))}
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
};

export default Listings;
