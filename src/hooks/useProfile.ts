import { useState, useEffect, useCallback } from 'react';
import { useUser } from '@clerk/clerk-react';
import { useSupabaseWithAuth } from './useSupabaseWithAuth';

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

const MAX_RETRIES = 5;
const RETRY_DELAY = 1000; // 1 second

export function useProfile() {
  const { user, isLoaded } = useUser();
  const supabase = useSupabaseWithAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProfile = useCallback(async (retryCount = 0): Promise<void> => {
    if (!user) return;

    try {
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
        setError(null);
      } else if (retryCount < MAX_RETRIES) {
        // Profile not found - Clerk webhook might not have created it yet
        // Wait and retry with exponential backoff
        const delay = RETRY_DELAY * Math.pow(2, retryCount);
        console.log(`Profile not found, retrying in ${delay}ms (attempt ${retryCount + 1}/${MAX_RETRIES})`);
        await new Promise(resolve => setTimeout(resolve, delay));
        return fetchProfile(retryCount + 1);
      } else {
        // Max retries exceeded - profile still not created
        setError('Profile not found. Please try refreshing the page.');
        console.error('Profile not found after max retries');
      }
    } catch (err: any) {
      console.error('Error fetching profile:', err);
      setError(err.message);
    }
  }, [user, supabase]);

  useEffect(() => {
    if (!isLoaded) return;
    
    if (!user) {
      setProfile(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    fetchProfile().finally(() => setLoading(false));
  }, [user, isLoaded, fetchProfile]);

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
    setLoading(true);
    fetchProfile().finally(() => setLoading(false));
  };

  return { profile, loading, error, updateProfile, refetch };
}
