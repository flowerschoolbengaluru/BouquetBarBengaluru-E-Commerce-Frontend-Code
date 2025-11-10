import { QueryClient, QueryFunction } from "@tanstack/react-query";

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    // Read raw text (may be JSON or plain text)
    const raw = (await res.text()) || res.statusText || '';

    // Try to parse JSON and prefer `message` or `error` keys when present
    let parsed: any = null;
    try {
      parsed = JSON.parse(raw);
    } catch {
      parsed = null;
    }

    const userMessage = (parsed && (parsed.message || parsed.error)) || raw || `HTTP ${res.status}`;

    // Create Error with clean message (no status prefix) but attach response metadata
    const err: any = new Error(userMessage);
    // Attach a small response object so callers that inspect error.response can still access status/body
    err.response = {
      status: res.status,
      rawText: raw,
      // Keep parsed JSON accessible both as a value (.data) and as async helpers
      data: parsed,
      json: async () => parsed,
      text: async () => raw,
    };
    throw err;
  }
}

// Get the API base URL from environment variable
const getApiUrl = (path: string) => {
  // const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
  const baseUrl = import.meta.env.VITE_API_URL || 'https://flowerschoolbengaluru.com';

  // If path starts with /api, use it directly with base URL
  if (path.startsWith('/api')) {
    return `${baseUrl}${path}`;
  }
  // Otherwise, assume it's already a full URL
  return path;
};

export async function apiRequest(
  url: string,
  options?: {
    method?: string;
    headers?: Record<string, string>;
    body?: string;
  }
): Promise<Response> {
  // Diagnostic: trace unexpected sign-in requests
  try {
    if (typeof url === 'string' && url.includes('/api/auth/signin')) {
      console.log('[diag] apiRequest: /api/auth/signin called — options:', { method: options?.method, bodySnippet: options?.body ? options.body.slice(0, 100) : undefined });
      console.trace();
    }
  } catch (e) {
    // ignore diagnostic errors
  }
  const defaultHeaders: Record<string, string> = {};

  // Add Content-Type header for requests with body
  if (options?.body) {
    defaultHeaders["Content-Type"] = "application/json";
  }

  const fullUrl = getApiUrl(url);

  const res = await fetch(fullUrl, {
    method: options?.method || "GET",
    headers: { ...defaultHeaders, ...options?.headers },
    body: options?.body,
    credentials: "include",
  });

  await throwIfResNotOk(res);
  return res;
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
    async ({ queryKey }) => {
      const url = getApiUrl(queryKey.join("/") as string);
      const res = await fetch(url, {
        credentials: "include",
      });

      if (unauthorizedBehavior === "returnNull" && res.status === 401) {
        return null;
      }

      await throwIfResNotOk(res);
      return await res.json();
    };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: Infinity,
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
});
