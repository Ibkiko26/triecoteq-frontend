import { head, put } from "@vercel/blob";
import { strToU8, zipSync } from "fflate";
import careers from "../content/careers.json" with { type: "json" };

const { departments, openings, uploadLimits } = careers;
const maximumRequestBytes = 4_100_000;
const uuidPattern = /^[a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/;
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const unavailable = "Applications are temporarily unavailable. Please try again later or contact triecoteq@gmail.com.";

function getText(form, name) {
  const value = form.get(name);
  return typeof value === "string" ? value.trim() : "";
}

function reply(status, body, headers = {}) {
  return Response.json(body, { status, headers: { ...headers, "Cache-Control": "no-store" } });
}

async function readPdf(file, limit) {
  if (!(file instanceof File) || !/\.pdf$/i.test(file.name) || file.size < 5 || file.size > limit) {
    return null;
  }

  const data = new Uint8Array(await file.arrayBuffer());
  return new TextDecoder().decode(data.subarray(0, 5)) === "%PDF-" ? data : null;
}

async function saveApplication(pathname, archive) {
  try {
    await put(pathname, Buffer.from(archive), {
      access: "private",
      contentType: "application/zip",
      addRandomSuffix: false,
      allowOverwrite: false
    });
  } catch (error) {
    // A previous request can finish writing even if the browser loses its response.
    const existing = await head(pathname).catch(() => null);
    if (existing?.pathname !== pathname) throw error;
  }
}

async function submitApplication(request) {
  if (request.method !== "POST") {
    return reply(405, { error: "Use the Careers page to submit an application." }, { Allow: "POST" });
  }

  if (request.headers.get("sec-fetch-site") === "cross-site") {
    return reply(403, { error: "Submit your application from the Careers page." });
  }

  if (Number(request.headers.get("content-length")) > maximumRequestBytes) {
    return reply(413, { error: "Uploads must be within the file size limits shown on the application form." });
  }

  if (!request.headers.get("content-type")?.startsWith("multipart/form-data;")) {
    return reply(415, { error: "Submit your application and files using the Careers form." });
  }

  let form;
  try {
    form = await request.formData();
  } catch {
    return reply(400, { error: "We couldn’t read your application. Choose your files again and retry." });
  }

  if (getText(form, "website")) {
    return reply(400, { error: "We couldn’t accept your application. Please reload the Careers page and try again." });
  }

  const reference = getText(form, "submissionId");
  const name = getText(form, "name");
  const email = getText(form, "email");
  const phone = getText(form, "phone");
  const city = getText(form, "city");
  const message = getText(form, "message");
  const portfolioUrl = getText(form, "portfolioUrl");
  const department = departments.find(({ id }) => id === getText(form, "department"));
  const role = getText(form, "role");
  const openingId = getText(form, "opening");

  if (!uuidPattern.test(reference)) {
    return reply(400, { error: "Reload the Careers page before submitting your application." });
  }
  if (!name || name.length > 120 || email.length > 254 || !emailPattern.test(email)) {
    return reply(400, { error: "Enter your name and a valid email address." });
  }
  if (!department?.roles.includes(role)) {
    return reply(400, { error: "Choose a department and one of its listed roles." });
  }
  if (openingId && !openings.some((opening) => opening.id === openingId && opening.department === department.id && opening.role === role)) {
    return reply(400, { error: "This vacancy is no longer available. Reload the page or register your interest for a future opening." });
  }
  if (phone.length > 40 || city.length > 120 || message.length > 2000 || portfolioUrl.length > 500) {
    return reply(400, { error: "Shorten your contact details, experience summary or portfolio link and try again." });
  }
  if (portfolioUrl && !["https:", "http:"].includes(URL.canParse(portfolioUrl) ? new URL(portfolioUrl).protocol : "")) {
    return reply(400, { error: "Enter a portfolio link beginning with https:// or http://." });
  }

  const resume = await readPdf(form.get("resume"), uploadLimits.resume);
  if (!resume) {
    return reply(400, { error: `Upload a résumé as a PDF of up to ${uploadLimits.resume / 1000000} MB.` });
  }

  const portfolioFile = form.get("portfolio");
  const hasPortfolio = portfolioFile instanceof File && Boolean(portfolioFile.name);
  const portfolio = hasPortfolio ? await readPdf(portfolioFile, uploadLimits.portfolio) : null;
  if (hasPortfolio && !portfolio) {
    return reply(400, { error: `Upload a portfolio PDF of up to ${uploadLimits.portfolio / 1000000} MB, or add a portfolio link.` });
  }

  if (!process.env.BLOB_STORE_ID && !process.env.BLOB_READ_WRITE_TOKEN) {
    return reply(503, { error: unavailable });
  }

  const receivedAt = new Intl.DateTimeFormat("en-KE", {
    dateStyle: "medium", timeStyle: "short", timeZone: "Africa/Nairobi"
  }).format(new Date());
  const application = [
    `Reference: ${reference}`,
    `Received (Nairobi time): ${receivedAt}`,
    `Application: ${openingId || "General expression of interest"}`,
    `Department: ${department.name}`,
    `Role: ${role}`,
    `Name: ${name}`,
    `Email: ${email}`,
    `Phone: ${phone || "—"}`,
    `City: ${city || "—"}`,
    `Portfolio link: ${portfolioUrl || "—"}`,
    "",
    "Experience",
    message || "—"
  ].join("\n");
  const files = { "application.txt": strToU8(application), "resume.pdf": resume };
  if (portfolio) files["portfolio.pdf"] = portfolio;

  try {
    await saveApplication(`career-applications/${department.id}/${reference}.zip`, zipSync(files, { level: 0 }));
  } catch (error) {
    console.error("Career application could not be saved", error.name);
    return reply(503, { error: unavailable });
  }
  return reply(201, { reference });
}

export default { fetch: submitApplication };
