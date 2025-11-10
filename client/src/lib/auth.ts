// Types for user authentication
export interface UserData {
  id: string;
  email: string;
  name: string;
  token: string;
  expiresAt?: number;
}
 
interface StoredUserInfo {
  id: string;
  email: string;
  name: string;
  lastUpdated: string;
  sessionId: string;
}
 
// Storage Keys
export const SESSION_STORAGE_KEY = 'user_session';
export const AUTH_COOKIE_KEY = 'auth_token';
export const REFRESH_COOKIE_KEY = 'refresh_token';
export const SESSION_ID_KEY = 'session_id';
 
// Cookie utility functions
const setCookie = (name: string, value: string, options: {
  days?: number;
  secure?: boolean;
  sameSite?: 'Strict' | 'Lax' | 'None';
  path?: string;
  domain?: string;
} = {}) => {
  const defaults = {
    days: 7,
    // Default secure to true only when running over HTTPS (local dev on http won't set Secure cookies)
    secure: (typeof window !== 'undefined' && window.location && window.location.protocol === 'https:') ? true : false,
    sameSite: 'Lax' as 'Lax',
    path: '/',
    domain: undefined as string | undefined,
  };

  const {
    days = defaults.days,
    secure = defaults.secure,
    sameSite = defaults.sameSite,
    path = defaults.path,
    domain
  } = options;
 
  const expires = new Date(Date.now() + days * 24 * 60 * 60 * 1000).toUTCString();
  const encodedValue = encodeURIComponent(value);
 
  let cookieString = `${name}=${encodedValue}; expires=${expires}; path=${path}`;
 
  if (secure) cookieString += '; Secure';
  if (sameSite) cookieString += `; SameSite=${sameSite}`;
  if (domain) cookieString += `; Domain=${domain}`;
 
  document.cookie = cookieString;
};
 
const getCookie = (name: string): string | null => {
  const cookies = document.cookie.split(';');
  for (let cookie of cookies) {
    const [cookieName, cookieValue] = cookie.split('=').map(c => c.trim());
    if (cookieName === name) {
      return decodeURIComponent(cookieValue);
    }
  }
  return null;
};
 
const deleteCookie = (name: string) => {
  setCookie(name, '', { days: -1 });
};
 
// Generate a unique session ID
const generateSessionId = () => {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
};
 
// Auth storage management
export const authStorage = {
  // Save user data and tokens
  saveUser: (userData: UserData): void => {
    try {
      if (!userData || !userData.token) {
        console.error('Invalid user data provided');
        return;
      }
 
      const sessionId = generateSessionId();
 
      // Save auth token in HTTP-only cookie
      setCookie(AUTH_COOKIE_KEY, userData.token, {
        days: 7,
        secure: true,
        sameSite: 'Strict'
      });
 
      // Save session ID in a separate cookie
      setCookie(SESSION_ID_KEY, sessionId, {
        days: 7,
        secure: true,
        sameSite: 'Lax'
      });
     
      // Save user info in sessionStorage
      const userInfo: StoredUserInfo = {
        id: userData.id,
        email: userData.email,
        name: userData.name,
        lastUpdated: new Date().toISOString(),
        sessionId
      };
     
      sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(userInfo));
 
      // Save full user info in localStorage for session recovery
      localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(userInfo));
 
      // Dispatch a custom event for cross-tab communication
      window.dispatchEvent(new CustomEvent('auth-update', {
        detail: {
          type: 'login',
          timestamp: Date.now(),
          sessionId
        }
      }));
    } catch (error) {
      console.error('Error saving user data:', error);
    }
  },
 
  // Get user data from storage and cookie
  getUser: (): UserData | null => {
    try {
      // Try sessionStorage first, fall back to localStorage
      let userInfo = sessionStorage.getItem(SESSION_STORAGE_KEY);
      if (!userInfo) {
        userInfo = localStorage.getItem(SESSION_STORAGE_KEY);
        // If found in localStorage, restore to sessionStorage
        if (userInfo) {
          sessionStorage.setItem(SESSION_STORAGE_KEY, userInfo);
        }
      }
 
      const token = getCookie(AUTH_COOKIE_KEY);
     
      if (!userInfo || !token) {
        if (!token) {
          // Clean up storage if token is missing
          sessionStorage.removeItem(SESSION_STORAGE_KEY);
          localStorage.removeItem(SESSION_STORAGE_KEY);
          deleteCookie(AUTH_COOKIE_KEY);
          deleteCookie(REFRESH_COOKIE_KEY);
        }
        return null;
      }
     
      const parsedInfo = JSON.parse(userInfo);
      return {
        ...parsedInfo,
        token
      };
    } catch (error) {
      console.error('Error getting user data:', error);
      return null;
    }
  },
 
  // Clear all auth data
  clearUser: (): void => {
    try {
      sessionStorage.removeItem(SESSION_STORAGE_KEY);
      deleteCookie(AUTH_COOKIE_KEY);
      deleteCookie(REFRESH_COOKIE_KEY);
    } catch (error) {
      console.error('Error clearing user data:', error);
    }
  },
 
  // Check if user is logged in
  isAuthenticated: (): boolean => {
    return !!(getCookie(AUTH_COOKIE_KEY) && sessionStorage.getItem(SESSION_STORAGE_KEY));
  }
};
 
