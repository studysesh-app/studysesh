import { useState, useEffect, useCallback, useRef } from 'react';
import { Platform } from 'react-native';
import * as Linking from 'expo-linking';
import { supabase } from '../lib/supabase';
import { DEMO_MODE } from '../lib/demo';
import type { Session, User } from '@supabase/supabase-js';
import { FunctionsHttpError } from '@supabase/supabase-js';

const ALLOWED_EMAIL_DOMAIN = '@cmail.carleton.ca';

function getPasswordResetRedirectUrl(): string | undefined {
  if (Platform.OS === 'web') {
    if (typeof window === 'undefined') return undefined;
    return new URL(window.location.pathname, window.location.origin).toString();
  }
  return Linking.createURL('/');
}

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
  prompts?: Array<{ prompt: string; answer: string }>;
}

interface UseAuthReturn {
  session: Session | null;
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  isPasswordRecovery: boolean;
  signUp: (email: string, password: string) => Promise<{ error: string | null; needsVerification: boolean }>;
  signIn: (email: string, password: string) => Promise<{ error: string | null; needsProfile: boolean }>;
  verifyOtp: (email: string, token: string) => Promise<{ error: string | null }>;
  resendOtp: (email: string) => Promise<{ error: string | null }>;
  resetPassword: (email: string) => Promise<{ error: string | null }>;
  completePasswordRecovery: (newPassword: string) => Promise<{ error: string | null }>;
  cancelPasswordRecovery: () => Promise<void>;
  signOut: () => Promise<void>;
  createProfile: (profileData: CreateProfileData) => Promise<{ error: string | null }>;
  activateTutor: (courses: TutorActivationCourse[]) => Promise<{ error: string | null }>;
  fetchProfile: () => Promise<UserProfile | null>;
  updateProfile: (updates: UpdateProfileData) => Promise<{ error: string | null; saved?: boolean; unknown?: boolean }>;
  updatePassword: (currentPassword: string, newPassword: string) => Promise<{ error: string | null }>;
  updateEmail: (currentPassword: string, newEmail: string) => Promise<{ error: string | null }>;
  deleteAccount: () => Promise<{ error: string | null }>;
}

interface TutorActivationCourse {
  courseCode: string;
  proofUrl: string;
  groupPrice: number;
  individualPrice: number;
  sessionType: 'online' | 'in-person' | 'both';
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
  theme?: 'light' | 'dark';
  status?: string;
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
    sessionType?: 'online' | 'in-person' | 'both';
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
  return {
    id: 'demo-user',
    email,
    name: 'Test User',
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
  const [isPasswordRecovery, setIsPasswordRecovery] = useState(false);
  const signingOutRef = useRef(false);

  // Listen for auth state changes
  useEffect(() => {
    if (DEMO_MODE) {
      console.log('[demo] Demo mode is ON — auth and course search are mocked (no Supabase).');
      setLoading(false);
      return;
    }

    // Listen for changes (registered before getSession so initial PASSWORD_RECOVERY events aren't missed).
    // Defer fetchProfile() via setTimeout so it runs outside GoTrue's internal auth lock and cannot deadlock supabase-js queries.
    let active = true;
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (signingOutRef.current) {
          if (!session) signingOutRef.current = false;
          return;
        }
        if (event === 'PASSWORD_RECOVERY') {
          setIsPasswordRecovery(true);
        } else if (event === 'SIGNED_OUT') {
          setIsPasswordRecovery(false);
        }
        setSession(session);
        setUser(session?.user ?? null);
        if (session?.user) {
          setTimeout(() => {
            if (!active) return;
            fetchProfile().then((p) => {
              if (active) setProfile(p);
            });
          }, 0);
        } else {
          setProfile(null);
        }
      }
    );

    // Get initial session
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!active || signingOutRef.current) return;
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        const p = await fetchProfile();
        if (active) setProfile(p);
      }
      if (active) setLoading(false);
    });

    // Handle deep-link recovery URLs on native (web uses detectSessionInUrl: true)
    let linkSubscription: { remove: () => void } | undefined;
    if (Platform.OS !== 'web') {
      const handleAuthUrl = async (url: string | null) => {
        if (!url) return;
        const hashPart = url.includes('#') ? url.split('#')[1] : '';
        const queryPart = url.includes('?') ? url.split('?')[1].split('#')[0] : '';
        const hashParams = new URLSearchParams(hashPart);
        const queryParams = new URLSearchParams(queryPart);
        const type = hashParams.get('type') ?? queryParams.get('type');
        const code = queryParams.get('code');
        const accessToken = hashParams.get('access_token');
        const refreshToken = hashParams.get('refresh_token');

        if (code) {
          const { error } = await supabase.auth.exchangeCodeForSession(code);
          if (!error && type === 'recovery') {
            setIsPasswordRecovery(true);
          }
        } else if (accessToken && refreshToken) {
          const { error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          });
          if (!error && type === 'recovery') {
            setIsPasswordRecovery(true);
          }
        }
      };

      Linking.getInitialURL().then(handleAuthUrl).catch(() => {});
      linkSubscription = Linking.addEventListener('url', ({ url }) => {
        handleAuthUrl(url);
      });
    }

    return () => {
      active = false;
      subscription.unsubscribe();
      linkSubscription?.remove();
    };
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
    if (password.length < 8) {
      return { error: 'Password must be at least 8 characters.', needsVerification: false };
    }

    const { data, error } = await supabase.auth.signUp({
      email: email.trim().toLowerCase(),
      password,
    });

    if (error) {
      if (error.message.includes('already registered')) {
        return { error: 'This email is already registered. Try signing in.', needsVerification: false };
      }
      if (error.message.includes('password')) {
        return { error: 'Password must be at least 8 characters.', needsVerification: false };
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

    const redirectTo = getPasswordResetRedirectUrl();
    const { error } = await supabase.auth.resetPasswordForEmail(
      email.trim().toLowerCase(),
      redirectTo ? { redirectTo } : undefined
    );

    if (error) {
      return { error: error.message };
    }
    return { error: null };
  }, []);

  // Sign out — clear local session first so the UI always returns to welcome,
  // even if the network call to Supabase hangs or fails.
  const signOut = useCallback(async () => {
    signingOutRef.current = true;
    demoProfileStore = null;
    setIsPasswordRecovery(false);
    setSession(null);
    setUser(null);
    setProfile(null);
    if (!DEMO_MODE) {
      try {
        await supabase.auth.signOut();
      } catch (e) {
        console.warn('signOut:', e);
      }
    }
    signingOutRef.current = false;
  }, []);

  const completePasswordRecovery = useCallback(async (newPassword: string): Promise<{ error: string | null }> => {
    if (newPassword.length < 8) {
      return { error: 'Password must be at least 8 characters.' };
    }
    if (DEMO_MODE) {
      setIsPasswordRecovery(false);
      return { error: null };
    }

    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) return { error: error.message };
    setIsPasswordRecovery(false);
    return { error: null };
  }, []);

  const cancelPasswordRecovery = useCallback(async () => {
    setIsPasswordRecovery(false);
    await signOut();
  }, [signOut]);

  // Fetch user profile from DB
  const fetchProfile = useCallback(async (): Promise<UserProfile | null> => {
    if (DEMO_MODE) {
      return demoProfileStore;
    }

    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user?.email) {
      console.error('Fetch authenticated profile user error:', userError ?? 'User email is unavailable');
      return null;
    }

    const { data, error } = await supabase
      .from('users')
      .select('id, name, pronouns, gender, year, degree_level, major, bio, photo_url, status, profile_visibility, is_tutor, theme')
      .eq('id', user.id)
      .maybeSingle();

    if (error) {
      console.error('Fetch profile error:', error);
      return null;
    }
    if (!data) return null;
    const profile = { ...data, email: user.email } as UserProfile;
    const { data: promptRows, error: promptError } = await supabase
      .from('user_prompts')
      .select('prompt, answer')
      .eq('user_id', user.id)
      .order('sort_order');
    if (promptError) {
      console.error('Fetch profile prompts error:', promptError);
      return null;
    }
    profile.prompts = (promptRows ?? []).map((p) => ({ prompt: p.prompt, answer: p.answer }));
    return profile;
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
        prompts: profileData.prompts,
      });
      setProfile(demoProfileStore);
      return { error: null };
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: 'Not authenticated' };

    try {
      if (profileData.prompts.length < 3) {
        return { error: 'Add 3 profile prompts before continuing.' };
      }

      const { error: profileError } = await supabase.rpc('complete_profile', {
        p_profile: {
          name: profileData.name,
          pronouns: profileData.pronouns,
          gender: profileData.gender,
          year: profileData.year,
          degree_level: profileData.degreeLevel,
          major: profileData.major,
          profile_visibility: profileData.profileVisibility || 'everyone',
          photo_url: profileData.profileImage || null,
          is_tutor: profileData.isTutor,
        },
        p_prompts: profileData.prompts,
        p_courses: profileData.courses,
        p_tutor_courses: profileData.tutorCourses?.map((course) => ({
          course_code: course.courseCode,
          group_price: course.groupPrice ?? null,
          individual_price: course.individualPrice ?? null,
          proof_url: course.proofUrl ?? null,
          session_type: course.sessionType ?? 'both',
        })) ?? [],
      });
      if (profileError) {
        console.error('Complete profile error:', profileError);
        return { error: profileError.message };
      }

      // Refresh profile
      const newProfile = await fetchProfile();
      if (!newProfile) return { error: 'Your profile was saved, but could not be refreshed. Please sign in again.' };
      setProfile(newProfile);

      return { error: null };
    } catch (e: any) {
      console.error('Create profile error:', e);
      return { error: e.message || 'Something went wrong' };
    }
  }, [fetchProfile, session]);

  const activateTutor = useCallback(async (courses: TutorActivationCourse[]): Promise<{ error: string | null }> => {
    if (courses.length === 0) return { error: 'Select at least one tutoring course.' };
    if (DEMO_MODE) {
      if (!demoProfileStore) return { error: 'Your profile is not available.' };
      demoProfileStore = { ...demoProfileStore, is_tutor: true };
      setProfile(demoProfileStore);
      return { error: null };
    }

    const { error } = await supabase.rpc('activate_tutor', {
      p_courses: courses.map((course) => ({
        course_code: course.courseCode,
        proof_url: course.proofUrl,
        group_price: course.groupPrice,
        individual_price: course.individualPrice,
        session_type: course.sessionType,
      })),
    });
    if (error) {
      console.error('Activate tutor error:', error);
      return { error: error.message };
    }
    const updatedProfile = await fetchProfile();
    if (!updatedProfile) return { error: 'Your tutor setup was saved, but your profile could not be refreshed. Sign in again.' };
    setProfile(updatedProfile);
    return { error: null };
  }, [fetchProfile]);

  // Update the current user's profile (edit-profile screen)
  const updateProfile = useCallback(async (updates: UpdateProfileData): Promise<{ error: string | null; saved?: boolean; unknown?: boolean }> => {
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
          ...(updates.theme !== undefined && { theme: updates.theme }),
          ...(updates.status !== undefined && { status: updates.status }),
          ...(updates.prompts !== undefined && { prompts: updates.prompts }),
        };
        setProfile(demoProfileStore);
      }
      return { error: null };
    }

    const patch: Record<string, string | string[] | null> = {};
    if (updates.name !== undefined) patch.name = updates.name;
    if (updates.pronouns !== undefined) patch.pronouns = updates.pronouns;
    if (updates.gender !== undefined) patch.gender = updates.gender;
    if (updates.year !== undefined) patch.year = updates.year;
    if (updates.degreeLevel !== undefined) patch.degree_level = updates.degreeLevel;
    if (updates.major !== undefined) patch.major = updates.major;
    if (updates.bio !== undefined) patch.bio = updates.bio;
    if (updates.profileVisibility !== undefined) patch.profile_visibility = updates.profileVisibility;
    if (updates.photoUrl !== undefined) patch.photo_url = updates.photoUrl;
    if (updates.theme !== undefined) patch.theme = updates.theme;
    if (updates.status !== undefined) patch.status = updates.status;

    let response;
    try {
      response = await supabase.rpc('update_profile', {
        p_updates: patch,
        p_prompts: updates.prompts ?? null,
      });
    } catch (failure) {
      console.error('Profile update result unknown:', failure);
      return { error: 'Could not confirm the update. Reload before retrying.', unknown: true };
    }
    const { error } = response;
    if (error) return error.code
      ? { error: error.message }
      : { error: 'Could not confirm the update. Reload before retrying.', unknown: true };

    try {
      const newProfile = await fetchProfile();
      if (!newProfile) return { error: 'Your profile was saved, but could not be refreshed. Please reload.', saved: true };
      setProfile(newProfile);
      return { error: null };
    } catch (failure) {
      console.error('Refresh saved profile failed:', failure);
      return { error: 'Your profile was saved, but could not be refreshed. Please reload.', saved: true };
    }
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
    const clean = newEmail.trim().toLowerCase();
    if (!clean.endsWith(ALLOWED_EMAIL_DOMAIN)) {
      return { error: `Please use your ${ALLOWED_EMAIL_DOMAIN} email address.` };
    }

    if (DEMO_MODE) {
      if (demoProfileStore) {
        demoProfileStore = { ...demoProfileStore, email: clean };
        setProfile(demoProfileStore);
      }
      return { error: null };
    }

    const email = session?.user?.email;
    if (email) {
      const { error: reauthError } = await supabase.auth.signInWithPassword({ email, password: currentPassword });
      if (reauthError) return { error: 'Current password is incorrect.' };
    }

    const { error } = await supabase.auth.updateUser({ email: clean });
    if (error) return { error: error.message };

    const refreshed = await fetchProfile();
    if (refreshed) setProfile(refreshed);
    return { error: null };
  }, [session, fetchProfile]);

  // Permanently delete the account (via edge function, since deleting an auth user requires the service role)
  const deleteAccount = useCallback(async (): Promise<{ error: string | null }> => {
    if (DEMO_MODE) {
      await signOut();
      return { error: null };
    }

    const { error } = await supabase.functions.invoke('delete-account');
    if (error) {
      if (error instanceof FunctionsHttpError) {
        try {
          const body: unknown = await error.context.json();
          if (typeof body === 'object' && body !== null && 'error' in body && typeof body.error === 'string') {
            return { error: body.error };
          }
        } catch (failure) {
          console.error('Read account deletion error failed:', failure);
        }
      }
      return { error: error.message };
    }

    await signOut();
    return { error: null };
  }, [signOut]);

  return {
    session,
    user,
    profile,
    loading,
    isPasswordRecovery,
    signUp,
    signIn,
    verifyOtp,
    resendOtp,
    resetPassword,
    completePasswordRecovery,
    cancelPasswordRecovery,
    signOut,
    createProfile,
    activateTutor,
    fetchProfile,
    updateProfile,
    updatePassword,
    updateEmail,
    deleteAccount,
  };
}
