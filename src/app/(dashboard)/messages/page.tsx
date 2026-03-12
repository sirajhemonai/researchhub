"use client";

import { useEffect, useState, useRef, Suspense } from "react";
import { useSession } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";
import { Send, MessageSquare, ArrowLeft } from "lucide-react";

interface Conversation {
  partner: {
    id: string;
    name: string;
    role: string;
    profile: { companyName: string | null; university: string | null } | null;
  } | null;
  lastMessage: {
    body: string;
    createdAt: string;
    senderId: string;
  } | null;
  unreadCount: number;
}

interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  body: string;
  read: boolean;
  createdAt: string;
  sender: { id: string; name: string; role: string };
  receiver: { id: string; name: string; role: string };
}

export default function MessagesPage() {
  return (
    <Suspense fallback={<div className="max-w-6xl mx-auto px-4 py-8"><div className="animate-pulse h-96 bg-slate-200 rounded-xl" /></div>}>
      <MessagesContent />
    </Suspense>
  );
}

function MessagesContent() {
  const { data: session } = useSession();
  const searchParams = useSearchParams();
  const toParam = searchParams.get("to");

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeChat, setActiveChat] = useState<string | null>(toParam);
  const [activeName, setActiveName] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchConversations();
  }, []);

  useEffect(() => {
    if (activeChat) {
      fetchMessages(activeChat);
      const interval = setInterval(() => fetchMessages(activeChat), 5000);
      return () => clearInterval(interval);
    }
  }, [activeChat]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function fetchConversations() {
    const res = await fetch("/api/messages");
    const data = await res.json();
    setConversations(data.conversations || []);
    setLoading(false);

    if (toParam) {
      setActiveChat(toParam);
      const conv = (data.conversations || []).find(
        (c: Conversation) => c.partner?.id === toParam
      );
      if (conv?.partner) {
        setActiveName(conv.partner.name);
      } else {
        const userRes = await fetch(`/api/profile/${toParam}`);
        const userData = await userRes.json();
        setActiveName(userData.name || "User");
      }
    }
  }

  async function fetchMessages(partnerId: string) {
    const res = await fetch(`/api/messages?with=${partnerId}`);
    const data = await res.json();
    setMessages(data.messages || []);
  }

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    if (!newMessage.trim() || !activeChat) return;

    setSending(true);
    try {
      await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ receiverId: activeChat, body: newMessage }),
      });
      setNewMessage("");
      fetchMessages(activeChat);
      fetchConversations();
    } catch {
      // silent failure
    }
    setSending(false);
  }

  if (!session) return null;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold text-slate-900 mb-6">Messages</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-[calc(100vh-250px)] min-h-[500px]">
        {/* Conversation list */}
        <Card className="md:col-span-1 overflow-hidden flex flex-col">
          <div className="p-4 border-b border-slate-100">
            <h2 className="text-sm font-semibold text-slate-700">Conversations</h2>
          </div>
          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="p-4 space-y-3">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="animate-pulse flex items-center gap-3">
                    <div className="w-10 h-10 bg-slate-200 rounded-full" />
                    <div className="flex-1 space-y-2"><div className="h-4 bg-slate-200 rounded w-3/4" /><div className="h-3 bg-slate-200 rounded w-1/2" /></div>
                  </div>
                ))}
              </div>
            ) : conversations.length === 0 ? (
              <div className="p-8 text-center">
                <MessageSquare className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                <p className="text-sm text-slate-500">No conversations yet</p>
              </div>
            ) : (
              conversations.map((conv) => {
                if (!conv.partner) return null;
                return (
                  <button
                    key={conv.partner.id}
                    onClick={() => { setActiveChat(conv.partner!.id); setActiveName(conv.partner!.name); }}
                    className={`w-full text-left px-4 py-3 border-b border-slate-50 hover:bg-slate-50 transition-colors ${
                      activeChat === conv.partner.id ? "bg-emerald-50 border-l-2 border-l-emerald-500" : ""
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
                        <span className="text-sm font-bold text-emerald-700">
                          {conv.partner.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-slate-900 truncate">{conv.partner.name}</span>
                          {conv.unreadCount > 0 && (
                            <Badge variant="success" className="ml-2">{conv.unreadCount}</Badge>
                          )}
                        </div>
                        <p className="text-xs text-slate-500 truncate">
                          {conv.lastMessage?.body || "No messages yet"}
                        </p>
                      </div>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </Card>

        {/* Chat area */}
        <Card className="md:col-span-2 overflow-hidden flex flex-col">
          {activeChat ? (
            <>
              <div className="p-4 border-b border-slate-100 flex items-center gap-3">
                <button onClick={() => setActiveChat(null)} className="md:hidden p-1 rounded hover:bg-slate-100">
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center">
                  <span className="text-sm font-bold text-emerald-700">
                    {activeName.charAt(0).toUpperCase()}
                  </span>
                </div>
                <span className="font-medium text-slate-900">{activeName}</span>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {messages.length === 0 ? (
                  <div className="text-center py-12">
                    <MessageSquare className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                    <p className="text-sm text-slate-500">Start the conversation</p>
                  </div>
                ) : (
                  messages.map((msg) => {
                    const isMe = msg.senderId === session.user.id;
                    return (
                      <div key={msg.id} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
                        <div className={`max-w-[75%] px-4 py-2 rounded-xl text-sm ${
                          isMe
                            ? "bg-emerald-600 text-white rounded-br-sm"
                            : "bg-slate-100 text-slate-800 rounded-bl-sm"
                        }`}>
                          <p>{msg.body}</p>
                          <p className={`text-xs mt-1 ${isMe ? "text-emerald-200" : "text-slate-400"}`}>
                            {new Date(msg.createdAt).toLocaleTimeString("en-BD", {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </p>
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              <form onSubmit={handleSend} className="p-4 border-t border-slate-100 flex gap-2">
                <Input
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type a message..."
                  className="flex-1"
                />
                <Button type="submit" loading={sending} disabled={!newMessage.trim()}>
                  <Send className="w-4 h-4" />
                </Button>
              </form>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <MessageSquare className="w-16 h-16 text-slate-200 mx-auto mb-3" />
                <h3 className="text-lg font-medium text-slate-700">Select a conversation</h3>
                <p className="text-sm text-slate-500 mt-1">Choose from your existing conversations or start a new one</p>
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
