import type { ApiErrorResponse } from './types'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL

export class ApiError extends Error {
  status: number
  code: string
  details?: Record<string, unknown>

  constructor(status: number, body: ApiErrorResponse | null) {
    super(body?.error.message ?? 'Request failed')
    this.status = status
    this.code = body?.error.code ?? 'UNKNOWN_ERROR'
    this.details = body?.error.details
  }
}

let accessToken: string | null = null
let onUnauthorized: (() => void) | null = null

export function setAccessToken(token: string | null) {
  accessToken = token
}

export function setUnauthorizedHandler(handler: () => void) {
  onUnauthorized = handler
}

interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'
  body?: unknown
  authenticated?: boolean
}

async function send(path: string, options: RequestOptions): Promise<Response> {
  const { method = 'GET', body, authenticated = false } = options

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  }

  if (authenticated && accessToken) {
    headers.Authorization = `Bearer ${accessToken}`
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  })

  if (response.status === 401) {
    onUnauthorized?.()
  }

  return response
}

export async function apiFetch<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const response = await send(path, options)

  const rawBody = await response.text()
  const parsedBody = rawBody ? JSON.parse(rawBody) : undefined

  if (!response.ok) {
    throw new ApiError(response.status, parsedBody as ApiErrorResponse | null)
  }

  return parsedBody as T
}

export interface ApiFile {
  blob: Blob
  /** From Content-Disposition; null when absent or not readable (cross-origin needs Access-Control-Expose-Headers). */
  filename: string | null
}

/** For endpoints that answer with a file instead of JSON. Errors still arrive as the JSON error envelope. */
export async function apiFetchFile(path: string, options: RequestOptions = {}): Promise<ApiFile> {
  const response = await send(path, options)

  if (!response.ok) {
    const rawBody = await response.text()
    let parsedBody: ApiErrorResponse | null = null
    try {
      parsedBody = rawBody ? JSON.parse(rawBody) : null
    } catch {
      // A proxy/gateway error page is not our envelope; ApiError falls back to a generic message.
    }
    throw new ApiError(response.status, parsedBody)
  }

  return {
    blob: await response.blob(),
    filename: filenameFromDisposition(response.headers.get('Content-Disposition')),
  }
}

function filenameFromDisposition(header: string | null): string | null {
  if (!header) return null

  // RFC 6266: prefer the UTF-8 filename* form, which Symfony adds for non-ASCII names.
  const extended = /filename\*\s*=\s*utf-8''([^;]+)/i.exec(header)
  if (extended) {
    try {
      return decodeURIComponent(extended[1].trim())
    } catch {
      // Malformed percent-encoding: fall through to the plain filename.
    }
  }

  const plain = /filename\s*=\s*(?:"([^"]*)"|([^;]+))/i.exec(header)
  const filename = (plain?.[1] ?? plain?.[2] ?? '').trim()
  return filename || null
}
