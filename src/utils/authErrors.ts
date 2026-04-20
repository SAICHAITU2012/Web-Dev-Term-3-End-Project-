function tryParseJson(message: string) {
  try {
    return JSON.parse(message) as Record<string, unknown>;
  } catch {
    return null;
  }
}

function normalizeMessage(message: string) {
  const parsed = tryParseJson(message);

  if (parsed && typeof parsed.msg === "string") {
    return parsed.msg;
  }

  return message;
}

export function formatAuthErrorMessage(message: string) {
  const normalized = normalizeMessage(message).toLowerCase();

  if (
    normalized.includes("unsupported provider") ||
    normalized.includes("provider is not enabled")
  ) {
    return "Google sign-in is not enabled in this Supabase project yet. Open Supabase Dashboard -> Authentication -> Providers -> Google, turn it on, and add your Google client ID and secret.";
  }

  if (normalized.includes("redirect") && normalized.includes("allow list")) {
    return "This redirect URL is not allowed in Supabase yet. Add your localhost URL and Vercel URL in Authentication -> URL Configuration.";
  }

  if (normalized.includes("invalid login credentials")) {
    return "The email or password is incorrect. Please check your credentials and try again.";
  }

  return normalizeMessage(message);
}

export function readAuthErrorFromHash() {
  const hash = window.location.hash.startsWith("#")
    ? window.location.hash.slice(1)
    : window.location.hash;

  if (!hash) {
    return null;
  }

  const params = new URLSearchParams(hash);
  const errorDescription = params.get("error_description");
  const message = errorDescription || params.get("error") || params.get("error_code");

  if (!message) {
    return null;
  }

  return formatAuthErrorMessage(decodeURIComponent(message));
}
