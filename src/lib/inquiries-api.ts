export type InquiryPayload = {
  name: string;
  company: string;
  projectType: string;
  description: string;
  email: string;
};

export type SubmitInquiryResult =
  | { ok: true; id: string }
  | { ok: false; message: string };

export async function submitInquiry(
  payload: InquiryPayload,
): Promise<SubmitInquiryResult> {
  try {
    const response = await fetch("/api/inquiries", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = (await response.json().catch(() => null)) as
      | { message?: string; id?: string; error?: string }
      | null;

    if (!response.ok) {
      return {
        ok: false,
        message:
          data?.error ??
          "We couldn't send your inquiry. Please try again in a moment.",
      };
    }

    return { ok: true, id: data?.id ?? "" };
  } catch {
    return {
      ok: false,
      message:
        "Network error. Please check your connection and try again.",
    };
  }
}
