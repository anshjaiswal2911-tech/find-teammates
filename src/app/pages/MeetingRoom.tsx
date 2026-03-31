import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Video,
  VideoOff,
  PhoneOff,
  Users,
  MoreVertical,
  Plus,
  Calendar,
  Clock,
  User,
  Link2,
  Copy,
  CheckCircle,
  Trash2,
  LogIn,
  ExternalLink,
  X
} from 'lucide-react';
import { Card, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';
import { DashboardLayout } from '../components/DashboardLayout';
import { dbService } from '../lib/dbService';
import { Meeting } from '../lib/types';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

export function MeetingRoom() {
  const { user } = useAuth();
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [activeMeeting, setActiveMeeting] = useState<Meeting | null>(null);
  const [showNotification, setShowNotification] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState('');
  
  // Form state
  const [formData, setFormData] = useState({
    title: '',
    date: new Date().toISOString().split('T')[0],
    time: '10:00',
    duration: '30',
    description: '',
  });

  const loadMeetings = async () => {
    setLoading(true);
    const data = await dbService.getMeetings();
    setMeetings(data);
    setLoading(false);
  };

  useEffect(() => {
    if (user) loadMeetings();
  }, [user]);

  const handleCreateMeeting = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    const meetingId = Math.random().toString(36).substring(2, 11).toUpperCase();
    const startTime = `${formData.date}T${formData.time}:00`;

    const newMeeting = await dbService.createMeeting({
      title: formData.title,
      meetingId: meetingId,
      startTime: startTime,
      durationMinutes: parseInt(formData.duration),
      description: formData.description,
      meetingLink: `https://p2p.mirotalk.com/join/${meetingId}`,
      status: 'Scheduled'
    });

    if (newMeeting) {
      setShowCreateModal(false);
      showNotificationMessage('Meeting created successfully!');
      loadMeetings();
    }
  };

  const handleJoinMeeting = (meeting: Meeting) => {
    setActiveMeeting(meeting);
    // Optionally update status in DB to 'Active'
    supabase.from('meetings').update({ status: 'Active' }).eq('id', meeting.id);
  };

  const handleEndMeeting = () => {
    if (activeMeeting) {
      supabase.from('meetings').update({ status: 'Ended' }).eq('id', activeMeeting.id);
    }
    setActiveMeeting(null);
  };

  const handleDeleteMeeting = async (meetingId: string) => {
    if (confirm('Are you sure you want to delete this meeting?')) {
      const { error } = await supabase.from('meetings').delete().eq('id', meetingId);
      if (!error) {
        showNotificationMessage('Meeting deleted');
        loadMeetings();
      }
    }
  };

  const handleCopyLink = (meetingId: string) => {
    const link = `https://p2p.mirotalk.com/join/${meetingId}`;
    navigator.clipboard.writeText(link);
    showNotificationMessage('Meeting link copied to clipboard!');
  };

  const showNotificationMessage = (message: string) => {
    setNotificationMessage(message);
    setShowNotification(true);
    setTimeout(() => setShowNotification(false), 3000);
  };

  if (activeMeeting) {
    return (
      <DashboardLayout>
        <div className="h-[calc(100vh-8rem)] flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-xl md:text-2xl font-bold text-gray-900">{activeMeeting.title}</h1>
              <p className="text-xs md:text-sm text-gray-500">Live Video Session • MiroTalk P2P</p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => window.open(activeMeeting.meetingLink, '_blank')}>
                <ExternalLink className="h-4 w-4 mr-2" /> Open in New Tab
              </Button>
              <Button variant="destructive" size="sm" onClick={handleEndMeeting}>
                <PhoneOff className="h-4 w-4 mr-2" /> End Call
              </Button>
            </div>
          </div>

          <div className="flex-1 bg-gray-900 rounded-xl overflow-hidden relative border-4 border-gray-800 shadow-2xl">
            <iframe
              src={activeMeeting.meetingLink}
              allow="camera; microphone; display-capture; fullscreen; clipboard-read; clipboard-write; autoplay"
              className="w-full h-full border-none"
              title="MiroTalk Video Call"
            />
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <Video className="h-8 w-8 text-blue-600" />
            <h1 className="text-2xl md:text-4xl font-black text-gray-900 tracking-tight">Meeting Room</h1>
          </div>
          <p className="text-gray-600">Connect with your team via real-time video calls.</p>
        </div>
        <Button onClick={() => setShowCreateModal(true)} className="hidden md:flex">
          <Plus className="h-4 w-4 mr-2" /> Create Meeting
        </Button>
      </div>

      <div className="grid gap-4">
        {loading ? (
          <div className="p-12 text-center text-gray-500">Loading meetings...</div>
        ) : meetings.length === 0 ? (
          <Card className="p-12 text-center bg-white/50 border-dashed border-2 border-gray-200">
            <Video className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-900 mb-2">No meetings scheduled</h3>
            <p className="text-gray-600 mb-6 font-medium">Host a session and invite your teammates to collaborate.</p>
            <Button onClick={() => setShowCreateModal(true)} size="lg" className="bg-blue-600 hover:bg-blue-700 shadow-lg px-8">
              <Plus className="h-5 w-5 mr-2" /> Start Now
            </Button>
          </Card>
        ) : (
          meetings.map((meeting) => (
            <motion.div key={meeting.id} whileHover={{ scale: 1.01 }}>
              <Card className="hover:shadow-xl transition-all border-none bg-white/80 backdrop-blur-sm">
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-xl font-bold text-gray-900">{meeting.title}</h3>
                        <Badge className={`${meeting.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'} border`}>
                          {meeting.status}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-y-2 gap-x-4 text-sm text-gray-500">
                        <span className="flex items-center gap-1"><Calendar className="h-4 w-4" /> {new Date(meeting.startTime).toLocaleDateString()}</span>
                        <span className="flex items-center gap-1"><Clock className="h-4 w-4" /> {new Date(meeting.startTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                        <span className="flex items-center gap-1"><User className="h-4 w-4" /> Host: You</span>
                      </div>
                    </div>
                    <div className="flex gap-2 w-full md:w-auto">
                      <Button onClick={() => handleJoinMeeting(meeting)} className="flex-1 md:flex-none bg-blue-600">
                        <LogIn className="h-4 w-4 mr-2" /> Join
                      </Button>
                      <Button variant="outline" size="icon" onClick={() => handleCopyLink(meeting.meetingId)}>
                        <Copy className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="icon" onClick={() => handleDeleteMeeting(meeting.id)} className="text-red-500 hover:bg-red-50">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))
        )}
      </div>

      <AnimatePresence>
        {showCreateModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="w-full max-w-lg bg-white rounded-xl shadow-2xl p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Schedule Meeting</h2>
                <Button variant="ghost" onClick={() => setShowCreateModal(false)}><X /></Button>
              </div>
              <form onSubmit={handleCreateMeeting} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Title</label>
                  <Input required value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} placeholder="Project Sync" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Date</label>
                    <Input type="date" required value={formData.date} onChange={(e) => setFormData({...formData, date: e.target.value})} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Time</label>
                    <Input type="time" required value={formData.time} onChange={(e) => setFormData({...formData, time: e.target.value})} />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Description</label>
                  <Input value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} placeholder="Brief agenda" />
                </div>
                <Button type="submit" className="w-full bg-blue-600 mt-4 py-6 text-lg font-bold">Create Meeting Room</Button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showNotification && (
          <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} className="fixed bottom-8 right-8 z-50 bg-green-600 text-white px-6 py-3 rounded-full shadow-2xl flex items-center gap-2 font-bold">
            <CheckCircle className="h-5 w-5" /> {notificationMessage}
          </motion.div>
        )}
      </AnimatePresence>
    </DashboardLayout>
  );
}
