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
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      {
        global: {
          headers: { Authorization: req.headers.get("Authorization")! },
        },
      }
    );

    const {
      data: { user },
    } = await supabaseClient.auth.getUser();

    if (!user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Get user's Groq API key
    const { data: profile, error: profileError } = await supabaseClient
      .from("profiles")
      .select("groq_api_key, ai_enabled")
      .eq("id", user.id)
      .single();

    if (profileError || !profile?.groq_api_key || !profile?.ai_enabled) {
      return new Response(
        JSON.stringify({ error: "Groq API key not configured" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const { prompt, context } = await req.json();

    // Build system message based on context
    let systemMessage = "You are an AI assistant for a housing rental platform in Nairobi, Kenya. ";
    
    if (context) {
      switch (context.type) {
        case "listing":
          systemMessage += "Help improve property listings by making them more attractive to tenants. Focus on highlighting key features, using persuasive language, and emphasizing value. Consider local Nairobi neighborhoods, transport links, and affordability.";
          break;
        case "tenant_match":
          systemMessage += "Analyze how well a property matches a tenant's requirements. Score the match 0-100 and explain the top 3 reasons for the score. Consider budget, location preferences, amenities, and property condition.";
          break;
        case "move_cost":
          systemMessage += "Estimate moving costs in Nairobi based on property size, distance, and service level. Suggest appropriate van sizes (small for studios/bedsitters, medium for 1-2BR, large for 3BR+). Provide cost estimates in KSh.";
          break;
        default:
          systemMessage += "Provide helpful, accurate information about housing and moving in Nairobi.";
      }
    }

    // Call Groq API
    const groqResponse = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${profile.groq_api_key}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: [
          { role: "system", content: systemMessage },
          { role: "user", content: prompt },
        ],
        temperature: 0.7,
        max_tokens: 500,
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
