import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.75.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY not configured");
    }

    // Create a dummy caretaker profile first
    const dummyCaretakerId = "00000000-0000-0000-0000-000000000001";
    
    const properties = [
      {
        title: "Modern 2BR Apartment in Kilimani",
        description: "Spacious 2-bedroom apartment with modern amenities, located in the heart of Kilimani. Close to shopping centers and restaurants.",
        location: "Kilimani",
        neighborhood: "Kilimani",
        price: 45000,
        deposit: 90000,
        property_type: "apartment",
        rooms: 2,
        is_furnished: true,
        utilities_included: false,
        amenities: ["Parking", "WiFi", "Security", "Backup Generator"],
        image_prompt: "Modern apartment building exterior in Nairobi, Kenya with balconies and green landscaping"
      },
      {
        title: "Cozy Bedsitter in Westlands",
        description: "Affordable bedsitter perfect for young professionals. Walking distance to Westlands amenities.",
        location: "Westlands",
        neighborhood: "Westlands",
        price: 18000,
        deposit: 36000,
        property_type: "bedsitter",
        rooms: 1,
        is_furnished: false,
        utilities_included: true,
        amenities: ["WiFi", "Security"],
        image_prompt: "Cozy studio apartment in Nairobi with modern minimalist design"
      },
      {
        title: "Spacious 3BR House in Karen",
        description: "Beautiful standalone house with a garden, perfect for families. Secure and serene environment.",
        location: "Karen",
        neighborhood: "Karen",
        price: 120000,
        deposit: 240000,
        property_type: "house",
        rooms: 3,
        is_furnished: true,
        utilities_included: false,
        amenities: ["Garden", "Parking", "DSQ", "Security", "Backup Generator"],
        image_prompt: "Luxury house with garden in Karen, Nairobi with modern architecture"
      },
      {
        title: "1BR Apartment in Parklands",
        description: "Well-maintained 1-bedroom apartment in a secure complex with excellent transport links.",
        location: "Parklands",
        neighborhood: "Parklands",
        price: 32000,
        deposit: 64000,
        property_type: "apartment",
        rooms: 1,
        is_furnished: false,
        utilities_included: false,
        amenities: ["Parking", "Security", "Gym"],
        image_prompt: "Modern apartment complex in Nairobi with gated security"
      },
      {
        title: "Executive 2BR in Lavington",
        description: "Premium 2-bedroom apartment with stunning city views and top-tier finishes.",
        location: "Lavington",
        neighborhood: "Lavington",
        price: 85000,
        deposit: 170000,
        property_type: "apartment",
        rooms: 2,
        is_furnished: true,
        utilities_included: true,
        amenities: ["Swimming Pool", "Gym", "Parking", "WiFi", "Security"],
        image_prompt: "Luxury high-rise apartment building in Nairobi with glass facade"
      },
      {
        title: "Affordable Bedsitter in Ngong Road",
        description: "Budget-friendly bedsitter close to the CBD with easy access to public transport.",
        location: "Ngong Road",
        neighborhood: "Ngong Road",
        price: 15000,
        deposit: 30000,
        property_type: "bedsitter",
        rooms: 1,
        is_furnished: false,
        utilities_included: true,
        amenities: ["Security", "Water"],
        image_prompt: "Simple affordable apartment building in Nairobi"
      },
      {
        title: "4BR Villa in Runda",
        description: "Luxurious 4-bedroom villa with swimming pool and beautiful landscaping in an exclusive estate.",
        location: "Runda",
        neighborhood: "Runda Estate",
        price: 250000,
        deposit: 500000,
        property_type: "house",
        rooms: 4,
        is_furnished: true,
        utilities_included: false,
        amenities: ["Swimming Pool", "Garden", "DSQ", "Parking", "Security", "Gym"],
        image_prompt: "Luxury villa with swimming pool in Runda, Nairobi with lush gardens"
      },
      {
        title: "2BR Apartment in South B",
        description: "Well-located 2-bedroom apartment near shopping centers and schools.",
        location: "South B",
        neighborhood: "South B",
        price: 38000,
        deposit: 76000,
        property_type: "apartment",
        rooms: 2,
        is_furnished: false,
        utilities_included: false,
        amenities: ["Parking", "Security", "Playground"],
        image_prompt: "Family-friendly apartment building in Nairobi with children's playground"
      },
      {
        title: "Studio Apartment in Kilimani",
        description: "Compact studio with efficient layout, perfect for singles. Great neighborhood.",
        location: "Kilimani",
        neighborhood: "Kilimani",
        price: 25000,
        deposit: 50000,
        property_type: "bedsitter",
        rooms: 1,
        is_furnished: true,
        utilities_included: true,
        amenities: ["WiFi", "Security", "Parking"],
        image_prompt: "Modern studio apartment interior in Nairobi with efficient space design"
      },
      {
        title: "3BR Townhouse in Syokimau",
        description: "Modern townhouse with DSQ, perfect for families. Close to SGR station.",
        location: "Syokimau",
        neighborhood: "Syokimau",
        price: 65000,
        deposit: 130000,
        property_type: "house",
        rooms: 3,
        is_furnished: false,
        utilities_included: false,
        amenities: ["DSQ", "Parking", "Garden", "Security"],
        image_prompt: "Modern townhouse complex in Syokimau, Nairobi with contemporary design"
      },
      {
        title: "1BR in Kileleshwa",
        description: "Charming 1-bedroom apartment in quiet neighborhood with easy CBD access.",
        location: "Kileleshwa",
        neighborhood: "Kileleshwa",
        price: 40000,
        deposit: 80000,
        property_type: "apartment",
        rooms: 1,
        is_furnished: false,
        utilities_included: false,
        amenities: ["Parking", "Security", "Backup Generator"],
        image_prompt: "Peaceful residential apartment in Nairobi with green surroundings"
      },
      {
        title: "2BR Penthouse in Upper Hill",
        description: "Stunning penthouse with panoramic city views and premium finishes.",
        location: "Upper Hill",
        neighborhood: "Upper Hill",
        price: 150000,
        deposit: 300000,
        property_type: "apartment",
        rooms: 2,
        is_furnished: true,
        utilities_included: true,
        amenities: ["Swimming Pool", "Gym", "Parking", "WiFi", "Security", "Rooftop Terrace"],
        image_prompt: "Modern penthouse view from rooftop terrace overlooking Nairobi skyline"
      },
      {
        title: "Bedsitter in Embakasi",
        description: "Affordable bedsitter near the airport, ideal for aviation workers.",
        location: "Embakasi",
        neighborhood: "Embakasi",
        price: 12000,
        deposit: 24000,
        property_type: "bedsitter",
        rooms: 1,
        is_furnished: false,
        utilities_included: true,
        amenities: ["Security", "Water"],
        image_prompt: "Budget apartment building near Nairobi airport"
      },
      {
        title: "3BR Apartment in Riverside",
        description: "Elegant 3-bedroom apartment in serene Riverside with excellent amenities.",
        location: "Riverside",
        neighborhood: "Riverside Drive",
        price: 95000,
        deposit: 190000,
        property_type: "apartment",
        rooms: 3,
        is_furnished: true,
        utilities_included: false,
        amenities: ["Swimming Pool", "Gym", "Parking", "Security", "WiFi"],
        image_prompt: "Elegant apartment building along Riverside Drive Nairobi with modern design"
      },
      {
        title: "2BR House in Kahawa West",
        description: "Affordable standalone house with garden, perfect for small families.",
        location: "Kahawa West",
        neighborhood: "Kahawa West",
        price: 35000,
        deposit: 70000,
        property_type: "house",
        rooms: 2,
        is_furnished: false,
        utilities_included: false,
        amenities: ["Garden", "Parking", "Security"],
        image_prompt: "Simple family house with garden in Kahawa West, Nairobi"
      },
      {
        title: "1BR Apartment in Langata",
        description: "Cozy apartment near Nairobi National Park with nature views.",
        location: "Langata",
        neighborhood: "Langata",
        price: 30000,
        deposit: 60000,
        property_type: "apartment",
        rooms: 1,
        is_furnished: false,
        utilities_included: false,
        amenities: ["Parking", "Security", "Garden"],
        image_prompt: "Apartment building near Nairobi National Park with nature surroundings"
      },
      {
        title: "4BR House in Muthaiga",
        description: "Prestigious 4-bedroom house in Muthaiga with excellent security and amenities.",
        location: "Muthaiga",
        neighborhood: "Muthaiga",
        price: 280000,
        deposit: 560000,
        property_type: "house",
        rooms: 4,
        is_furnished: true,
        utilities_included: false,
        amenities: ["Swimming Pool", "Garden", "DSQ", "Parking", "Security", "Gym"],
        image_prompt: "Prestigious luxury home in Muthaiga, Nairobi with colonial architecture"
      },
      {
        title: "2BR Apartment in Donholm",
        description: "Affordable 2-bedroom apartment in established neighborhood with good amenities.",
        location: "Donholm",
        neighborhood: "Donholm",
        price: 28000,
        deposit: 56000,
        property_type: "apartment",
        rooms: 2,
        is_furnished: false,
        utilities_included: false,
        amenities: ["Parking", "Security"],
        image_prompt: "Established apartment complex in Donholm, Nairobi"
      },
      {
        title: "Bedsitter in Kasarani",
        description: "Budget-friendly bedsitter near Thika Road with easy transport access.",
        location: "Kasarani",
        neighborhood: "Kasarani",
        price: 13000,
        deposit: 26000,
        property_type: "bedsitter",
        rooms: 1,
        is_furnished: false,
        utilities_included: true,
        amenities: ["Security", "Water"],
        image_prompt: "Budget-friendly apartment in Kasarani, Nairobi near Thika Road"
      },
      {
        title: "3BR Apartment in Westlands",
        description: "Prime 3-bedroom apartment in Westlands with modern finishes and great location.",
        location: "Westlands",
        neighborhood: "Westlands",
        price: 110000,
        deposit: 220000,
        property_type: "apartment",
        rooms: 3,
        is_furnished: true,
        utilities_included: true,
        amenities: ["Swimming Pool", "Gym", "Parking", "WiFi", "Security", "Backup Generator"],
        image_prompt: "Premium apartment building in Westlands, Nairobi with modern glass design"
      }
    ];

    console.log("Starting property seeding...");

    for (const property of properties) {
      // Generate image for this property
      console.log(`Generating image for: ${property.title}`);
      
      const imageResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash-image-preview",
          messages: [
            {
              role: "user",
              content: property.image_prompt + ", professional real estate photography, high quality, well lit, attractive"
            }
          ],
          modalities: ["image", "text"]
        }),
      });

      if (!imageResponse.ok) {
        console.error(`Failed to generate image for ${property.title}`);
        continue;
      }

      const imageData = await imageResponse.json();
      const base64Image = imageData.choices?.[0]?.message?.images?.[0]?.image_url?.url;

      if (!base64Image) {
        console.error(`No image generated for ${property.title}`);
        continue;
      }

      // Convert base64 to blob
      const base64Data = base64Image.split(',')[1];
      const binaryData = Uint8Array.from(atob(base64Data), c => c.charCodeAt(0));
      
      // Upload to storage
      const fileName = `${crypto.randomUUID()}.png`;
      const { data: uploadData, error: uploadError } = await supabaseClient.storage
        .from('property-images')
        .upload(fileName, binaryData, {
          contentType: 'image/png',
        });

      if (uploadError) {
        console.error(`Failed to upload image for ${property.title}:`, uploadError);
        continue;
      }

      // Get public URL
      const { data: { publicUrl } } = supabaseClient.storage
        .from('property-images')
        .getPublicUrl(fileName);

      // Insert property
      const { data: propertyData, error: propertyError } = await supabaseClient
        .from('properties')
        .insert({
          caretaker_id: dummyCaretakerId,
          title: property.title,
          description: property.description,
          location: property.location,
          neighborhood: property.neighborhood,
          price: property.price,
          deposit: property.deposit,
          property_type: property.property_type,
          rooms: property.rooms,
          is_furnished: property.is_furnished,
          utilities_included: property.utilities_included,
          amenities: property.amenities,
          status: 'available'
        })
        .select()
        .single();

      if (propertyError) {
        console.error(`Failed to insert property ${property.title}:`, propertyError);
        continue;
      }

      // Insert property image
      const { error: imageInsertError } = await supabaseClient
        .from('property_images')
        .insert({
          property_id: propertyData.id,
          image_url: publicUrl,
          display_order: 0
        });

      if (imageInsertError) {
        console.error(`Failed to insert property image for ${property.title}:`, imageInsertError);
      } else {
        console.log(`✓ Successfully created: ${property.title}`);
      }
    }

    return new Response(
      JSON.stringify({ success: true, message: "Properties seeded successfully" }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error in seed-properties function:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
