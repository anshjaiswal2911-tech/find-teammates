// Type definitions for CollabNest

export interface User {
  id: string;
  username?: string;
  name: string;
  email: string;
  college: string;
  skills: string[];
  interests: string[];
  experience: 'Beginner' | 'Intermediate' | 'Advanced';
  bio: string;
  availability: 'Full-time' | 'Part-time' | 'Weekends';
  profileImage?: string;
}

export interface Resource {
  id: string;
  title: string;
  link: string;
  category: 'GitHub' | 'YouTube' | 'Docs' | 'Course' | 'Blog';
  tags: string[];
  upvotes: number;
  createdBy: string;
  createdAt: Date;
  description?: string;
  difficulty?: 'Beginner' | 'Intermediate' | 'Advanced';
  duration?: string;
  author?: string;
  language?: string;
  thumbnail_url?: string;
  source?: string;
}

export interface Conversation {
  id: string;
  created_at: string;
  lastMessage?: string;
  lastMessageTime?: string;
  participants?: User[];
  messages?: Message[];
}

export interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  text: string;
  is_read: boolean;
  created_at: string;
}

export interface Event {
  id: string;
  title: string;
  description: string;
  type: 'Hackathon' | 'Workshop' | 'Webinar' | 'Conference';
  date: string;
  endDate?: string;
  location: string;
  mode: 'Online' | 'Offline' | 'Hybrid';
  prize: string;
  tags: string[];
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  organizerId?: string;
  status?: 'Draft' | 'Published' | 'Ongoing' | 'Completed';
  maxParticipants?: number;
  teamSize?: number;
  publishedDate?: string;
  registrations?: number;
  interested?: number;
  views?: number;
  organizer?: string;
  teamMembers?: string[];
  registered?: boolean;
}

export interface Meeting {
  id: string;
  title: string;
  description?: string;
  meetingId: string;
  hostId: string;
  startTime: string;
  durationMinutes: number;
  meetingLink?: string;
  status: 'Scheduled' | 'Active' | 'Ended';
}

export interface Match {
  id: string;
  user: User;
  compatibilityScore: number;
  explanation: string;
  skillOverlap: string[];
  complementarySkills: string[];
  isSuperLike?: boolean;
}

export interface SkillGapAnalysis {
  role: string;
  currentSkills: string[];
  missingSkills: string[];
  recommendedPath: string[];
  progress: number;
}

export interface ProjectIdea {
  title: string;
  problemStatement: string;
  features: string[];
  techStack: string[];
  mvpScope: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
}

export interface AnalyticsData {
  totalMatches: number;
  avgCompatibility: number;
  resourcesSaved: number;
  skillsLearned: number;
  weeklyActivity: { day: string; matches: number; resources: number }[];
  skillDistribution: { skill: string; count: number }[];
}