type ApiErrorPayload = {
  detail?: string;
  message?: string;
};

export async function parseJsonOrThrow<T>(response: Response): Promise<T> {
  let payload: ApiErrorPayload | T | null = null;

  try {
    payload = (await response.json()) as ApiErrorPayload | T;
  } catch {
    payload = null;
  }

  if (!response.ok) {
    const detail = (payload as ApiErrorPayload | null)?.detail;
    const message = (payload as ApiErrorPayload | null)?.message;
    throw new Error(detail || message || `Request failed (${response.status})`);
  }

  return payload as T;
}

export async function apiGet<T>(path: string): Promise<T> {
  const response = await fetch(path);
  return parseJsonOrThrow<T>(response);
}

export async function apiPost<T>(path: string, body: unknown): Promise<T> {
  const response = await fetch(path, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  return parseJsonOrThrow<T>(response);
}
