import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import PropertyCard from "@/components/PropertyCard";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Heart, Home } from "lucide-react";

const Dashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [savedProperties, setSavedProperties] = useState<any[]>([]);
  const [myProperties, setMyProperties] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        navigate("/auth");
        return;
      }
      
      setUser(session.user);
      fetchUserData(session.user.id);
    });
  }, [navigate]);

  const fetchUserData = async (userId: string) => {
    const { data: profile } = await supabase
      .from("profiles")
      .select("user_role")
      .eq("id", userId)
      .single();
    
    if (profile) {
      setUserRole(profile.user_role);
      
      // Fetch saved properties for tenants
      if (profile.user_role === "tenant") {
        const { data: saved } = await supabase
          .from("saved_properties")
          .select(`
            property_id,
            properties (
              *,
              property_images (image_url)
            )
          `)
          .eq("user_id", userId);
        
        if (saved) {
          setSavedProperties(saved.map((s: any) => s.properties));
        }
      }
      
      // Fetch own properties for caretakers
      if (profile.user_role === "caretaker") {
        const { data: properties } = await supabase
          .from("properties")
          .select(`
            *,
            property_images (image_url)
          `)
          .eq("caretaker_id", userId)
          .order("created_at", { ascending: false });
        
        if (properties) {
          setMyProperties(properties);
        }
      }
    }
    
    setLoading(false);
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

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold mb-8">My Dashboard</h1>

        <Tabs defaultValue={userRole === "tenant" ? "saved" : "properties"} className="space-y-6">
          <TabsList>
            {userRole === "tenant" && (
              <TabsTrigger value="saved">
                <Heart className="mr-2 h-4 w-4" />
                Saved Properties
              </TabsTrigger>
            )}
            {userRole === "caretaker" && (
              <TabsTrigger value="properties">
                <Home className="mr-2 h-4 w-4" />
                My Properties
              </TabsTrigger>
            )}
          </TabsList>

          {userRole === "tenant" && (
            <TabsContent value="saved" className="space-y-6">
              {savedProperties.length === 0 ? (
                <Card>
                  <CardHeader>
                    <CardTitle>No Saved Properties</CardTitle>
                    <CardDescription>
                      Start browsing and save properties you're interested in
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button onClick={() => navigate("/listings")}>
                      Browse Properties
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {savedProperties.map((property) => (
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
            </TabsContent>
          )}

          {userRole === "caretaker" && (
            <TabsContent value="properties" className="space-y-6">
              {myProperties.length === 0 ? (
                <Card>
                  <CardHeader>
                    <CardTitle>No Properties Listed</CardTitle>
                    <CardDescription>
                      Start listing your properties to connect with tenants
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button onClick={() => navigate("/post-property")}>
                      Post a Property
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {myProperties.map((property) => (
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
            </TabsContent>
          )}
        </Tabs>
      </div>
    </div>
  );
};

export default Dashboard;
