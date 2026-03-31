import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Calendar,
  MapPin,
  Users,
  Trophy,
  Clock,
  Bookmark,
  Share2,
  Search,
  Sparkles,
  Rocket,
  Code2,
  Target,
  X,
  ChevronDown,
  ChevronUp,
  CheckCircle,
} from 'lucide-react';
import { Card, CardContent } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { DashboardLayout } from '../components/DashboardLayout';
import { dbService } from '../lib/dbService';
import { Event as AppEvent } from '../lib/types';
import { useAuth } from '../contexts/AuthContext';

export function Events() {
  const { user } = useAuth();
  const [events, setEvents] = useState<AppEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<string>('All');
  const [filterMode, setFilterMode] = useState<string>('All');
  const [filterBookmarked, setFilterBookmarked] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<AppEvent | null>(null);
  const [showRegistrationModal, setShowRegistrationModal] = useState(false);
  const [expandedEventId, setExpandedEventId] = useState<string | null>(null);
  const [showNotification, setShowNotification] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState('');
  const [bookmarkedIds, setBookmarkedIds] = useState<string[]>([]);

  // Registration form state
  const [formData, setFormData] = useState({
    teamName: '',
    teamSize: '1',
    memberNames: '',
    email: '',
    phone: '',
    college: '',
    whyParticipate: '',
    experience: 'Beginner',
    github: '',
  });

  const loadEvents = async () => {
    setLoading(true);
    const data = await dbService.getEvents();
    setEvents(data);
    setLoading(false);
  };

  useEffect(() => {
    loadEvents();
    const savedBookmarks = JSON.parse(localStorage.getItem('bookmarkedEventIds') || '[]');
    setBookmarkedIds(savedBookmarks);
  }, []);

  const handleBookmark = (eventId: string) => {
    let updated;
    if (bookmarkedIds.includes(eventId)) {
      updated = bookmarkedIds.filter(id => id !== eventId);
    } else {
      updated = [...bookmarkedIds, eventId];
    }
    setBookmarkedIds(updated);
    localStorage.setItem('bookmarkedEventIds', JSON.stringify(updated));
    showNotificationMessage(updated.includes(eventId) ? 'Added to bookmarks! 🔖' : 'Removed from bookmarks');
  };

  const handleRegisterClick = (event: AppEvent) => {
    if (!user) {
      showNotificationMessage('Please login to register for events');
      return;
    }
    setSelectedEvent(event);
    setShowRegistrationModal(true);
  };

  const handleSubmitRegistration = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEvent || !user) return;

    const success = await dbService.registerForEvent(selectedEvent.id);
    if (success) {
      setShowRegistrationModal(false);
      showNotificationMessage(`Successfully registered for ${selectedEvent.title}!`);
      loadEvents(); // Refresh status
    } else {
      showNotificationMessage('Registration failed. Please try again.');
    }
  };

  const showNotificationMessage = (message: string) => {
    setNotificationMessage(message);
    setShowNotification(true);
    setTimeout(() => setShowNotification(false), 4000);
  };

  const filteredEvents = events.filter(event => {
    const matchesSearch = event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesType = filterType === 'All' || event.type === filterType;
    const matchesMode = filterMode === 'All' || event.mode === filterMode;
    const matchesBookmark = !filterBookmarked || bookmarkedIds.includes(event.id);
    return matchesSearch && matchesType && matchesMode && matchesBookmark;
  });

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'Hackathon': return Trophy;
      case 'Workshop': return Code2;
      case 'Webinar': return Sparkles;
      default: return Calendar;
    }
  };

  return (
    <DashboardLayout>
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <Calendar className="h-8 w-8 text-blue-600" />
          <h1 className="text-2xl md:text-4xl font-black text-gray-900 tracking-tight">Events & Hackathons</h1>
        </div>
        <p className="text-gray-600">Discover and participate in exciting tech events globally.</p>
      </div>

      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="Search events..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="rounded-lg border border-gray-300 px-3 py-2"
            >
              <option>All</option>
              <option>Hackathon</option>
              <option>Workshop</option>
              <option>Webinar</option>
              <option>Conference</option>
            </select>
            <Button
              variant={filterBookmarked ? 'default' : 'outline'}
              onClick={() => setFilterBookmarked(!filterBookmarked)}
            >
              <Bookmark className={`h-4 w-4 mr-2 ${filterBookmarked ? 'fill-white' : ''}`} />
              Bookmarks
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4">
        {loading ? (
          <div className="p-12 text-center text-gray-500">Loading events...</div>
        ) : filteredEvents.length === 0 ? (
          <div className="p-12 text-center text-gray-500 border rounded-xl bg-white">
            <Calendar className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p>No events found matching your criteria.</p>
          </div>
        ) : (
          filteredEvents.map((event) => {
            const TypeIcon = getTypeIcon(event.type);
            const isBookmarked = bookmarkedIds.includes(event.id);
            return (
              <motion.div key={event.id} whileHover={{ x: 5 }}>
                <Card className="overflow-hidden border-none shadow-lg">
                  <CardContent className="p-6">
                    <div className="flex flex-col md:flex-row gap-6">
                      <div className="h-16 w-16 md:h-20 md:w-20 rounded-2xl bg-gradient-to-br from-blue-600 to-purple-700 flex items-center justify-center shadow-lg flex-shrink-0">
                        <TypeIcon className="h-8 w-8 text-white" />
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="text-xl font-bold text-gray-900">{event.title}</h3>
                          <Badge className="bg-blue-100 text-blue-700">{event.type}</Badge>
                        </div>
                        <p className="text-gray-600 mb-4 line-clamp-2">{event.description}</p>
                        <div className="flex flex-wrap gap-4 text-sm text-gray-500 mb-4">
                          <span className="flex items-center gap-1"><Calendar className="h-4 w-4" /> {event.date}</span>
                          <span className="flex items-center gap-1"><MapPin className="h-4 w-4" /> {event.mode}</span>
                          <span className="flex items-center gap-1"><Trophy className="h-4 w-4" /> {event.prize}</span>
                        </div>
                        <div className="flex gap-2">
                          <Button 
                            onClick={() => handleRegisterClick(event)}
                            disabled={event.registered}
                            className={event.registered ? 'bg-green-600' : ''}
                          >
                            {event.registered ? 'Registered ✓' : 'Register'}
                          </Button>
                          <Button variant="outline" onClick={() => handleBookmark(event.id)}>
                            <Bookmark className={`h-4 w-4 ${isBookmarked ? 'fill-purple-600 text-purple-600' : ''}`} />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })
        )}
      </div>

      {/* Registration Modal */}
      <AnimatePresence>
        {showRegistrationModal && selectedEvent && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="w-full max-w-lg bg-white rounded-xl shadow-2xl p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">Register: {selectedEvent.title}</h2>
                <Button variant="ghost" onClick={() => setShowRegistrationModal(false)}><X /></Button>
              </div>
              <form onSubmit={handleSubmitRegistration} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Team Name (Optional)</label>
                  <Input value={formData.teamName} onChange={(e) => setFormData({...formData, teamName: e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Email</label>
                  <Input type="email" required value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} />
                </div>
                <div className="pt-4 flex gap-3">
                  <Button type="button" variant="outline" className="flex-1" onClick={() => setShowRegistrationModal(false)}>Cancel</Button>
                  <Button type="submit" className="flex-1 bg-blue-600">Confirm Registration</Button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showNotification && (
          <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} className="fixed bottom-8 right-8 z-50 bg-green-600 text-white px-6 py-3 rounded-full shadow-2xl flex items-center gap-2">
            <CheckCircle className="h-5 w-5" /> {notificationMessage}
          </motion.div>
        )}
      </AnimatePresence>
    </DashboardLayout>
  );
}