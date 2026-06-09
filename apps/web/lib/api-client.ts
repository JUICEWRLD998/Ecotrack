// API client for making requests to the embedded Express API
// All requests go to /api/backend/* which is handled by Next.js API routes

function getApiBaseUrl() {
  // In the browser, use relative URLs — no absolute URL needed
  if (typeof window !== "undefined") {
    return "/api/backend";
  }

  // On the server (SSR / Server Actions), we need a full absolute URL.
  // NEXTAUTH_URL is set manually and always includes https://.
  if (process.env.NEXTAUTH_URL) {
    return `${process.env.NEXTAUTH_URL}/api/backend`;
  }

  // VERCEL_URL is auto-injected by Vercel but WITHOUT the https:// scheme.
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}/api/backend`;
  }

  // Local development fallback
  return "http://localhost:3000/api/backend";
}

export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status: number
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export async function apiClient<TResponse>(path: string, init?: RequestInit): Promise<TResponse> {
  const response = await fetch(`${getApiBaseUrl()}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...init?.headers
    }
  });

  if (!response.ok) {
    const fallbackMessage = `Request failed with status ${response.status}`;
    const payload = (await response.json().catch(() => null)) as { message?: string } | null;
    throw new ApiError(payload?.message ?? fallbackMessage, response.status);
  }

  return response.json() as Promise<TResponse>;
}
