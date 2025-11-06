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

export async function apiRequest(method: string, url: string, data?: any) {
  const options: RequestInit = {
    method,
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
  };

  if (data) {
    options.body = JSON.stringify(data);
  }

  const fullUrl = getApiUrl(url);
  const response = await fetch(fullUrl, options);

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  return response.json();
}