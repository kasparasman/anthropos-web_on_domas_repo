export interface ApiErrorResponse {
  error: string;
  details?: any;
}

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    let errorData: ApiErrorResponse;
    try {
      errorData = await response.json();
    } catch (e) {
      errorData = { error: response.statusText || 'Unknown API error' };
    }
    console.error('[apiUtils] API Error:', errorData.error, errorData.details);
    throw new Error(errorData.error);
  }
  // For 204 No Content or similar cases where there's no body
  if (response.status === 204 || response.headers.get("content-length") === "0") {
    return undefined as T; // Or handle as appropriate for your use case
  }
  return response.json() as Promise<T>;
}

export async function apiPost<T, R>(url: string, body: T): Promise<R> {
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });
  return handleResponse<R>(response);
}

export async function apiGet<R>(url: string): Promise<R> {
  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });
  return handleResponse<R>(response);
}

// You can add apiPut, apiDelete etc. as needed 