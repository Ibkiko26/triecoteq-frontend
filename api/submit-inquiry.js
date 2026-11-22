const maxRequestBytes = 48_000;
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const unavailable = "Online enquiries are temporarily unavailable. You can send your enquiry by email instead.";

function reply(status, body, headers = {}) {
  return Response.json(body, { status, headers: { ...headers, "Cache-Control": "no-store" } });
}

function getText(value) {
  return typeof value === "string" ? value.trim() : "";
}

async function forwardInquiry(projectUrl, submission) {
  try {
    const endpoint = new URL("/functions/v1/submit-inquiry", projectUrl);
    const response = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(submission),
      redirect: "error",
      signal: AbortSignal.timeout(15_000)
    });
    const result = await response.json().catch(() => null);

    if (response.status === 201 && result?.success === true) {
      return reply(201, { success: true });
    }
    if ([400, 413, 415].includes(response.status) && typeof result?.error === "string") {
      return reply(response.status, { error: result.error });
    }

    console.error("Supabase did not accept an enquiry", response.status);
  } catch (error) {
    console.error("Supabase enquiry could not be submitted", error instanceof Error ? error.name : "UnknownError");
  }
  return reply(503, { error: unavailable });
}

async function submitInquiry(request) {
  if (request.method !== "POST") {
    return reply(405, { error: "Use the Contact page to send an enquiry." }, { Allow: "POST" });
  }

  if (request.headers.get("sec-fetch-site") === "cross-site") {
    return reply(403, { error: "Send your enquiry from the Contact page." });
  }

  if (request.headers.get("content-type")?.split(";")[0].trim().toLowerCase() !== "application/json") {
    return reply(415, { error: "Use the Contact form to send your enquiry." });
  }

  if (Number(request.headers.get("content-length")) > maxRequestBytes) {
    return reply(413, { error: "Your enquiry is too long. Please shorten your project details." });
  }

  let submission;
  try {
    const body = await request.text();
    if (Buffer.byteLength(body) > maxRequestBytes) {
      return reply(413, { error: "Your enquiry is too long. Please shorten your project details." });
    }
    submission = JSON.parse(body);
  } catch {
    return reply(400, { error: "We couldn’t read your enquiry. Please try again." });
  }

  const name = getText(submission?.name);
  const email = getText(submission?.email);
  const service = getText(submission?.service);
  const message = getText(submission?.message);

  if (getText(submission?.website)) {
    return reply(400, { error: "We couldn’t accept your enquiry. Reload the Contact page and try again." });
  }
  if (!name || name.length > 120 || email.length > 254 || !emailPattern.test(email)) {
    return reply(400, { error: "Enter your name and a valid email address." });
  }
  if (!message || message.length > 8000 || service.length > 120) {
    return reply(400, { error: "Enter project details of up to 8,000 characters." });
  }

  const projectUrl = process.env.SUPABASE_URL?.trim();
  if (projectUrl) return forwardInquiry(projectUrl, { name, email, service, message });

  const token = process.env.AIRTABLE_TOKEN?.trim();
  const baseId = process.env.AIRTABLE_BASE_ID?.trim();
  const tableId = process.env.AIRTABLE_TABLE_ID?.trim();
  if (!token || !baseId || !tableId) {
    return reply(503, { error: unavailable });
  }

  const fields = { Name: name, Email: email, Service: service, Message: message };
  const url = `https://api.airtable.com/v0/${encodeURIComponent(baseId)}/${encodeURIComponent(tableId)}`;

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ records: [{ fields }] }),
      redirect: "error",
      signal: AbortSignal.timeout(10_000)
    });

    if (!response.ok) {
      console.error("Airtable rejected an enquiry", response.status);
      return reply(503, { error: unavailable });
    }

    return reply(201, { success: true });
  } catch (error) {
    console.error("Airtable enquiry could not be submitted", error.name);
    return reply(503, { error: unavailable });
  }
}

export default { fetch: submitInquiry };
