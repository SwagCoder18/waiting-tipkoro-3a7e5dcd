import { useState, useEffect } from 'react';
import { useUser } from '@clerk/clerk-react';
import { supabase } from '@/integrations/supabase/client';

export interface Profile {
  id: string;
  user_id: string;
  email: string | null;
  first_name: string | null;
  last_name: string | null;
  username: string | null;
  bio: string | null;
  avatar_url: string | null;
  account_type: 'supporter' | 'creator';
  onboarding_status: 'pending' | 'account_type' | 'payment' | 'profile' | 'completed';
  twitter: string | null;
  instagram: string | null;
  youtube: string | null;
  facebook: string | null;
  other_link: string | null;
  is_verified: boolean;
  total_received: number;
  total_supporters: number;
  created_at: string;
  updated_at: string;
}

export function useProfile() {
  const { user, isLoaded } = useUser();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoaded) return;
    
    if (!user) {
      setProfile(null);
      setLoading(false);
      return;
    }

    fetchOrCreateProfile();
  }, [user, isLoaded]);

  const fetchOrCreateProfile = async () => {
    if (!user) return;

    try {
      setLoading(true);
      
      // Try to fetch existing profile
      const { data: existingProfile, error: fetchError } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (fetchError && fetchError.code !== 'PGRST116') {
        throw fetchError;
      }

      if (existingProfile) {
        setProfile(existingProfile as Profile);
      } else {
        // Create new profile
        const { data: newProfile, error: createError } = await supabase
          .from('profiles')
          .insert({
            user_id: user.id,
            email: user.primaryEmailAddress?.emailAddress || null,
            first_name: user.firstName || null,
            last_name: user.lastName || null,
            avatar_url: user.imageUrl || null,
            onboarding_status: 'pending'
          })
          .select()
          .single();

        if (createError) throw createError;
        setProfile(newProfile as Profile);
      }
    } catch (err: any) {
      console.error('Error fetching/creating profile:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (updates: Partial<Profile>) => {
    if (!user || !profile) return { error: 'No user or profile' };

    try {
      const { data, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) throw error;
      setProfile(data as Profile);
      return { data };
    } catch (err: any) {
      console.error('Error updating profile:', err);
      return { error: err.message };
    }
  };

  const refetch = () => {
    fetchOrCreateProfile();
  };

  return { profile, loading, error, updateProfile, refetch };
}
