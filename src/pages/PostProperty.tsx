import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { Loader2, Upload } from "lucide-react";

const PostProperty = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [deposit, setDeposit] = useState("");
  const [location, setLocation] = useState("");
  const [neighborhood, setNeighborhood] = useState("");
  const [propertyType, setPropertyType] = useState("one_bedroom");
  const [rooms, setRooms] = useState("1");
  const [isFurnished, setIsFurnished] = useState(false);
  const [utilitiesIncluded, setUtilitiesIncluded] = useState(false);
  const [availableFrom, setAvailableFrom] = useState("");
  const [amenities, setAmenities] = useState("");
  const [images, setImages] = useState<File[]>([]);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        navigate("/auth?mode=signup&role=caretaker");
        return;
      }
      
      setUser(session.user);
      fetchUserRole(session.user.id);
    });
  }, [navigate]);

  const fetchUserRole = async (userId: string) => {
    const { data } = await supabase
      .from("profiles")
      .select("user_role")
      .eq("id", userId)
      .single();
    
    if (data) {
      setUserRole(data.user_role);
      if (data.user_role !== "caretaker") {
        toast.error("Only caretakers can post properties");
        navigate("/listings");
      }
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setImages(Array.from(e.target.files));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast.error("Please sign in first");
      return;
    }

    setLoading(true);

    try {
      // Create property
      const { data: property, error: propertyError } = await supabase
        .from("properties")
        .insert([{
          caretaker_id: user.id,
          title,
          description,
          price: parseFloat(price),
          deposit: deposit ? parseFloat(deposit) : null,
          location,
          neighborhood: neighborhood || null,
          property_type: propertyType as any,
          rooms: parseInt(rooms),
          amenities: amenities ? amenities.split(",").map(a => a.trim()) : [],
          is_furnished: isFurnished,
          utilities_included: utilitiesIncluded,
          available_from: availableFrom || null,
          status: "available",
        }])
        .select()
        .single();

      if (propertyError) throw propertyError;

      // Upload images
      if (images.length > 0 && property) {
        const imageUploads = images.map(async (image, index) => {
          const fileExt = image.name.split(".").pop();
          const fileName = `${user.id}/${property.id}/${Date.now()}-${index}.${fileExt}`;
          
          const { error: uploadError, data } = await supabase.storage
            .from("property-images")
            .upload(fileName, image);

          if (uploadError) throw uploadError;

          const { data: { publicUrl } } = supabase.storage
            .from("property-images")
            .getPublicUrl(fileName);

          return supabase
            .from("property_images")
            .insert({
              property_id: property.id,
              image_url: publicUrl,
              display_order: index,
            });
        });

        await Promise.all(imageUploads);
      }

      toast.success("Property posted successfully!");
      navigate(`/property/${property.id}`);
    } catch (error: any) {
      console.error("Error posting property:", error);
      toast.error(error.message || "Failed to post property");
    } finally {
      setLoading(false);
    }
  };

  if (!user || userRole !== "caretaker") {
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
      
      <div className="container mx-auto px-4 py-8 max-w-3xl">
        <Card>
          <CardHeader>
            <CardTitle className="text-3xl">Post a Property</CardTitle>
            <CardDescription>
              List your property to connect with potential tenants
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="title">Property Title *</Label>
                <Input
                  id="title"
                  placeholder="e.g., Modern 2-Bedroom Apartment in Westlands"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  placeholder="Describe your property..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={5}
                  required
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="price">Monthly Rent (KSh) *</Label>
                  <Input
                    id="price"
                    type="number"
                    placeholder="25000"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="deposit">Deposit (KSh)</Label>
                  <Input
                    id="deposit"
                    type="number"
                    placeholder="50000"
                    value={deposit}
                    onChange={(e) => setDeposit(e.target.value)}
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="location">Location/Area *</Label>
                  <Input
                    id="location"
                    placeholder="e.g., Nairobi"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="neighborhood">Neighborhood</Label>
                  <Input
                    id="neighborhood"
                    placeholder="e.g., Westlands, Kilimani"
                    value={neighborhood}
                    onChange={(e) => setNeighborhood(e.target.value)}
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="propertyType">Property Type *</Label>
                  <Select value={propertyType} onValueChange={setPropertyType}>
                    <SelectTrigger id="propertyType">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="studio">Studio</SelectItem>
                      <SelectItem value="one_bedroom">1 Bedroom</SelectItem>
                      <SelectItem value="two_bedroom">2 Bedrooms</SelectItem>
                      <SelectItem value="three_bedroom_plus">3+ Bedrooms</SelectItem>
                      <SelectItem value="bedsitter">Bedsitter</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="rooms">Number of Rooms *</Label>
                  <Input
                    id="rooms"
                    type="number"
                    min="1"
                    value={rooms}
                    onChange={(e) => setRooms(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="amenities">Amenities (comma-separated)</Label>
                <Input
                  id="amenities"
                  placeholder="WiFi, Parking, Security, Water 24/7"
                  value={amenities}
                  onChange={(e) => setAmenities(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="availableFrom">Available From</Label>
                <Input
                  id="availableFrom"
                  type="date"
                  value={availableFrom}
                  onChange={(e) => setAvailableFrom(e.target.value)}
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="furnished">Furnished</Label>
                <Switch
                  id="furnished"
                  checked={isFurnished}
                  onCheckedChange={setIsFurnished}
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="utilities">Utilities Included</Label>
                <Switch
                  id="utilities"
                  checked={utilitiesIncluded}
                  onCheckedChange={setUtilitiesIncluded}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="images">Property Images</Label>
                <div className="border-2 border-dashed border-border rounded-lg p-6 text-center">
                  <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <Input
                    id="images"
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleImageChange}
                    className="hidden"
                  />
                  <Label
                    htmlFor="images"
                    className="cursor-pointer text-primary hover:underline"
                  >
                    Click to upload images
                  </Label>
                  <p className="text-sm text-muted-foreground mt-2">
                    Upload up to 10 images
                  </p>
                  {images.length > 0 && (
                    <p className="text-sm text-primary mt-2">
                      {images.length} image{images.length > 1 ? "s" : ""} selected
                    </p>
                  )}
                </div>
              </div>

              <Button type="submit" size="lg" className="w-full" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Posting...
                  </>
                ) : (
                  "Post Property"
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PostProperty;
