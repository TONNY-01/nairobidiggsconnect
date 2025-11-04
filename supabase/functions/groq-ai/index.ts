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
    const groqApiKey = Deno.env.get("GROQ_API_KEY");
    
    if (!groqApiKey) {
      return new Response(
        JSON.stringify({ error: "Groq API key not configured on server" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const { messages, includeProperties } = await req.json();

    // Fetch available properties if requested
    let propertiesContext = "";
    if (includeProperties) {
      const { data: properties, error: propertiesError } = await supabaseClient
        .from("properties")
        .select(`
          id,
          title,
          description,
          location,
          neighborhood,
          price,
          deposit,
          property_type,
          rooms,
          amenities,
          is_furnished,
          utilities_included,
          available_from
        `)
        .eq("status", "available")
        .order("created_at", { ascending: false })
        .limit(20);

      if (properties && properties.length > 0) {
        propertiesContext = "\n\nAvailable Properties:\n" + properties.map(p => 
          `- ${p.title} (${p.property_type}): ${p.rooms} room(s) in ${p.location}${p.neighborhood ? ', ' + p.neighborhood : ''} at KSh ${p.price}/month. ${p.description.slice(0, 100)}... Amenities: ${p.amenities.join(', ')}`
        ).join("\n");
      }
    }

    // Build system message
    const systemMessage = `You are a helpful AI assistant for a housing rental platform in Nairobi, Kenya. 

Your role is to help users find their perfect home by:
- Understanding their budget, location preferences, and requirements
- Recommending suitable properties from the available listings
- Answering questions about neighborhoods, amenities, and property features
- Providing guidance on rental processes and moving

Be conversational, friendly, and helpful. When recommending properties, mention specific details like location, price, and key features. Always prioritize the user's stated budget and requirements.${propertiesContext}`;

    // Prepare messages array with system message
    const apiMessages = [
      { role: "system", content: systemMessage },
      ...messages
    ];

    console.log("Calling Groq API with messages:", JSON.stringify(apiMessages));

    // Call Groq API
    const groqResponse = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${groqApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: apiMessages,
        temperature: 0.7,
        max_tokens: 1000,
      }),
    });

    if (!groqResponse.ok) {
      const errorText = await groqResponse.text();
      console.error("Groq API error:", errorText);
      
      return new Response(
        JSON.stringify({ error: "AI service error. Please check your API key." }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const data = await groqResponse.json();
    const result = data.choices[0]?.message?.content || "No response generated";

    return new Response(JSON.stringify({ result }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error in groq-ai function:", error);
    const errorMessage = error instanceof Error ? error.message : "Internal server error";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
