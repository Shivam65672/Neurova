import { useEffect, useState } from 'react';
import { useUser } from '@clerk/nextjs';

export function usePatientProfile() {
  const { user, isLoaded } = useUser();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isLoaded && user) {
      fetchProfile();
    }
  }, [user, isLoaded]);

  const fetchProfile = async () => {
    try {
      const res = await fetch(`/api/user/profile?clerkUserId=${user.id}`);
      if (res.ok) {
        const data = await res.json();
        setProfile(data);
      }
    } catch (err) {
      console.error("Error fetching profile:", err);
    } finally {
      setLoading(false);
    }
  };

  return { profile, loading, user };
}

export default usePatientProfile;
