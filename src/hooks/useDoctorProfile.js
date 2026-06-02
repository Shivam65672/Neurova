import { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';

export const useDoctorProfile = () => {
  const { user, isLoaded } = useUser();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!isLoaded || !user) {
        setLoading(false);
        return;
      }

      try {
        const res = await fetch(`/api/doctor/profile?clerkUserId=${user.id}`);
        const data = await res.json();
        
        if (data.success && data.profile) {
          setProfile(data.profile);
        }
      } catch (error) {
        console.error('Error fetching doctor profile:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [user, isLoaded]);

  return { profile, loading, user };
};

export default useDoctorProfile;
