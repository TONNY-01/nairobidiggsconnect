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
        title: "Cozy Bedsitter in Kilimani",
        description: "Modern bedsitter with all amenities. Perfect for young professionals. Close to shopping centers and excellent transport links.",
        location: "Kilimani",
        neighborhood: "Kilimani",
        price: 18000,
        deposit: 36000,
        property_type: "bedsitter",
        rooms: 1,
        is_furnished: true,
        utilities_included: true,
        amenities: ["WiFi", "Security", "Water"],
        image_prompt: "Modern cozy bedsitter apartment interior in Nairobi with bed, kitchenette, and living area in one room"
      },
      {
        title: "Affordable 1BR in Ngong Road",
        description: "Spacious one-bedroom apartment in a secure building. Great neighborhood with easy access to town.",
        location: "Ngong Road",
        neighborhood: "Ngong Road",
        price: 25000,
        deposit: 50000,
        property_type: "apartment",
        rooms: 1,
        is_furnished: false,
        utilities_included: false,
        amenities: ["Parking", "Security", "Backup Water"],
        image_prompt: "Clean one bedroom apartment in Nairobi with separate living room and bedroom"
      },
      {
        title: "Studio Bedsitter in Westlands",
        description: "Fully furnished bedsitter in the heart of Westlands. Walking distance to all major amenities.",
        location: "Westlands",
        neighborhood: "Westlands",
        price: 22000,
        deposit: 44000,
        property_type: "bedsitter",
        rooms: 1,
        is_furnished: true,
        utilities_included: true,
        amenities: ["WiFi", "Security", "Gym Access"],
        image_prompt: "Stylish studio apartment in Westlands Nairobi with modern furniture and kitchenette"
      },
      {
        title: "1BR Apartment in Parklands",
        description: "Well-maintained apartment with separate bedroom. Secure complex with good transport links.",
        location: "Parklands",
        neighborhood: "Parklands",
        price: 28000,
        deposit: 56000,
        property_type: "apartment",
        rooms: 1,
        is_furnished: false,
        utilities_included: false,
        amenities: ["Parking", "Security", "Gym"],
        image_prompt: "Modern one bedroom apartment in Parklands Nairobi with balcony view"
      },
      {
        title: "Bedsitter in South B",
        description: "Affordable bedsitter near shopping centers. Perfect for students and young professionals.",
        location: "South B",
        neighborhood: "South B",
        price: 15000,
        deposit: 30000,
        property_type: "bedsitter",
        rooms: 1,
        is_furnished: false,
        utilities_included: true,
        amenities: ["Security", "Water"],
        image_prompt: "Simple affordable bedsitter in Nairobi with basic amenities"
      },
      {
        title: "1BR in Kileleshwa",
        description: "Charming one-bedroom apartment in quiet neighborhood. Perfect for singles or couples.",
        location: "Kileleshwa",
        neighborhood: "Kileleshwa",
        price: 35000,
        deposit: 70000,
        property_type: "apartment",
        rooms: 1,
        is_furnished: false,
        utilities_included: false,
        amenities: ["Parking", "Security", "Backup Generator"],
        image_prompt: "Comfortable one bedroom apartment in Kileleshwa Nairobi with modern kitchen"
      },
      {
        title: "Studio in Lavington",
        description: "Premium studio apartment with excellent finishes. Serene and secure environment.",
        location: "Lavington",
        neighborhood: "Lavington",
        price: 40000,
        deposit: 80000,
        property_type: "bedsitter",
        rooms: 1,
        is_furnished: true,
        utilities_included: true,
        amenities: ["WiFi", "Security", "Gym", "Swimming Pool"],
        image_prompt: "Luxury studio apartment in Lavington Nairobi with premium finishes"
      },
      {
        title: "Bedsitter in Kasarani",
        description: "Budget-friendly bedsitter near Thika Road. Easy access to town via superhighway.",
        location: "Kasarani",
        neighborhood: "Kasarani",
        price: 12000,
        deposit: 24000,
        property_type: "bedsitter",
        rooms: 1,
        is_furnished: false,
        utilities_included: true,
        amenities: ["Security", "Water"],
        image_prompt: "Budget bedsitter apartment in Kasarani Nairobi near Thika Road"
      },
      {
        title: "1BR Apartment in Embakasi",
        description: "One-bedroom apartment near the airport. Ideal for aviation workers and travelers.",
        location: "Embakasi",
        neighborhood: "Embakasi",
        price: 20000,
        deposit: 40000,
        property_type: "apartment",
        rooms: 1,
        is_furnished: false,
        utilities_included: false,
        amenities: ["Parking", "Security"],
        image_prompt: "One bedroom apartment near Nairobi airport in Embakasi"
      },
      {
        title: "Studio in Upper Hill",
        description: "Modern studio near major hospitals and offices. Great for medical professionals.",
        location: "Upper Hill",
        neighborhood: "Upper Hill",
        price: 32000,
        deposit: 64000,
        property_type: "bedsitter",
        rooms: 1,
        is_furnished: true,
        utilities_included: true,
        amenities: ["WiFi", "Security", "Parking"],
        image_prompt: "Modern studio apartment in Upper Hill Nairobi near hospitals"
      },
      {
        title: "Bedsitter in Donholm",
        description: "Quiet bedsitter in established neighborhood. Good security and water supply.",
        location: "Donholm",
        neighborhood: "Donholm",
        price: 16000,
        deposit: 32000,
        property_type: "bedsitter",
        rooms: 1,
        is_furnished: false,
        utilities_included: true,
        amenities: ["Security", "Water"],
        image_prompt: "Peaceful bedsitter in Donholm Nairobi residential area"
      },
      {
        title: "1BR in Langata",
        description: "Spacious one-bedroom near Nairobi National Park. Enjoy nature views daily.",
        location: "Langata",
        neighborhood: "Langata",
        price: 30000,
        deposit: 60000,
        property_type: "apartment",
        rooms: 1,
        is_furnished: false,
        utilities_included: false,
        amenities: ["Parking", "Security", "Garden"],
        image_prompt: "One bedroom apartment in Langata Nairobi with nature views"
      },
      {
        title: "Bedsitter in Kahawa West",
        description: "Affordable bedsitter with reliable water and power. Close to Thika Road.",
        location: "Kahawa West",
        neighborhood: "Kahawa West",
        price: 13000,
        deposit: 26000,
        property_type: "bedsitter",
        rooms: 1,
        is_furnished: false,
        utilities_included: true,
        amenities: ["Security", "Water"],
        image_prompt: "Simple bedsitter in Kahawa West Nairobi near Thika Road"
      },
      {
        title: "1BR Apartment in Kilimani",
        description: "Well-located one-bedroom in vibrant Kilimani. Walking distance to restaurants and shops.",
        location: "Kilimani",
        neighborhood: "Kilimani",
        price: 38000,
        deposit: 76000,
        property_type: "apartment",
        rooms: 1,
        is_furnished: true,
        utilities_included: false,
        amenities: ["WiFi", "Security", "Parking", "Gym"],
        image_prompt: "Furnished one bedroom apartment in Kilimani Nairobi with modern amenities"
      },
      {
        title: "Studio in Riverside",
        description: "Elegant studio apartment along Riverside Drive. Premium location and finishes.",
        location: "Riverside",
        neighborhood: "Riverside Drive",
        price: 45000,
        deposit: 90000,
        property_type: "bedsitter",
        rooms: 1,
        is_furnished: true,
        utilities_included: true,
        amenities: ["WiFi", "Security", "Gym", "Swimming Pool"],
        image_prompt: "Luxury studio on Riverside Drive Nairobi with river views"
      },
      {
        title: "Bedsitter in Rongai",
        description: "Budget-friendly bedsitter in Rongai. Perfect for students at nearby universities.",
        location: "Rongai",
        neighborhood: "Rongai",
        price: 10000,
        deposit: 20000,
        property_type: "bedsitter",
        rooms: 1,
        is_furnished: false,
        utilities_included: true,
        amenities: ["Security", "Water"],
        image_prompt: "Affordable bedsitter for students in Rongai near universities"
      },
      {
        title: "1BR in Westlands",
        description: "Modern one-bedroom in prime Westlands location. Great for professionals.",
        location: "Westlands",
        neighborhood: "Westlands",
        price: 42000,
        deposit: 84000,
        property_type: "apartment",
        rooms: 1,
        is_furnished: true,
        utilities_included: true,
        amenities: ["WiFi", "Security", "Parking", "Backup Generator"],
        image_prompt: "Modern furnished one bedroom in Westlands Nairobi business district"
      },
      {
        title: "Bedsitter in Ruaka",
        description: "Spacious bedsitter in growing Ruaka town. Affordable with good amenities.",
        location: "Ruaka",
        neighborhood: "Ruaka",
        price: 14000,
        deposit: 28000,
        property_type: "bedsitter",
        rooms: 1,
        is_furnished: false,
        utilities_included: true,
        amenities: ["Security", "Water", "Parking"],
        image_prompt: "Bedsitter apartment in Ruaka town Nairobi"
      },
      {
        title: "1BR Apartment in South C",
        description: "Quiet one-bedroom in established South C. Family-friendly neighborhood.",
        location: "South C",
        neighborhood: "South C",
        price: 33000,
        deposit: 66000,
        property_type: "apartment",
        rooms: 1,
        is_furnished: false,
        utilities_included: false,
        amenities: ["Parking", "Security", "Playground"],
        image_prompt: "One bedroom apartment in South C Nairobi residential area"
      },
      {
        title: "Studio in Kilimani",
        description: "Compact studio with efficient design. All utilities included in rent.",
        location: "Kilimani",
        neighborhood: "Kilimani",
        price: 26000,
        deposit: 52000,
        property_type: "bedsitter",
        rooms: 1,
        is_furnished: true,
        utilities_included: true,
        amenities: ["WiFi", "Security", "Parking"],
        image_prompt: "Compact efficient studio apartment in Kilimani Nairobi"
      },
      {
        title: "Bedsitter in Githurai",
        description: "Affordable bedsitter along Thika Road. Good transport and shopping nearby.",
        location: "Githurai",
        neighborhood: "Githurai",
        price: 11000,
        deposit: 22000,
        property_type: "bedsitter",
        rooms: 1,
        is_furnished: false,
        utilities_included: true,
        amenities: ["Security", "Water"],
        image_prompt: "Budget bedsitter in Githurai along Thika Road Nairobi"
      },
      {
        title: "1BR in Parklands",
        description: "Spacious one-bedroom with balcony. Diverse and vibrant neighborhood.",
        location: "Parklands",
        neighborhood: "Parklands",
        price: 31000,
        deposit: 62000,
        property_type: "apartment",
        rooms: 1,
        is_furnished: false,
        utilities_included: false,
        amenities: ["Parking", "Security", "Balcony"],
        image_prompt: "One bedroom with balcony in Parklands Nairobi"
      },
      {
        title: "Bedsitter in Imara Daima",
        description: "Convenient bedsitter near SGR terminus. Easy access to town and airport.",
        location: "Imara Daima",
        neighborhood: "Imara Daima",
        price: 15000,
        deposit: 30000,
        property_type: "bedsitter",
        rooms: 1,
        is_furnished: false,
        utilities_included: true,
        amenities: ["Security", "Water"],
        image_prompt: "Bedsitter near SGR station in Imara Daima Nairobi"
      },
      {
        title: "1BR Apartment in Kileleshwa",
        description: "Modern one-bedroom in leafy Kileleshwa. Quiet and secure environment.",
        location: "Kileleshwa",
        neighborhood: "Kileleshwa",
        price: 37000,
        deposit: 74000,
        property_type: "apartment",
        rooms: 1,
        is_furnished: false,
        utilities_included: false,
        amenities: ["Parking", "Security", "Garden"],
        image_prompt: "Modern one bedroom in leafy Kileleshwa Nairobi"
      },
      {
        title: "Studio in Ngong Road",
        description: "Furnished studio on Ngong Road. Perfect location for young professionals.",
        location: "Ngong Road",
        neighborhood: "Ngong Road",
        price: 24000,
        deposit: 48000,
        property_type: "bedsitter",
        rooms: 1,
        is_furnished: true,
        utilities_included: true,
        amenities: ["WiFi", "Security", "Parking"],
        image_prompt: "Furnished studio on Ngong Road Nairobi for young professionals"
      }
    ];

    console.log("Starting affordable properties seeding...");

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
              content: property.image_prompt + ", professional real estate photography, high quality, well lit, attractive, photorealistic"
            }
          ],
          modalities: ["image", "text"]
        }),
      });

      if (!imageResponse.ok) {
        console.error(`Failed to generate image for ${property.title}:`, await imageResponse.text());
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
      JSON.stringify({ success: true, message: "25 affordable properties seeded successfully" }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error in seed-affordable-properties function:", error);
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
