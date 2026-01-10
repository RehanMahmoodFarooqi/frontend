
import { useEffect, useState, useRef } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { Loader2, Send, MessageSquare, User, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { format } from "date-fns";
import { toast } from "sonner";

export default function Messages() {
  const { user } = useAuth();
  const [chats, setChats] = useState<any[]>([]);
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loadingChats, setLoadingChats] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (user) {
      fetchChats();
    }
  }, [user]);

  useEffect(() => {
    if (activeChatId) {
      fetchMessages(activeChatId);
      // Optional: Polling or socket here for real-time
      const interval = setInterval(() => fetchMessages(activeChatId, true), 5000);
      return () => clearInterval(interval);
    }
  }, [activeChatId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (chats.length > 0 || !loadingChats) {
      const searchParams = new URLSearchParams(window.location.search);
      const chatIdParam = searchParams.get('chatId');
      const initialMsgParam = searchParams.get('initialMessage');

      if (chatIdParam) {
        // Verify we have this chat or force set it to trigger fetchMessages
        const chatExists = chats.find(c => c.id === chatIdParam);

        // Always set active chat if param is present, so we fetch messages for it
        if (activeChatId !== chatIdParam) {
          setActiveChatId(chatIdParam);
        }

        // Set initial message only if we have one and textarea is empty (prevent overwriting user input)
        if (initialMsgParam && !newMessage) {
          setNewMessage(initialMsgParam);
        }
      }
    }
  }, [chats, loadingChats]); // Run when chats loaded or loading finishes

  const fetchChats = async () => {
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/chats`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        // data structure from backend: { total: number, chats: [] }
        // Verify this from chats.controller.js -> getChats -> res.json(result) -> service.getChats returns { total, chats }.
        // Wait, did I check that? 
        // chats.service.js: return { total: count, chats: mapped };
        // So the frontend needs to handle that too!
        // The original code was: setChats(data); implying data is array.
        // I need to fix this here as well!

        if (data.chats) {
          setChats(data.chats);
        } else if (Array.isArray(data)) {
          setChats(data);
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingChats(false);
    }
  };

  const fetchMessages = async (chatId: string, silent = false) => {
    if (!silent) setLoadingMessages(true);
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/chats/${chatId}/messages`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        // Handle { messages: [] } or []
        let msgList = [];
        if (data.messages && Array.isArray(data.messages)) {
          msgList = data.messages;
        } else if (Array.isArray(data)) {
          msgList = data;
        }

        // Backend returns DESC (newest first).
        setMessages([...msgList].reverse());
      }
    } catch (e) {
      console.error(e);
    } finally {
      if (!silent) setLoadingMessages(false);
    }
  };

  const handleSendMessage = async () => {
    if (!activeChatId || !newMessage.trim()) return;

    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/chats/${activeChatId}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ message: newMessage })
      });

      if (res.ok) {
        setNewMessage("");
        fetchMessages(activeChatId, true);
      } else {
        const err = await res.json();
        if (err.error?.message?.includes('ABUSIVE_CONTENT')) {
          toast.error("Message blocked: Contains inappropriate words.");
        } else {
          // Optional: generic error or silence
          console.error("Failed to send");
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  if (!user) {
    return (
      <div className="container mx-auto py-10 px-4 text-center">
        <h1 className="text-2xl font-bold mb-4">Messages</h1>
        <p className="text-muted-foreground">Please sign in to view messages.</p>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-[calc(100vh-120px)]">
        {/* Chat List */}
        <div className="md:col-span-1 border rounded-lg overflow-hidden flex flex-col bg-white shadow-sm">
          <div className="p-4 border-b bg-secondary/5">
            <h2 className="font-semibold text-lg flex items-center">
              <MessageSquare className="w-5 h-5 mr-2" />
              Conversations
            </h2>
          </div>
          <div className="flex-1 overflow-y-auto">
            {loadingChats ? (
              <div className="flex justify-center p-4"><Loader2 className="animate-spin" /></div>
            ) : chats.length === 0 ? (
              <div className="p-4 text-center text-muted-foreground">No conversations yet</div>
            ) : (
              chats.map(chat => {
                // Find other participant name
                const otherParticipant = chat.participants.find((p: any) => p.userId !== user.id)?.user;
                return (
                  <div
                    key={chat.id}
                    onClick={() => setActiveChatId(chat.id)}
                    className={`p-4 border-b cursor-pointer hover:bg-secondary/5 transition-colors ${activeChatId === chat.id ? 'bg-secondary/10' : ''}`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center">
                        <User className="w-5 h-5 text-slate-500" />
                      </div>
                      <div>
                        <p className="font-medium text-sm">{otherParticipant?.name || 'Unknown User'}</p>
                        <p className="text-xs text-muted-foreground truncate w-32">
                          {format(new Date(chat.createdAt), 'MMM d, h:mm a')}
                        </p>
                      </div>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </div>

        {/* Chat Window */}
        <div className="md:col-span-2 border rounded-lg overflow-hidden flex flex-col bg-white shadow-sm">
          {activeChatId ? (
            <>
              <div className="flex-1 p-4 overflow-y-auto bg-slate-50 space-y-4">
                {loadingMessages ? (
                  <div className="flex justify-center h-full items-center"><Loader2 className="animate-spin" /></div>
                ) : messages.length === 0 ? (
                  <div className="text-center text-muted-foreground mt-10">No messages yet</div>
                ) : (
                  messages.map(msg => (
                    <div
                      key={msg.id}
                      className={`flex ${msg.senderId === user.id ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[70%] p-3 rounded-lg text-sm ${msg.senderId === user.id
                          ? 'bg-accent text-white rounded-br-none'
                          : 'bg-white border rounded-bl-none'
                          }`}
                      >
                        <p>{msg.message}</p>
                        <p className={`text-[10px] mt-1 ${msg.senderId === user.id ? 'text-accent-foreground/80' : 'text-muted-foreground'}`}>
                          {format(new Date(msg.createdAt), 'h:mm a')}
                        </p>
                      </div>
                    </div>
                  ))
                )}
                <div ref={messagesEndRef} />
              </div>
              <div className="p-4 border-t bg-white flex gap-2">
                <Input
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                  placeholder="Type a message..."
                  className="flex-1"
                />
                <Button onClick={handleSendMessage} disabled={!newMessage.trim()}>
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center flex-col text-muted-foreground">
              <MessageSquare className="w-12 h-12 mb-4 opacity-20" />
              <p>Select a conversation to start messaging</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
