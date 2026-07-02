import { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';

export const useDoctorProfile = () => {
  const { user, isLoaded } = useUser();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      // Wait for Clerk to load
      if (!isLoaded) {
        return;
      }

      // If no user, set default and stop loading
      if (!user) {
        setProfile(null);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        // Get doctor name from user
        const doctorName = user.fullName || user.username || 'Doctor';
        const doctorEmail = user.emailAddresses?.[0]?.emailAddress || '';
        const clerkUserId = user.id;

        console.log('👨‍⚕️ Fetching doctor profile for:', clerkUserId);

        // Try to fetch existing profile
        const res = await fetch(`/api/doctor/profile?clerkUserId=${clerkUserId}`);
        
        // Check if response is OK
        if (!res.ok) {
          // If profile not found (404), create one
          if (res.status === 404) {
            console.log('📝 Profile not found, creating new profile...');
            
            const defaultProfile = {
              clerkUserId: clerkUserId,
              name: `Dr. ${doctorName}`,
              email: doctorEmail,
              gender: '',
              age: 0,
              degree: '',
              specialization: '',
              licenseNumber: '',
              contactNumber: '',
              experienceYears: 0,
              currentHospital: '',
              hospitalExperience: [],
            };

            // Create profile
            const createRes = await fetch('/api/doctor/profile', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(defaultProfile),
            });

            const createData = await createRes.json();
            
            if (createData.success && createData.profile) {
              console.log('✅ Profile created successfully:', createData.profile);
              setProfile(createData.profile);
            } else {
              // If creation fails, use default
              console.log('⚠️ Using default profile');
              setProfile(defaultProfile);
            }
          } else {
            // Other error
            throw new Error(`HTTP error! status: ${res.status}`);
          }
        } else {
          // Check if response is JSON
          const contentType = res.headers.get('content-type');
          if (!contentType || !contentType.includes('application/json')) {
            throw new Error('Response is not JSON');
          }

          const data = await res.json();
          
          if (data.success && data.profile) {
            console.log('✅ Profile fetched successfully:', data.profile);
            // Ensure name has "Dr." prefix if not already
            const profileData = data.profile;
            if (profileData.name && !profileData.name.startsWith('Dr. ')) {
              profileData.name = `Dr. ${profileData.name}`;
            }
            setProfile(profileData);
          } else {
            // If no profile data, create default
            console.log('⚠️ No profile data, creating default');
            const defaultProfile = {
              clerkUserId: clerkUserId,
              name: `Dr. ${doctorName}`,
              email: doctorEmail,
              gender: '',
              age: 0,
              degree: '',
              specialization: '',
              licenseNumber: '',
              contactNumber: '',
              experienceYears: 0,
              currentHospital: '',
              hospitalExperience: [],
            };
            setProfile(defaultProfile);
          }
        }
      } catch (error) {
        console.error('❌ Error in doctor profile hook:', error);
        setError(error.message);
        
        // Set fallback profile with user data
        if (user) {
          const doctorName = user.fullName || user.username || 'Doctor';
          setProfile({
            clerkUserId: user.id,
            name: `Dr. ${doctorName}`,
            email: user.emailAddresses?.[0]?.emailAddress || '',
            gender: '',
            age: 0,
            degree: '',
            specialization: '',
            licenseNumber: '',
            contactNumber: '',
            experienceYears: 0,
            currentHospital: '',
            hospitalExperience: [],
          });
        }
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [user, isLoaded]);

  return { profile, loading, error, user };
};

export default useDoctorProfile;