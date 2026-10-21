// Website side of the Formula 2026 post-event surveys. The questions and the
// validation rules live in the edge-function shared file so the page and the
// submit function always agree; this module re-exports them and adds the
// network call and the tracking pause.
export * from "../../supabase/functions/_shared/formula-survey-schema.ts";

const SUBMIT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/formula-survey-submit`;

/** `status` is the HTTP status, or 0 when no reply arrived. */
export type SubmitOutcome = { kind: "saved" } | { kind: "failed"; code: string; status: number };

/**
 * Sends one submission. Deliberately a bare fetch with the publishable key
 * only: the supabase client would attach a signed-in admin's session token,
 * and an anonymous response must not travel with anyone's identity.
 * Only a 2xx reply with ok:true counts as saved.
 */
export async function submitSurvey(payload: Record<string, unknown>): Promise<SubmitOutcome> {
  const key = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
  try {
    const response = await fetch(SUBMIT_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json", apikey: key, Authorization: `Bearer ${key}` },
      body: JSON.stringify(payload),
      credentials: "omit",
      referrerPolicy: "no-referrer",
    });
    const body = await response.json().catch(() => null);
    if (response.ok && body?.ok === true) return { kind: "saved" };
    return {
      kind: "failed",
      code: typeof body?.error === "string" ? body.error : `http_${response.status}`,
      status: response.status,
    };
  } catch {
    return { kind: "failed", code: "network", status: 0 };
  }
}

export type UploadOutcome = { kind: "uploaded" } | { kind: "failed"; code: string };

/**
 * Uploads one testimonial video/audio file: asks the submit function for a
 * one-time token, then sends the file straight to storage. `onProgress`
 * gets 0-100. Uses XHR because fetch cannot report upload progress.
 */
export async function uploadTestimonialFile(
  file: File,
  submissionKey: string,
  onProgress: (percent: number) => void,
): Promise<UploadOutcome> {
  const key = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
  let token: { bucket: string; path: string; token: string };
  try {
    const response = await fetch(SUBMIT_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json", apikey: key, Authorization: `Bearer ${key}` },
      body: JSON.stringify({ type: "testimonial-upload", submissionKey, mimeType: file.type, sizeBytes: file.size }),
      credentials: "omit",
      referrerPolicy: "no-referrer",
    });
    const body = await response.json().catch(() => null);
    if (!response.ok || body?.ok !== true) {
      return { kind: "failed", code: typeof body?.error === "string" ? body.error : `http_${response.status}` };
    }
    token = body;
  } catch {
    return { kind: "failed", code: "network" };
  }

  const url = `${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/upload/sign/${token.bucket}/${token.path}?token=${encodeURIComponent(token.token)}`;
  return new Promise((resolve) => {
    const xhr = new XMLHttpRequest();
    xhr.open("PUT", url);
    xhr.setRequestHeader("apikey", key);
    xhr.setRequestHeader("content-type", file.type);
    xhr.setRequestHeader("x-upsert", "false");
    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable) onProgress(Math.round((event.loaded / event.total) * 100));
    };
    xhr.onload = () => {
      // 409 means this exact file key is already stored: a retry of an upload
      // that finished but whose reply was lost.
      if ((xhr.status >= 200 && xhr.status < 300) || xhr.status === 409) resolve({ kind: "uploaded" });
      else resolve({ kind: "failed", code: xhr.status === 413 ? "file_too_large" : `upload_${xhr.status}` });
    };
    xhr.onerror = () => resolve({ kind: "failed", code: "network" });
    xhr.send(file);
  });
}
