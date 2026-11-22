// @ts-check

const unavailable = "Online enquiries are temporarily unavailable. You can send your enquiry by email instead.";

/**
 * @param {string} endpoint
 * @param {FormData} values
 */
export async function submitContactInquiry(endpoint, values) {
  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(Object.fromEntries(values))
    });
    const result = await response.json().catch(() => null);
    if (response.ok && result?.success === true) {
      return { accepted: true, error: "", offerEmail: false };
    }

    if (response.status >= 400 && response.status < 500 && typeof result?.error === "string") {
      return { accepted: false, error: result.error, offerEmail: false };
    }
  } catch {
    // A failed network request gets the same email option as an unavailable backend.
  }
  return { accepted: false, error: unavailable, offerEmail: true };
}
