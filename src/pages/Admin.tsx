import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";

const Admin = () => {
  const [isSeeding, setIsSeeding] = useState(false);
  const { toast } = useToast();

  const handleSeedProperties = async () => {
    setIsSeeding(true);
    try {
      const { data, error } = await supabase.functions.invoke("seed-properties");
      
      if (error) throw error;

      toast({
        title: "Success!",
        description: "20 properties with AI-generated images have been created.",
      });
    } catch (error) {
      console.error("Seeding error:", error);
      toast({
        title: "Error",
        description: "Failed to seed properties. Check console for details.",
        variant: "destructive",
      });
    } finally {
      setIsSeeding(false);
    }
  };

  return (
    <div className="container mx-auto py-8">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Admin Panel</CardTitle>
          <CardDescription>
            Initialize the database with sample properties
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <h3 className="font-semibold">Seed Properties</h3>
            <p className="text-sm text-muted-foreground">
              This will create 20 rental properties with AI-generated images across various Nairobi neighborhoods.
              Each property will include realistic pricing, amenities, and professional property photos.
            </p>
          </div>
          <Button 
            onClick={handleSeedProperties} 
            disabled={isSeeding}
            className="w-full"
          >
            {isSeeding && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isSeeding ? "Generating Properties..." : "Seed 20 Properties"}
          </Button>
          <p className="text-xs text-muted-foreground">
            Note: This process may take 2-3 minutes as it generates unique AI images for each property.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default Admin;
