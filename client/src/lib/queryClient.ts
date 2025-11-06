import { QueryClient, QueryFunction } from "@tanstack/react-query";

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
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
