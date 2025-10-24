import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { Send, MessageSquare } from "lucide-react";
import { format } from "date-fns";

const Messages = () => {
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [messageText, setMessageText] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: user } = useQuery({
    queryKey: ["user"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      return user;
    },
  });

  // Fetch conversations
  const { data: conversations } = useQuery({
    queryKey: ["conversations", user?.id],
    queryFn: async () => {
      if (!user?.id) return [];

      const { data, error } = await supabase
        .from("messages")
        .select("*")
        .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Get partner profiles
      const partnerIds = [...new Set(data?.map(msg => 
        msg.sender_id === user.id ? msg.receiver_id : msg.sender_id
      ))];
      
      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, full_name")
        .in("id", partnerIds);
      
      const profileMap = new Map(profiles?.map(p => [p.id, p.full_name]));

      // Group by conversation partner
      const grouped = new Map();
      data?.forEach((msg) => {
        const partnerId = msg.sender_id === user.id ? msg.receiver_id : msg.sender_id;
        const partnerName = profileMap.get(partnerId) || "Unknown";
        
        if (!grouped.has(partnerId)) {
          grouped.set(partnerId, {
            partnerId,
            partnerName,
            lastMessage: msg,
            unreadCount: 0,
          });
        }
        
        if (msg.receiver_id === user.id && !msg.read) {
          grouped.get(partnerId).unreadCount++;
        }
      });

      return Array.from(grouped.values());
    },
    enabled: !!user?.id,
  });

  // Fetch messages for selected conversation
  const { data: messages } = useQuery({
    queryKey: ["messages", selectedConversation, user?.id],
    queryFn: async () => {
      if (!selectedConversation || !user?.id) return [];

      const { data, error } = await supabase
        .from("messages")
        .select("*")
        .or(`and(sender_id.eq.${user.id},receiver_id.eq.${selectedConversation}),and(sender_id.eq.${selectedConversation},receiver_id.eq.${user.id})`)
        .order("created_at", { ascending: true });

      if (error) throw error;

      // Mark messages as read
      const unreadIds = data?.filter(m => m.receiver_id === user.id && !m.read).map(m => m.id);
      if (unreadIds && unreadIds.length > 0) {
        await supabase
          .from("messages")
          .update({ read: true })
          .in("id", unreadIds);
      }

      return data;
    },
    enabled: !!selectedConversation && !!user?.id,
  });

  // Send message mutation
  const sendMessage = useMutation({
    mutationFn: async (content: string) => {
      if (!user?.id || !selectedConversation) return;

      const { error } = await supabase.from("messages").insert({
        sender_id: user.id,
        receiver_id: selectedConversation,
        content,
      });

      if (error) throw error;
    },
    onSuccess: () => {
      setMessageText("");
      queryClient.invalidateQueries({ queryKey: ["messages"] });
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to send message",
        variant: "destructive",
      });
    },
  });

  // Subscribe to realtime updates
  useEffect(() => {
    if (!user?.id) return;

    const channel = supabase
      .channel("messages")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "messages",
          filter: `receiver_id=eq.${user.id}`,
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ["messages"] });
          queryClient.invalidateQueries({ queryKey: ["conversations"] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id, queryClient]);

  const handleSend = () => {
    if (!messageText.trim()) return;
    sendMessage.mutate(messageText);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold text-foreground mb-8">Messages</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[600px]">
          {/* Conversations List */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle>Conversations</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 overflow-y-auto h-[500px]">
              {conversations?.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <MessageSquare className="w-12 h-12 mx-auto mb-2" />
                  <p>No conversations yet</p>
                </div>
              ) : (
                conversations?.map((conv) => (
                  <button
                    key={conv.partnerId}
                    onClick={() => setSelectedConversation(conv.partnerId)}
                    className={`w-full p-4 rounded-lg text-left transition-all ${
                      selectedConversation === conv.partnerId
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted hover:bg-muted/80"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarFallback>{conv.partnerName[0]}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="font-semibold truncate">{conv.partnerName}</p>
                          {conv.unreadCount > 0 && (
                            <span className="bg-destructive text-destructive-foreground text-xs rounded-full px-2 py-0.5">
                              {conv.unreadCount}
                            </span>
                          )}
                        </div>
                        <p className="text-sm truncate opacity-80">
                          {conv.lastMessage.content}
                        </p>
                      </div>
                    </div>
                  </button>
                ))
              )}
            </CardContent>
          </Card>

          {/* Messages Area */}
          <Card className="lg:col-span-2">
            {selectedConversation ? (
              <>
                <CardContent className="p-6 overflow-y-auto h-[480px] space-y-4">
                  {messages?.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex ${
                        msg.sender_id === user?.id ? "justify-end" : "justify-start"
                      }`}
                    >
                      <div
                        className={`max-w-[70%] rounded-lg p-3 ${
                          msg.sender_id === user?.id
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted"
                        }`}
                      >
                        <p className="text-sm">{msg.content}</p>
                        <p className="text-xs opacity-70 mt-1">
                          {format(new Date(msg.created_at), "HH:mm")}
                        </p>
                      </div>
                    </div>
                  ))}
                </CardContent>
                <div className="p-4 border-t flex gap-2">
                  <Textarea
                    placeholder="Type a message..."
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        handleSend();
                      }
                    }}
                    className="flex-1 min-h-[60px]"
                  />
                  <Button onClick={handleSend} disabled={!messageText.trim()}>
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              </>
            ) : (
              <div className="h-full flex items-center justify-center text-muted-foreground">
                <div className="text-center">
                  <MessageSquare className="w-16 h-16 mx-auto mb-4" />
                  <p>Select a conversation to start messaging</p>
                </div>
              </div>
            )}
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Messages;
