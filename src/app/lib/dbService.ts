import { supabase } from './supabase';
import { User, Resource, Conversation, Message, Event, Meeting } from './types';

/**
 * Service for interacting with Supabase database tables.
 */
export const dbService = {
  // Profiles
  async getProfile(id: string): Promise<User | null> {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching profile:', error);
      return null;
    }

    return {
      id: data.id,
      username: data.username,
      name: data.full_name,
      email: data.email,
      college: data.college,
      skills: data.skills || [],
      interests: data.interests || [],
      experience: data.experience,
      bio: data.bio,
      availability: data.availability,
      profileImage: data.avatar_url,
    } as User;
  },

  async upsertProfile(user: User): Promise<void> {
    console.log('dbService: upserting profile for', user.email);
    const { error } = await supabase
      .from('profiles')
      .upsert({
        id: user.id,
        username: user.username || (user.email.split('@')[0] + '_' + Math.random().toString(36).slice(-4)),
        full_name: user.name,
        email: user.email,
        avatar_url: user.profileImage,
        college: user.college,
        skills: user.skills,
        interests: user.interests,
        experience: user.experience,
        bio: user.bio,
        availability: user.availability,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'id' });

    if (error) {
      console.error('Error upserting profile:', error);
      throw error;
    }
  },

  async getAllProfiles(): Promise<User[]> {
    const { data, error } = await supabase
      .from('profiles')
      .select('*');

    if (error) {
      console.error('Error fetching profiles:', error);
      return [];
    }

    return data.map(item => ({
      ...item,
      name: item.full_name,
      profileImage: item.avatar_url,
    })) as User[];
  },

  // Resources
  async getResources(): Promise<Resource[]> {
    const { data, error } = await supabase
      .from('resources')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching resources:', error);
      return [];
    }

    return data.map(item => ({
      ...item,
      createdAt: new Date(item.created_at),
    })) as Resource[];
  },

  async addResource(resource: Partial<Resource>): Promise<Resource | null> {
    const { data, error } = await supabase
      .from('resources')
      .insert({
        title: resource.title,
        link: resource.link,
        category: resource.category,
        tags: resource.tags,
        description: resource.description,
        author_id: resource.createdBy,
      })
      .select()
      .single();

    if (error) {
      console.error('Error adding resource:', error);
      return null;
    }

    return {
      ...data,
      createdAt: new Date(data.created_at),
    } as Resource;
  },

  async upvoteResource(id: string): Promise<void> {
    const { error } = await supabase.rpc('increment_upvotes', { resource_id: id });

    // Fallback if RPC is not set up yet
    if (error) {
      console.error('RPC failed, trying manual update:', error);
      const { data: current } = await supabase.from('resources').select('upvotes').eq('id', id).single();
      await supabase.from('resources').update({ upvotes: (current?.upvotes || 0) + 1 }).eq('id', id);
    }
  },

  // Messaging
  async getConversations(): Promise<Conversation[]> {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) return [];

    const { data, error } = await supabase
      .from('conversation_members')
      .select('conversation_id, conversations(*)')
      .eq('user_id', session.user.id);

    if (error) {
      console.error('Error fetching conversations:', error);
      return [];
    }

    const conversations = await Promise.all((data || []).map(async (item: any) => {
      const conv = item.conversations;
      const { data: members } = await supabase
        .from('conversation_members')
        .select('user_id, profiles!inner(*)')
        .eq('conversation_id', conv.id)
        .neq('user_id', session.user.id);

      // Handle the case where profiles might be returned as an array or object
      const otherUserRaw = members?.[0]?.profiles;
      const otherUser = Array.isArray(otherUserRaw) ? otherUserRaw[0] : otherUserRaw;

      const { data: lastMsg } = await supabase
        .from('messages')
        .select('text, created_at')
        .eq('conversation_id', conv.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      return {
        id: conv.id,
        created_at: conv.created_at,
        lastMessage: lastMsg?.text || 'No messages yet',
        lastMessageTime: lastMsg?.created_at || conv.created_at,
        participants: otherUser ? [{
          id: otherUser.id,
          name: otherUser.full_name,
          profileImage: otherUser.avatar_url,
          username: otherUser.username
        }] : [],
      } as Conversation;
    }));

    return conversations;
  },

  async getMessages(conversationId: string): Promise<Message[]> {
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching messages:', error);
      return [];
    }

    return data as Message[];
  },

  async sendMessage(conversationId: string, text: string): Promise<Message | null> {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) return null;

    const { data, error } = await supabase
      .from('messages')
      .insert({
        conversation_id: conversationId,
        sender_id: session.user.id,
        text,
      })
      .select()
      .single();

    if (error) {
      console.error('Error sending message:', error);
      return null;
    }

    return data as Message;
  },

  // Events
  async getEvents(): Promise<Event[]> {
    const { data, error } = await supabase
      .from('events')
      .select('*, event_registrations(user_id)')
      .order('date', { ascending: true });

    if (error) {
      console.error('Error fetching events:', error);
      return [];
    }

    const { data: { session } } = await supabase.auth.getSession();

    return (data || []).map(event => ({
      ...event,
      endDate: event.end_date,
      organizerId: event.organizer_id,
      maxParticipants: event.max_participants || 100,
      teamSize: event.team_size || 1,
      publishedDate: event.published_date,
      registrations: event.registrations || 0,
      interested: event.interested || 0,
      views: event.views || 0,
      registered: event.event_registrations?.some((r: any) => r.user_id === session?.user?.id)
    })) as Event[];
  },

  async createEvent(event: Partial<Event>): Promise<Event | null> {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) return null;

    const { data, error } = await supabase
      .from('events')
      .insert({
        title: event.title,
        description: event.description,
        type: event.type,
        date: event.date,
        end_date: event.endDate,
        location: event.location,
        mode: event.mode,
        prize: event.prize,
        tags: event.tags,
        difficulty: event.difficulty,
        status: event.status || 'Draft',
        max_participants: event.maxParticipants,
        team_size: event.teamSize,
        organizer_id: session.user.id,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating event:', error);
      return null;
    }

    return {
      ...data,
      endDate: data.end_date,
      organizerId: data.organizer_id,
      maxParticipants: data.max_participants,
      teamSize: data.team_size,
    } as Event;
  },

  async updateEvent(id: string, updates: Partial<Event>): Promise<boolean> {
    const { error } = await supabase
      .from('events')
      .update({
        title: updates.title,
        description: updates.description,
        type: updates.type,
        date: updates.date,
        end_date: updates.endDate,
        location: updates.location,
        mode: updates.mode,
        prize: updates.prize,
        tags: updates.tags,
        difficulty: updates.difficulty,
        status: updates.status,
        max_participants: updates.maxParticipants,
        team_size: updates.teamSize,
        published_date: updates.publishedDate,
      })
      .eq('id', id);

    if (error) {
      console.error('Error updating event:', error);
      return false;
    }

    return true;
  },

  async deleteEvent(id: string): Promise<boolean> {
    const { error } = await supabase
      .from('events')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting event:', error);
      return false;
    }

    return true;
  },

  async registerForEvent(eventId: string): Promise<boolean> {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) return false;

    const { error } = await supabase
      .from('event_registrations')
      .upsert({
        event_id: eventId,
        user_id: session.user.id,
      });

    if (error) {
      console.error('Error registering for event:', error);
      return false;
    }

    return true;
  },

  // Meetings
  async getMeetings(): Promise<Meeting[]> {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) return [];

    const { data, error } = await supabase
      .from('meetings')
      .select('*')
      .eq('host_id', session.user.id)
      .order('start_time', { ascending: true });

    if (error) {
      console.error('Error fetching meetings:', error);
      return [];
    }

    return (data || []).map(m => ({
      id: m.id,
      title: m.title,
      description: m.description,
      meetingId: m.meeting_id,
      hostId: m.host_id,
      startTime: m.start_time,
      durationMinutes: m.duration_minutes,
      meetingLink: m.meeting_link,
      status: m.status,
    })) as Meeting[];
  },

  async createMeeting(meeting: Partial<Meeting>): Promise<Meeting | null> {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) return null;

    const { data, error } = await supabase
      .from('meetings')
      .insert({
        title: meeting.title,
        description: meeting.description,
        meeting_id: meeting.meetingId,
        host_id: session.user.id,
        start_time: meeting.startTime,
        duration_minutes: meeting.durationMinutes,
        meeting_link: meeting.meetingLink,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating meeting:', error);
      return null;
    }

    return data as Meeting;
  }
};
