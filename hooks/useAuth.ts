import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { DEMO_MODE } from '../lib/demo';
import type { Session, User } from '@supabase/supabase-js';

const ALLOWED_EMAIL_DOMAIN = '@cmail.carleton.ca';

interface UserProfile {
  id: string;
  email: string;
  name: string;
  pronouns: string[];
  gender: string;
  year: string;
  degree_level: string;
  major: string;
  bio: string | null;
  photo_url: string | null;
  status: string;
  profile_visibility: 'everyone' | 'women-nb-only';
  is_tutor: boolean;
  theme: string;
}

interface UseAuthReturn {
  session: Session | null;
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  signUp: (email: string, password: string) => Promise<{ error: string | null; needsVerification: boolean }>;
  signIn: (email: string, password: string) => Promise<{ error: string | null; needsProfile: boolean }>;
  verifyOtp: (email: string, token: string) => Promise<{ error: string | null }>;
  resendOtp: (email: string) => Promise<{ error: string | null }>;
  resetPassword: (email: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  createProfile: (profileData: CreateProfileData) => Promise<{ error: string | null }>;
  fetchProfile: () => Promise<UserProfile | null>;
  updateProfile: (updates: UpdateProfileData) => Promise<{ error: string | null }>;
  updatePassword: (currentPassword: string, newPassword: string) => Promise<{ error: string | null }>;
  updateEmail: (currentPassword: string, newEmail: string) => Promise<{ error: string | null }>;
  deleteAccount: () => Promise<{ error: string | null }>;
}

interface UpdateProfileData {
  name?: string;
  pronouns?: string[];
  gender?: string;
  year?: string;
  degreeLevel?: string;
  major?: string;
  bio?: string;
  profileVisibility?: 'everyone' | 'women-nb-only';
  photoUrl?: string | null;
  prompts?: Array<{ prompt: string; answer: string }>;
}

interface CreateProfileData {
  name: string;
  pronouns: string[];
  gender: string;
  year: string;
  degreeLevel: string;
  major: string;
  profileVisibility?: 'everyone' | 'women-nb-only';
  profileImage?: string | null;
  prompts: Array<{ prompt: string; answer: string }>;
  courses: string[];
  isTutor: boolean;
  tutorCourses?: Array<{
    courseCode: string;
    groupPrice?: number;
    individualPrice?: number;
    proofUrl?: string;
  }>;
}

// ---------------------------------------------------------------------------
// Demo mode support (EXPO_PUBLIC_DEMO_MODE=true): fully offline fake auth.
// Any email/password/OTP code works; nothing touches Supabase.
// State is in-memory only, so every app reload starts fresh at the Welcome screen.
// ---------------------------------------------------------------------------

const pendingDemoSignups = new Set<string>();
let demoProfileStore: UserProfile | null = null;

function makeDemoUser(email: string): User {
  return {
    id: 'demo-user',
    email,
    aud: 'authenticated',
    created_at: new Date().toISOString(),
    app_metadata: {},
    user_metadata: {},
  } as User;
}

function makeDemoSession(user: User): Session {
  return {
    access_token: 'demo-token',
    refresh_token: 'demo-refresh',
    token_type: 'bearer',
    expires_in: 3600,
    user,
  } as Session;
}

function makeDemoProfile(email: string, overrides: Partial<UserProfile> = {}): UserProfile {
  const localPart = email.split('@')[0]?.replace(/[^a-zA-Z]/g, '') || 'Demo';
  const name = localPart.charAt(0).toUpperCase() + localPart.slice(1);
  return {
    id: 'demo-user',
    email,
    name,
    pronouns: ['They', 'Them'],
    gender: 'Prefer not to say',
    year: '2nd Year',
    degree_level: "Bachelor's",
    major: 'Computer Science',
    bio: 'Just exploring the app in demo mode!',
    photo_url: null,
    status: 'Studying',
    profile_visibility: 'everyone',
    is_tutor: false,
    theme: 'light',
    ...overrides,
  };
}

export function useAuth(): UseAuthReturn {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  // Listen for auth state changes
  useEffect(() => {
    if (DEMO_MODE) {
      console.log('[demo] Demo mode is ON — auth and course search are mocked (no Supabase).');
      setLoading(false);
      return;
    }

    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile().then(setProfile);
      }
      setLoading(false);
    });

    // Listen for changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        if (session?.user) {
          const p = await fetchProfile();
          setProfile(p);
        } else {
          setProfile(null);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  // Validate email domain
  const validateEmail = (email: string): string | null => {
    const trimmed = email.trim().toLowerCase();
    if (!trimmed.endsWith(ALLOWED_EMAIL_DOMAIN)) {
      return `Please use your ${ALLOWED_EMAIL_DOMAIN} email address.`;
    }
    return null;
  };

  // Sign up with email + password
  const signUp = useCallback(async (email: string, password: string): Promise<{ error: string | null; needsVerification: boolean }> => {
    if (DEMO_MODE) {
      pendingDemoSignups.add(email.trim().toLowerCase());
      return { error: null, needsVerification: true };
    }

    const emailError = validateEmail(email);
    if (emailError) return { error: emailError, needsVerification: false };

    const { data, error } = await supabase.auth.signUp({
      email: email.trim().toLowerCase(),
      password,
    });

    if (error) {
      if (error.message.includes('already registered')) {
        return { error: 'This email is already registered. Try signing in.', needsVerification: false };
      }
      if (error.message.includes('password')) {
        return { error: 'Password must be at least 6 characters.', needsVerification: false };
      }
      return { error: error.message, needsVerification: false };
    }

    // If the project auto-confirms signups, Supabase already returns an active session —
    // no OTP email was sent, so skip straight past the code-verification screen.
    return { error: null, needsVerification: !data.session };
  }, []);

  // Verify OTP code (email confirmation)
  const verifyOtp = useCallback(async (email: string, token: string): Promise<{ error: string | null }> => {
    if (DEMO_MODE) {
      return { error: null }; // any code works in demo
    }

    const { error } = await supabase.auth.verifyOtp({
      email: email.trim().toLowerCase(),
      token,
      type: 'signup',
    });

    if (error) {
      if (error.message.includes('expired')) {
        return { error: 'Code has expired. Please request a new one.' };
      }
      return { error: 'Invalid code. Please try again.' };
    }

    return { error: null };
  }, []);

  // Resend OTP
  const resendOtp = useCallback(async (email: string): Promise<{ error: string | null }> => {
    if (DEMO_MODE) {
      return { error: null };
    }

    const { error } = await supabase.auth.resend({
      email: email.trim().toLowerCase(),
      type: 'signup',
    });

    if (error) {
      return { error: error.message };
    }
    return { error: null };
  }, []);

  // Sign in with email + password
  const signIn = useCallback(async (email: string, password: string): Promise<{ error: string | null; needsProfile: boolean }> => {
    if (DEMO_MODE) {
      const cleanEmail = email.trim().toLowerCase() || 'demo@cmail.carleton.ca';
      const demoUser = makeDemoUser(cleanEmail);
      setUser(demoUser);
      setSession(makeDemoSession(demoUser));

      if (pendingDemoSignups.has(cleanEmail)) {
        // Mid-signup: session established, but profile setup screens still to come.
        return { error: null, needsProfile: true };
      }

      // Direct sign-in: fabricate a profile so the app opens immediately.
      demoProfileStore = makeDemoProfile(cleanEmail);
      setProfile(demoProfileStore);
      return { error: null, needsProfile: false };
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim().toLowerCase(),
      password,
    });

    if (error) {
      if (error.message.includes('Invalid login credentials')) {
        return { error: 'Incorrect email or password.', needsProfile: false };
      }
      if (error.message.includes('Email not confirmed')) {
        return { error: 'Please verify your email first.', needsProfile: false };
      }
      return { error: error.message, needsProfile: false };
    }

    // Check if user has a profile
    if (data.user) {
      const { data: profileData } = await supabase
        .from('users')
        .select('id')
        .eq('id', data.user.id)
        .maybeSingle();

      if (!profileData) {
        return { error: null, needsProfile: true };
      }
    }

    return { error: null, needsProfile: false };
  }, []);

  // Reset password
  const resetPassword = useCallback(async (email: string): Promise<{ error: string | null }> => {
    if (DEMO_MODE) {
      return { error: null };
    }

    const { error } = await supabase.auth.resetPasswordForEmail(
      email.trim().toLowerCase()
    );

    if (error) {
      return { error: error.message };
    }
    return { error: null };
  }, []);

  // Sign out
  const signOut = useCallback(async () => {
    if (!DEMO_MODE) {
      await supabase.auth.signOut();
    }
    demoProfileStore = null;
    setSession(null);
    setUser(null);
    setProfile(null);
  }, []);

  // Fetch user profile from DB
  const fetchProfile = useCallback(async (): Promise<UserProfile | null> => {
    if (DEMO_MODE) {
      return demoProfileStore;
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .maybeSingle();

    if (error || !data) return null;
    return data as UserProfile;
  }, []);

  // Create full profile (after sign-up + verification)
  const createProfile = useCallback(async (profileData: CreateProfileData): Promise<{ error: string | null }> => {
    if (DEMO_MODE) {
      const email = session?.user?.email || 'demo@cmail.carleton.ca';
      pendingDemoSignups.delete(email);
      demoProfileStore = makeDemoProfile(email, {
        name: profileData.name,
        pronouns: profileData.pronouns,
        gender: profileData.gender,
        year: profileData.year,
        degree_level: profileData.degreeLevel,
        major: profileData.major,
        profile_visibility: profileData.profileVisibility || 'everyone',
        photo_url: profileData.profileImage || null,
        is_tutor: profileData.isTutor,
      });
      setProfile(demoProfileStore);
      return { error: null };
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: 'Not authenticated' };

    try {
      // 1. Insert user profile
      const { error: profileError } = await supabase.from('users').insert({
        id: user.id,
        email: user.email!,
        name: profileData.name,
        pronouns: profileData.pronouns,
        gender: profileData.gender,
        year: profileData.year,
        degree_level: profileData.degreeLevel,
        major: profileData.major,
        profile_visibility: profileData.profileVisibility || 'everyone',
        photo_url: profileData.profileImage || null,
        is_tutor: profileData.isTutor,
      });

      if (profileError) {
        console.error('Profile insert error:', profileError);
        return { error: profileError.message };
      }

      // 2. Insert prompts
      if (profileData.prompts.length > 0) {
        const promptRows = profileData.prompts.map((p, i) => ({
          user_id: user.id,
          prompt: p.prompt,
          answer: p.answer,
          sort_order: i,
        }));

        const { error: promptsError } = await supabase
          .from('user_prompts')
          .insert(promptRows);

        if (promptsError) {
          console.error('Prompts insert error:', promptsError);
          // Non-fatal — profile was created
        }
      }

      // 3. Enroll in courses (look up course IDs by code)
      if (profileData.courses.length > 0) {
        const { data: courseRows } = await supabase
          .from('courses')
          .select('id, code')
          .in('code', profileData.courses);

        if (courseRows && courseRows.length > 0) {
          const enrollments = courseRows.map((c) => ({
            user_id: user.id,
            course_id: c.id,
          }));

          const { error: enrollError } = await supabase
            .from('user_courses')
            .insert(enrollments);

          if (enrollError) {
            console.error('Course enrollment error:', enrollError);
          }
        }
      }

      // 4. If tutor, insert tutor courses
      if (profileData.isTutor && profileData.tutorCourses && profileData.tutorCourses.length > 0) {
        const tutorCourseCodes = profileData.tutorCourses.map((tc) => tc.courseCode);
        const { data: tutorCourseRows } = await supabase
          .from('courses')
          .select('id, code')
          .in('code', tutorCourseCodes);

        if (tutorCourseRows && tutorCourseRows.length > 0) {
          const codeToId = Object.fromEntries(tutorCourseRows.map((c) => [c.code, c.id]));

          const tutorInserts = profileData.tutorCourses
            .filter((tc) => codeToId[tc.courseCode])
            .map((tc) => ({
              user_id: user.id,
              course_id: codeToId[tc.courseCode],
              group_price: tc.groupPrice ?? null,
              individual_price: tc.individualPrice ?? null,
              proof_url: tc.proofUrl ?? null,
              is_approved: true,
            }));

          if (tutorInserts.length > 0) {
            const { error: tutorError } = await supabase
              .from('tutor_courses')
              .insert(tutorInserts);

            if (tutorError) {
              console.error('Tutor course insert error:', tutorError);
            }
          }
        }
      }

      // Refresh profile
      const newProfile = await fetchProfile();
      setProfile(newProfile);

      return { error: null };
    } catch (e: any) {
      console.error('Create profile error:', e);
      return { error: e.message || 'Something went wrong' };
    }
  }, [fetchProfile, session]);

  // Update the current user's profile (edit-profile screen)
  const updateProfile = useCallback(async (updates: UpdateProfileData): Promise<{ error: string | null }> => {
    if (DEMO_MODE) {
      if (demoProfileStore) {
        demoProfileStore = {
          ...demoProfileStore,
          ...(updates.name !== undefined && { name: updates.name }),
          ...(updates.pronouns !== undefined && { pronouns: updates.pronouns }),
          ...(updates.gender !== undefined && { gender: updates.gender }),
          ...(updates.year !== undefined && { year: updates.year }),
          ...(updates.degreeLevel !== undefined && { degree_level: updates.degreeLevel }),
          ...(updates.major !== undefined && { major: updates.major }),
          ...(updates.bio !== undefined && { bio: updates.bio }),
          ...(updates.profileVisibility !== undefined && { profile_visibility: updates.profileVisibility }),
          ...(updates.photoUrl !== undefined && { photo_url: updates.photoUrl }),
        };
        setProfile(demoProfileStore);
      }
      return { error: null };
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: 'Not authenticated' };

    const patch: Record<string, any> = {};
    if (updates.name !== undefined) patch.name = updates.name;
    if (updates.pronouns !== undefined) patch.pronouns = updates.pronouns;
    if (updates.gender !== undefined) patch.gender = updates.gender;
    if (updates.year !== undefined) patch.year = updates.year;
    if (updates.degreeLevel !== undefined) patch.degree_level = updates.degreeLevel;
    if (updates.major !== undefined) patch.major = updates.major;
    if (updates.bio !== undefined) patch.bio = updates.bio;
    if (updates.profileVisibility !== undefined) patch.profile_visibility = updates.profileVisibility;
    if (updates.photoUrl !== undefined) patch.photo_url = updates.photoUrl;

    if (Object.keys(patch).length > 0) {
      const { error } = await supabase.from('users').update(patch).eq('id', user.id);
      if (error) return { error: error.message };
    }

    if (updates.prompts) {
      await supabase.from('user_prompts').delete().eq('user_id', user.id);
      if (updates.prompts.length > 0) {
        const { error: promptsError } = await supabase.from('user_prompts').insert(
          updates.prompts.map((p, i) => ({ user_id: user.id, prompt: p.prompt, answer: p.answer, sort_order: i }))
        );
        if (promptsError) return { error: promptsError.message };
      }
    }

    const newProfile = await fetchProfile();
    setProfile(newProfile);
    return { error: null };
  }, [fetchProfile]);

  // Change password (re-authenticates with the current password first)
  const updatePassword = useCallback(async (currentPassword: string, newPassword: string): Promise<{ error: string | null }> => {
    if (DEMO_MODE) {
      return { error: null };
    }

    const email = session?.user?.email;
    if (email) {
      const { error: reauthError } = await supabase.auth.signInWithPassword({ email, password: currentPassword });
      if (reauthError) return { error: 'Current password is incorrect.' };
    }

    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) return { error: error.message };
    return { error: null };
  }, [session]);

  // Change email (re-authenticates with the current password first; Supabase sends a confirmation link to the new address)
  const updateEmail = useCallback(async (currentPassword: string, newEmail: string): Promise<{ error: string | null }> => {
    if (DEMO_MODE) {
      return { error: null };
    }

    const email = session?.user?.email;
    if (email) {
      const { error: reauthError } = await supabase.auth.signInWithPassword({ email, password: currentPassword });
      if (reauthError) return { error: 'Current password is incorrect.' };
    }

    const { error } = await supabase.auth.updateUser({ email: newEmail.trim().toLowerCase() });
    if (error) return { error: error.message };
    return { error: null };
  }, [session]);

  // Permanently delete the account (via edge function, since deleting an auth user requires the service role)
  const deleteAccount = useCallback(async (): Promise<{ error: string | null }> => {
    if (DEMO_MODE) {
      await signOut();
      return { error: null };
    }

    const { error } = await supabase.functions.invoke('delete-account');
    if (error) return { error: error.message };

    await signOut();
    return { error: null };
  }, [signOut]);

  return {
    session,
    user,
    profile,
    loading,
    signUp,
    signIn,
    verifyOtp,
    resendOtp,
    resetPassword,
    signOut,
    createProfile,
    fetchProfile,
    updateProfile,
    updatePassword,
    updateEmail,
    deleteAccount,
  };
}
