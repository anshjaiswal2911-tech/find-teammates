import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router';
import { motion, AnimatePresence } from 'motion/react';
import {
  Search,
  Send,
  MoreVertical,
  Phone,
  Video,
  Paperclip,
  Smile,
  CheckCheck,
  ArrowLeft
} from 'lucide-react';
import { Card, CardContent } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import { DashboardLayout } from '../components/DashboardLayout';
import { useAuth } from '../contexts/AuthContext';
import { dbService } from '../lib/dbService';
import { Conversation, Message } from '../lib/types';
import { supabase } from '../lib/supabase';

export function Messages() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [messageText, setMessageText] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [mobileView, setMobileView] = useState<'list' | 'chat'>('list');
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom of chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Load conversations
  useEffect(() => {
    const loadConversations = async () => {
      setLoading(true);
      const data = await dbService.getConversations();
      setConversations(data);
      if (data.length > 0 && !selectedConversation) {
        setSelectedConversation(data[0]);
      }
      setLoading(false);
    };

    if (user) {
      loadConversations();
    }
  }, [user]);

  // Load messages for selected conversation
  useEffect(() => {
    if (!selectedConversation) return;

    const loadMessages = async () => {
      const data = await dbService.getMessages(selectedConversation.id);
      setMessages(data);
    };

    loadMessages();

    // Subscribe to real-time updates for this conversation
    const channel = supabase
      .channel(`chat_${selectedConversation.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${selectedConversation.id}`,
        },
        (payload) => {
          const newMessage = payload.new as Message;
          setMessages((prev) => {
            if (prev.find(m => m.id === newMessage.id)) return prev;
            return [...prev, newMessage];
          });
          
          setConversations(prev => prev.map(c => 
            c.id === selectedConversation.id 
              ? { ...c, lastMessage: newMessage.text, lastMessageTime: newMessage.created_at }
              : c
          ));
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [selectedConversation]);

  // Handle new chat partner from localStorage
  useEffect(() => {
    const handleNewPartner = async () => {
      const newPartnerData = localStorage.getItem('newChatPartner');
      if (!newPartnerData || !user?.id) return;

      try {
        const partner = JSON.parse(newPartnerData);
        console.log('Starting new chat with:', partner);

        // Check if conversation already exists
        const existingConv = conversations.find(c => 
          c.participants?.some(p => p.id === partner.id)
        );

        if (existingConv) {
          console.log('Using existing conversation:', existingConv.id);
          setSelectedConversation(existingConv);
          setMobileView('chat');
          localStorage.removeItem('newChatPartner');
          return;
        }

        // Create new conversation
        const { data: conv, error: convError } = await supabase
          .from('conversations')
          .insert({})
          .select()
          .single();

        if (convError) {
          console.error('Error creating conversation:', convError);
          // Fallback: Create a local conversation object
          const localConversation = {
            id: `local-${Date.now()}`,
            created_at: new Date().toISOString(),
            participants: [
              {
                id: user.id,
                name: user.name || 'You',
                email: user.email,
                profileImage: user.profileImage,
                skills: [],
                interests: [],
                college: '',
                experience: 'Beginner' as const,
                availability: 'Weekends' as const,
              },
              {
                id: partner.id,
                name: partner.name,
                email: '',
                profileImage: partner.image,
                skills: [],
                interests: [],
                college: partner.role,
                experience: 'Beginner' as const,
                availability: 'Weekends' as const,
              },
            ],
            messages: [],
          };
          setSelectedConversation(localConversation as any);
          setMobileView('chat');
          localStorage.removeItem('newChatPartner');
          return;
        }

        if (!conv) {
          console.warn('No conversation returned');
          return;
        }

        // Add conversation members
        const { error: memberError } = await supabase
          .from('conversation_members')
          .insert([
            { conversation_id: conv.id, user_id: user.id },
            { conversation_id: conv.id, user_id: partner.id },
          ]);

        if (memberError) {
          console.error('Error adding members:', memberError);
        }

        // Refresh conversations list
        const updatedConversations = await dbService.getConversations();
        setConversations(updatedConversations);

        // Find and select the new conversation
        const newConv = updatedConversations.find(c => c.id === conv.id);
        if (newConv) {
          setSelectedConversation(newConv);
          setMobileView('chat');
        }

        localStorage.removeItem('newChatPartner');
      } catch (e) {
        console.error('Error initiating new chat:', e);
        alert('Could not start chat. Please try again.');
      }
    };

    if (user?.id && !loading) {
      handleNewPartner();
    }
  }, [user?.id, loading]);

  const handleSendMessage = async () => {
    if (!messageText.trim() || !selectedConversation || !user) return;
    const textToSend = messageText;
    setMessageText('');
    await dbService.sendMessage(selectedConversation.id, textToSend);
  };

  const filteredConversations = conversations.filter(conv =>
    conv.participants?.[0]?.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatTime = (timeStr?: string) => {
    if (!timeStr) return '';
    const date = new Date(timeStr);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return date.toLocaleDateString();
  };

  return (
    <DashboardLayout>
      <div className="mb-6 flex items-center gap-4">
        <Button
          variant="outline"
          size="icon"
          onClick={() => navigate('/dashboard')}
          className="rounded-full hover:bg-gray-100 border-gray-200"
        >
          <ArrowLeft className="h-5 w-5 text-gray-600" />
        </Button>
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-gray-900 tracking-tight">Messages</h1>
          <p className="hidden md:block mt-1 text-sm text-gray-600">Chat with your teammates in real-time</p>
        </div>
      </div>

      <Card className="h-[calc(100vh-180px)] md:h-[calc(100vh-200px)] overflow-hidden border-none md:border shadow-xl">
        <CardContent className="p-0 h-full flex relative">
          {/* Conversations List */}
          <div className={`${mobileView === 'chat' ? 'hidden' : 'flex'} md:flex w-full md:w-80 border-r border-gray-200 flex-col bg-white shadow-sm z-10`}>
            <div className="p-4 border-b border-gray-200">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <Input
                  placeholder="Search conversations..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto">
              {loading ? (
                <div className="p-8 text-center text-gray-500">Loading chats...</div>
              ) : filteredConversations.length === 0 ? (
                <div className="p-8 text-center text-gray-500 text-sm">No conversations found.</div>
              ) : (
                filteredConversations.map((conv) => {
                  const partner = conv.participants?.[0];
                  return (
                    <motion.div
                      key={conv.id}
                      whileHover={{ backgroundColor: '#F9FAFB' }}
                      onClick={() => {
                        setSelectedConversation(conv);
                        setMobileView('chat');
                      }}
                      className={`p-4 cursor-pointer border-b border-gray-100 ${selectedConversation?.id === conv.id ? 'bg-blue-50' : ''}`}
                    >
                      <div className="flex items-start gap-3">
                        <div className="relative">
                          {partner?.profileImage ? (
                            <img
                              src={partner.profileImage}
                              alt={partner.name}
                              className="h-12 w-12 rounded-full object-cover border border-gray-100"
                              referrerPolicy="no-referrer"
                            />
                          ) : (
                            <div className="h-12 w-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold flex-shrink-0">
                              {partner?.name.charAt(0)}
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-semibold text-gray-900 truncate">{partner?.name}</span>
                            <span className="text-xs text-gray-500">{formatTime(conv.lastMessageTime)}</span>
                          </div>
                          <p className="text-sm text-gray-600 truncate">{conv.lastMessage}</p>
                        </div>
                      </div>
                    </motion.div>
                  );
                })
              )}
            </div>
          </div>

          {/* Chat Area */}
          {selectedConversation ? (
            <div className={`${mobileView === 'list' ? 'hidden' : 'flex'} md:flex flex-1 flex flex-col bg-white absolute inset-0 md:relative`}>
              <div className="p-3 md:p-4 border-b border-gray-200 flex items-center justify-between bg-white/80 backdrop-blur-sm z-20">
                <div className="flex items-center gap-2 md:gap-3">
                  <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setMobileView('list')}>
                    <ArrowLeft className="h-5 w-5" />
                  </Button>
                  <div className="relative">
                    {selectedConversation.participants?.[0]?.profileImage ? (
                      <img
                        src={selectedConversation.participants[0].profileImage}
                        alt={selectedConversation.participants[0].name}
                        className="h-10 w-10 rounded-full object-cover border border-gray-100"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold">
                        {selectedConversation.participants?.[0]?.name.charAt(0)}
                      </div>
                    )}
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">{selectedConversation.participants?.[0]?.name}</div>
                    <div className="text-sm text-gray-500">Supabase Realtime enabled</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="sm"><Phone className="h-4 w-4" /></Button>
                  <Button variant="ghost" size="sm" onClick={() => navigate('/meeting-room')}><Video className="h-4 w-4" /></Button>
                  <Button variant="ghost" size="sm"><MoreVertical className="h-4 w-4" /></Button>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
                {messages.map((message) => {
                  const isMe = message.sender_id === user?.id;
                  return (
                    <motion.div
                      key={message.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className={`max-w-md ${isMe ? 'order-2' : 'order-1'}`}>
                        <div className={`rounded-2xl px-4 py-2 ${isMe ? 'bg-blue-600 text-white' : 'bg-white text-gray-900 border border-gray-200'}`}>
                          <p className="text-sm">{message.text}</p>
                        </div>
                        <div className={`mt-1 text-xs text-gray-500 flex items-center gap-1 ${isMe ? 'justify-end' : 'justify-start'}`}>
                          <span>{formatTime(message.created_at)}</span>
                          {isMe && <CheckCheck className={`h-3 w-3 ${message.is_read ? 'text-blue-500' : 'text-gray-400'}`} />}
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>

              <div className="p-4 border-t border-gray-200 bg-white">
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="sm"><Paperclip className="h-5 w-5 text-gray-400" /></Button>
                  <Input
                    placeholder="Type a message..."
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                    className="flex-1"
                  />
                  <Button variant="ghost" size="sm"><Smile className="h-5 w-5 text-gray-400" /></Button>
                  <Button onClick={handleSendMessage} disabled={!messageText.trim()}>
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-gray-500 p-8 text-center">
              <div className="h-20 w-20 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                <Send className="h-10 w-10 text-gray-300" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Your Messages</h3>
              <p className="max-w-xs">Select a conversation from the sidebar to start chatting with your teammates.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </DashboardLayout>
  );
}
