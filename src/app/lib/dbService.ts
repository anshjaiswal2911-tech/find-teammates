import { supabase } from './supabase';
import { User, Resource } from './types';

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
  }
};
