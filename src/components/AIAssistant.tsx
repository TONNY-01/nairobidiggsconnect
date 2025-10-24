import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { Sparkles, Key, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface AIAssistantProps {
  context?: {
    type: "listing" | "tenant_match" | "move_cost";
    data?: any;
  };
}

const AIAssistant = ({ context }: AIAssistantProps) => {
  const [apiKey, setApiKey] = useState("");
  const [prompt, setPrompt] = useState("");
  const [response, setResponse] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();

  const { data: profile } = useQuery({
    queryKey: ["profile"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const { data, error } = await supabase
        .from("profiles")
        .select("groq_api_key, ai_enabled")
        .eq("id", user.id)
        .single();

      if (error) throw error;
      return data;
    },
  });

  const saveApiKey = useMutation({
    mutationFn: async ({ key, enabled }: { key: string; enabled: boolean }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { error } = await supabase
        .from("profiles")
        .update({ groq_api_key: key, ai_enabled: enabled })
        .eq("id", user.id);

      if (error) throw error;
    },
    onSuccess: () => {
      toast({
        title: "API Key Saved",
        description: "Your Groq API key has been securely stored.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to save API key",
        variant: "destructive",
      });
    },
  });

  const callAI = useMutation({
    mutationFn: async (userPrompt: string) => {
      const { data, error } = await supabase.functions.invoke("groq-ai", {
        body: { prompt: userPrompt, context },
      });

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      setResponse(data.result);
      setIsProcessing(false);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to process AI request",
        variant: "destructive",
      });
      setIsProcessing(false);
    },
  });

  const handleSaveKey = () => {
    if (!apiKey.trim()) {
      toast({
        title: "Error",
        description: "Please enter a valid API key",
        variant: "destructive",
      });
      return;
    }
    saveApiKey.mutate({ key: apiKey, enabled: true });
  };

  const handleAIRequest = () => {
    if (!profile?.groq_api_key) {
      toast({
        title: "API Key Required",
        description: "Please configure your Groq API key first",
        variant: "destructive",
      });
      return;
    }

    if (!prompt.trim()) {
      toast({
        title: "Error",
        description: "Please enter a prompt",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    callAI.mutate(prompt);
  };

  const getContextPromptSuggestions = () => {
    if (!context) return [];

    switch (context.type) {
      case "listing":
        return [
          "Improve this listing title and write a compelling 25-word summary",
          "Suggest ways to make this listing more attractive to tenants",
          "Analyze the pricing compared to similar properties in the area",
        ];
      case "tenant_match":
        return [
          "Score this property for a tenant looking for affordable housing in this neighborhood",
          "What are the top 3 selling points for budget-conscious tenants?",
        ];
      case "move_cost":
        return [
          "Estimate the moving cost and suggest the appropriate van size",
        ];
      default:
        return [];
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-primary" />
          <CardTitle>AI Assistant</CardTitle>
        </div>
        <CardDescription>
          Powered by Groq - Get intelligent suggestions for your listings and tenant matching
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Your API key is stored securely and only used for your AI requests. Get your free Groq
            API key at{" "}
            <a
              href="https://console.groq.com"
              target="_blank"
              rel="noopener noreferrer"
              className="underline"
            >
              console.groq.com
            </a>
          </AlertDescription>
        </Alert>

        {!profile?.groq_api_key ? (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="apiKey">Groq API Key</Label>
              <div className="flex gap-2">
                <Input
                  id="apiKey"
                  type="password"
                  placeholder="gsk_..."
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  className="flex-1"
                />
                <Button onClick={handleSaveKey} disabled={saveApiKey.isPending}>
                  <Key className="w-4 h-4 mr-2" />
                  Save
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Label htmlFor="ai-toggle">AI Features</Label>
                <Switch
                  id="ai-toggle"
                  checked={profile.ai_enabled}
                  onCheckedChange={(enabled) =>
                    saveApiKey.mutate({ key: profile.groq_api_key, enabled })
                  }
                />
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  saveApiKey.mutate({ key: "", enabled: false });
                  setApiKey("");
                }}
              >
                Remove Key
              </Button>
            </div>

            {profile.ai_enabled && (
              <>
                {getContextPromptSuggestions().length > 0 && (
                  <div className="space-y-2">
                    <Label>Quick Actions</Label>
                    <div className="flex flex-wrap gap-2">
                      {getContextPromptSuggestions().map((suggestion, idx) => (
                        <Button
                          key={idx}
                          variant="outline"
                          size="sm"
                          onClick={() => setPrompt(suggestion)}
                        >
                          {suggestion}
                        </Button>
                      ))}
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="prompt">Your Prompt</Label>
                  <Textarea
                    id="prompt"
                    placeholder="Enter your AI prompt..."
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    rows={4}
                  />
                  <Button
                    onClick={handleAIRequest}
                    disabled={isProcessing || !prompt.trim()}
                    className="w-full"
                  >
                    {isProcessing ? "Processing..." : "Get AI Suggestions"}
                  </Button>
                </div>

                {response && (
                  <div className="space-y-2">
                    <Label>AI Response</Label>
                    <div className="bg-muted p-4 rounded-lg whitespace-pre-wrap">
                      {response}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AIAssistant;
