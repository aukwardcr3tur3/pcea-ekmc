import { useState, useEffect } from "react";
import { auth, db, doc, getDoc, onSnapshot } from "../firebase";
import { onAuthStateChanged, User } from "firebase/auth";

export interface UserProfile {
  uid: string;
  email: string | null;
  displayName: string | null;
  role: "member" | "staff" | "admin" | "social_media_manager" | "youth_leader" | "ministry_head";
  photoURL?: string;
  phoneNumber?: string;
  bio?: string;
  district?: string;
  isPublic?: boolean;
  createdAt?: any;
  updatedAt?: any;
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!auth) return;

    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      setUser(user);
      if (!user) {
        setProfile(null);
        setLoading(false);
      }
    });

    return () => unsubscribeAuth();
  }, []);

  useEffect(() => {
    if (!user || !db) return;

    const unsubscribeProfile = onSnapshot(doc(db, "users", user.uid), (doc) => {
      if (doc.exists()) {
        setProfile({ uid: user.uid, ...doc.data() } as UserProfile);
      } else {
        setProfile({
          uid: user.uid,
          email: user.email,
          displayName: user.displayName,
          role: "member",
        });
      }
      setLoading(false);
    }, (error) => {
      console.error("Error fetching user profile:", error);
      setLoading(false);
    });

    return () => unsubscribeProfile();
  }, [user]);

  const isOnboarded = !!(profile?.phoneNumber && profile?.district && profile?.bio);

  return { 
    user, 
    profile, 
    loading, 
    isOnboarded,
    isAdmin: profile?.role === "admin" || user?.email === "josephnyagah34@gmail.com", 
    isStaff: profile?.role === "staff" || profile?.role === "admin" || profile?.role === "youth_leader" || profile?.role === "ministry_head" || user?.email === "josephnyagah34@gmail.com",
    isSocialManager: profile?.role === "social_media_manager" || profile?.role === "admin" || user?.email === "josephnyagah34@gmail.com",
    isYouthLeader: profile?.role === "youth_leader" || profile?.role === "admin" || user?.email === "josephnyagah34@gmail.com",
    isMinistryHead: profile?.role === "ministry_head" || profile?.role === "admin" || user?.email === "josephnyagah34@gmail.com"
  };
}
