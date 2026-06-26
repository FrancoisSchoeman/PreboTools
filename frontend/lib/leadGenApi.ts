const headers = {
  'Content-Type': 'application/json',
  'X-API-Key': process.env.INTERNAL_API_KEY!,
};

export async function leadGenFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${process.env.BACKEND_URL}/api/lead-gen${path}`, {
    ...init,
    headers: {
      ...headers,
      ...init?.headers,
    },
    cache: 'no-store',
  });

  if (!res.ok) {
    throw new Error(`Lead gen API error: ${res.status}`);
  }

  return res.json();
}

export async function leadGenMutate<T>(
  path: string,
  method: string,
  body?: unknown
): Promise<T> {
  const res = await fetch(`${process.env.BACKEND_URL}/api/lead-gen${path}`, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
    cache: 'no-store',
  });

  const data = await res.json().catch(() => null);

  if (!res.ok) {
    throw new Error(data?.message || `Lead gen API error: ${res.status}`);
  }

  return data;
}
