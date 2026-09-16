import { useSyncExternalStore } from "react";

// Every AI-chat error shares one shape: { errors: [ { code, message } ] }.
// The codes that need distinct handling, per the integration guide:
//   auth-001          401 no token and no guest_id       -> fix the request
//   identity          403 neither identity resolved      -> fix the request
//   not_found         404 conversation is not yours      -> drop id, start over
//   ai_disabled       503 admin switched the assistant off -> hide the entry point
//   too_many_requests 429 sending too fast, transient    -> back off, retry
//   ai_chat_limit     429 daily allowance spent          -> stop, do not retry
export type AiChatErrorCode =
  | "auth-001"
  | "identity"
  | "not_found"
  | "ai_disabled"
  | "too_many_requests"
  | "ai_chat_limit"
  // Keeps the union open for codes the backend adds without losing
  // autocomplete on the documented ones.
  | (string & {});

interface AiChatApiError {
  code?: string;
  message?: string;
  retry_after?: number | string;
  limit?: number | string;
}

export interface NormalizedAiChatError {
  status?: number;
  code?: AiChatErrorCode;
  message?: string;
  /** Seconds to wait before retrying — only on `too_many_requests`. */
  retryAfter?: number;
  /** The daily allowance that was spent — only on `ai_chat_limit`. */
  limit?: number;
}

const toFiniteNumber = (value: unknown): number | undefined => {
  const n = Number(value);
  return Number.isFinite(n) ? n : undefined;
};

export const getAiChatError = (err: any): NormalizedAiChatError => {
  const response = err?.response;
  const errors: AiChatApiError[] = Array.isArray(response?.data?.errors)
    ? response.data.errors
    : [];
  // A 403 uses the offending *field name* as its code, so the first entry is
  // the meaningful one whether or not the code is one we know.
  const first = errors[0] ?? {};

  return {
    status: response?.status,
    code: first.code,
    message: first.message || response?.data?.message,
    retryAfter:
      toFiniteNumber(first.retry_after) ??
      toFiniteNumber(response?.headers?.["retry-after"]),
    limit: toFiniteNumber(first.limit),
  };
};

export const isAiDisabledError = (err: any): boolean => {
  const { status, code } = getAiChatError(err);
  return status === 503 && code === "ai_disabled";
};

export interface AiChatLimits {
  perMinuteLimit?: number;
  perMinuteRemaining?: number;
  dailyLimit?: number;
  dailyRemaining?: number;
}

// Live on every `send` response. Axios lower-cases header keys, but a raw
// fetch/proxy might not, so both spellings are probed.
export const readAiChatLimits = (headers: any): AiChatLimits => {
  const read = (name: string) =>
    toFiniteNumber(headers?.[name] ?? headers?.[name.toLowerCase()]);

  return {
    perMinuteLimit: read("x-ratelimit-limit"),
    perMinuteRemaining: read("x-ratelimit-remaining"),
    dailyLimit: read("x-aichat-daily-limit"),
    dailyRemaining: read("x-aichat-daily-remaining"),
  };
};

// --- "assistant switched off" flag -----------------------------------------
// `503 ai_disabled` means hide the chat entry point entirely rather than show
// an error. Any ai-chat call can be the one that discovers it, so the flag
// lives outside React and the launcher subscribes to it. Session-scoped on
// purpose: a reload re-probes, so re-enabling in admin needs no client change.

let aiChatDisabled = false;
const listeners = new Set<() => void>();

const subscribe = (listener: () => void) => {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
};

const getSnapshot = () => aiChatDisabled;
// The server never renders the launcher as hidden — it has made no call yet.
const getServerSnapshot = () => false;

export const setAiChatDisabled = (disabled: boolean) => {
  if (aiChatDisabled === disabled) return;
  aiChatDisabled = disabled;
  listeners.forEach((listener) => listener());
};

/**
 * Records a failed ai-chat call and returns it normalized, so a call site can
 * flag `ai_disabled` and branch on the code in one step.
 */
export const noteAiChatError = (err: any): NormalizedAiChatError => {
  const normalized = getAiChatError(err);
  if (normalized.status === 503 && normalized.code === "ai_disabled") {
    setAiChatDisabled(true);
  }
  return normalized;
};

export const useAiChatDisabled = (): boolean =>
  useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
