import { useEffect, useRef, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const INACTIVITY_TIMEOUT = 5 * 60 * 1000; // 5 minutes in milliseconds
const LAST_ACTIVITY_KEY = 'lastActivityTimestamp';
const DASHBOARD_SESSION_KEY = 'dashboardSessionActive';

// Dashboard route prefixes that keep the session alive
const DASHBOARD_PREFIXES = ['/student', '/instructor', '/admin'];

const isDashboardRoute = (pathname: string) =>
  DASHBOARD_PREFIXES.some((prefix) => pathname.startsWith(prefix));

export const useSessionTimeout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isSigningOut = useRef(false);

  const handleSignOut = useCallback(async (reason: string) => {
    if (isSigningOut.current) return;
    isSigningOut.current = true;

    try {
      localStorage.removeItem(LAST_ACTIVITY_KEY);
      localStorage.removeItem(DASHBOARD_SESSION_KEY);

      await supabase.auth.signOut();

      toast.info(reason);
      navigate('/', { replace: true });
    } catch (error) {
      console.error('Sign out error:', error);
      navigate('/', { replace: true });
    } finally {
      isSigningOut.current = false;
    }
  }, [navigate]);

  const resetTimer = useCallback(() => {
    localStorage.setItem(LAST_ACTIVITY_KEY, Date.now().toString());

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      handleSignOut('Session expired due to inactivity. Please sign in again.');
    }, INACTIVITY_TIMEOUT);
  }, [handleSignOut]);

  const checkStoredActivity = useCallback(() => {
    const lastActivity = localStorage.getItem(LAST_ACTIVITY_KEY);
    if (lastActivity) {
      const elapsed = Date.now() - parseInt(lastActivity, 10);
      if (elapsed > INACTIVITY_TIMEOUT) {
        handleSignOut('Session expired due to inactivity. Please sign in again.');
        return false;
      }
    }
    return true;
  }, [handleSignOut]);

  // Mark dashboard session as active on mount, sign out on unmount if leaving dashboard
  useEffect(() => {
    localStorage.setItem(DASHBOARD_SESSION_KEY, 'true');

    return () => {
      // On unmount, check if we're navigating to a non-dashboard route
      // We use a small delay so the new route is available
      const checkAndSignOut = async () => {
        // Give the router a moment to update
        await new Promise((r) => setTimeout(r, 50));
        
        const currentPath = window.location.pathname;
        if (!isDashboardRoute(currentPath)) {
          // User left the dashboard — sign them out immediately
          localStorage.removeItem(LAST_ACTIVITY_KEY);
          localStorage.removeItem(DASHBOARD_SESSION_KEY);
          
          try {
            await supabase.auth.signOut();
          } catch (e) {
            console.error('Sign out on leave error:', e);
          }
        }
      };

      checkAndSignOut();
    };
  }, []);

  // Inactivity tracking
  useEffect(() => {
    const isValid = checkStoredActivity();
    if (!isValid) return;

    const events = [
      'mousedown',
      'mousemove',
      'keydown',
      'scroll',
      'touchstart',
      'click',
      'focus',
    ];

    let lastUpdate = 0;
    const throttledReset = () => {
      const now = Date.now();
      if (now - lastUpdate > 30000) {
        lastUpdate = now;
        resetTimer();
      }
    };

    resetTimer();

    events.forEach((event) => {
      document.addEventListener(event, throttledReset, { passive: true });
    });

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        checkStoredActivity();
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      events.forEach((event) => {
        document.removeEventListener(event, throttledReset);
      });
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [resetTimer, checkStoredActivity]);

  return { resetTimer };
};
