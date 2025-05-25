
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Session, User } from "@supabase/supabase-js";

// Helper to check if a session is valid & not expired
function isSessionValid(session: Session | null): session is Session {
  if (!session) return false;
  // Check if current time is before expires_at (epoch seconds)
  if (session.expires_at && session.expires_at * 1000 < Date.now()) {
    return false;
  }
  return true;
}

// Provides current session & user for use throughout the app.
export function useSession() {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const updateState = (newSession: Session | null) => {
      if (isSessionValid(newSession)) {
        setSession(newSession);
        setUser(newSession.user);
        console.log("Auth state: valid session", newSession);
      } else {
        setSession(null);
        setUser(null);
        console.log("Auth state: no/expired session");
      }
    };

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      updateState(session);
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      updateState(session);
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  return { session, user };
}
