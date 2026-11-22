import careers from "../content/careers.json";
import { escapeHtml } from "./utils";

interface Opening {
  id: string;
  department: string;
  role: string;
  location: string;
  employment: string;
  description: string;
}

const { departments, uploadLimits } = careers;
const openings: Opening[] = careers.openings;

function departmentOptions(): string {
  return departments.map(({ id, name }) => `<option value="${escapeHtml(id)}">${escapeHtml(name)}</option>`).join("");
}

function openingCard(opening: Opening): string {
  return `
    <article class="career-opening" data-career-opening="${escapeHtml(opening.department)}">
      <div>
        <h3>${escapeHtml(opening.role)}</h3>
        <p class="career-opening-meta">${escapeHtml(opening.location)} · ${escapeHtml(opening.employment)}</p>
        <p>${escapeHtml(opening.description)}</p>
      </div>
      <a class="text-link" href="#career-application" data-career-apply="${escapeHtml(opening.id)}" aria-label="Apply for ${escapeHtml(opening.role)}">Apply for this role</a>
    </article>`;
}

export function renderCareersSections(): string {
  return `
    <section class="section section-career-openings" aria-labelledby="career-openings-title">
      <div class="container">
        <div class="section-heading">
          <h2 id="career-openings-title">Open positions</h2>
          <div class="career-filter form-field filter-group">
            <label for="career-department-filter">Filter by department</label>
            <select id="career-department-filter"><option value="">All departments</option>${departmentOptions()}</select>
          </div>
        </div>
        <div class="career-opening-list">${openings.map(openingCard).join("")}</div>
        <div class="career-empty" data-career-empty hidden>
          <p role="status" data-career-empty-message></p>
          <a class="text-link" href="#career-application" data-career-interest>Register your interest</a>
        </div>
      </div>
    </section>

    <section class="section section-career-application" id="career-application" aria-labelledby="career-application-title">
      <div class="container career-application-layout">
        <div class="career-application-intro">
          <h2 id="career-application-title">Apply for a role</h2>
          <p>Choose your department and role, share your experience and attach your résumé. You can also include a portfolio.</p>
          <p data-career-application-target hidden></p>
        </div>
        <form class="contact-form career-form" action="/api/career-applications" method="post" enctype="multipart/form-data" data-career-form>
          <input type="hidden" name="opening" />
          <div class="form-pair">
            <label>Full name<input name="name" autocomplete="name" maxlength="120" required /></label>
            <label>Email address<input name="email" type="email" autocomplete="email" maxlength="254" required /></label>
          </div>
          <div class="form-pair">
            <label><span>Phone number <span class="career-optional">(optional)</span></span><input name="phone" type="tel" autocomplete="tel" maxlength="40" /></label>
            <label><span>Current city <span class="career-optional">(optional)</span></span><input name="city" autocomplete="address-level2" maxlength="120" /></label>
          </div>
          <div class="form-pair">
            <div class="form-field">
              <label for="career-department">Department</label>
              <select id="career-department" name="department" required><option value="">Choose a department</option>${departmentOptions()}</select>
            </div>
            <div class="form-field">
              <label for="career-role">Role</label>
              <select id="career-role" name="role" required disabled><option value="">Choose a department first</option></select>
            </div>
          </div>
          <label><span>Tell us about your experience <span class="career-optional">(optional)</span></span><textarea name="message" rows="4" maxlength="2000"></textarea></label>
          <div class="career-upload-grid">
            <div class="form-field career-upload">
              <label for="career-resume">Résumé</label>
              <p id="career-resume-help">Required. PDF up to ${uploadLimits.resume / 1000000} MB.</p>
              <input id="career-resume" name="resume" type="file" accept=".pdf,application/pdf" aria-describedby="career-resume-help" required />
            </div>
            <div class="form-field career-upload">
              <label for="career-portfolio">Portfolio</label>
              <p id="career-portfolio-help">Optional. PDF up to ${uploadLimits.portfolio / 1000000} MB.</p>
              <input id="career-portfolio" name="portfolio" type="file" accept=".pdf,application/pdf" aria-describedby="career-portfolio-help" />
            </div>
          </div>
          <label><span>Portfolio link <span class="career-optional">(optional)</span></span><input name="portfolioUrl" type="url" maxlength="500" placeholder="https://" aria-describedby="career-portfolio-link-help" /></label>
          <p class="form-note" id="career-portfolio-link-help">For a larger portfolio, paste a link the hiring team can open.</p>
          <div hidden><label>Leave this empty<input name="website" type="text" tabindex="-1" autocomplete="off" /></label></div>
          <p class="career-privacy">We use your details and files to review your application.</p>
          <button class="button button-dark" type="submit">Submit application</button>
          <p class="career-feedback" role="status" aria-live="polite" data-career-feedback></p>
        </form>
      </div>
    </section>`;
}

export function initCareers(): void {
  const form = document.querySelector<HTMLFormElement>("[data-career-form]");
  if (!form) return;

  const filter = document.querySelector<HTMLSelectElement>("#career-department-filter")!;
  const vacancyCards = document.querySelectorAll<HTMLElement>("[data-career-opening]");
  const empty = document.querySelector<HTMLElement>("[data-career-empty]")!;
  const emptyMessage = document.querySelector<HTMLElement>("[data-career-empty-message]")!;
  const department = form.querySelector<HTMLSelectElement>("#career-department")!;
  const role = form.querySelector<HTMLSelectElement>("#career-role")!;
  const openingField = form.querySelector<HTMLInputElement>('input[name="opening"]')!;
  const target = document.querySelector<HTMLElement>("[data-career-application-target]")!;
  const button = form.querySelector<HTMLButtonElement>('button[type="submit"]')!;
  const feedback = form.querySelector<HTMLElement>("[data-career-feedback]")!;
  let submissionId: string | undefined;

  function filterOpenings(): void {
    let hasOpenings = false;
    for (const card of vacancyCards) {
      card.hidden = Boolean(filter.value) && card.dataset.careerOpening !== filter.value;
      hasOpenings ||= !card.hidden;
    }
    empty.hidden = hasOpenings;
    const selected = departments.find(({ id }) => id === filter.value);
    emptyMessage.textContent = selected
      ? `There are no advertised openings in ${selected.name} at the moment.`
      : "There are no advertised openings at the moment.";
  }

  function updateRoles(): void {
    const selected = departments.find(({ id }) => id === department.value);
    role.replaceChildren(new Option(selected ? "Choose a role" : "Choose a department first", ""));
    for (const title of selected?.roles ?? []) role.add(new Option(title, title));
    role.disabled = !selected;
  }

  function setOpening(opening?: Opening): void {
    openingField.value = opening?.id ?? "";
    target.hidden = !opening;
    target.textContent = opening ? `Applying for ${opening.role}` : "";
    submissionId = undefined;
  }

  filter.addEventListener("change", filterOpenings);
  department.addEventListener("change", () => {
    updateRoles();
    setOpening();
  });
  role.addEventListener("change", () => setOpening());
  document.querySelector("[data-career-interest]")?.addEventListener("click", () => {
    department.value = filter.value;
    updateRoles();
    setOpening();
  });
  document.querySelectorAll<HTMLAnchorElement>("[data-career-apply]").forEach((link) => {
    link.addEventListener("click", () => {
      const opening = openings.find(({ id }) => id === link.dataset.careerApply);
      if (!opening) return;
      department.value = opening.department;
      updateRoles();
      role.value = opening.role;
      setOpening(opening);
    });
  });

  for (const [name, limit] of Object.entries(uploadLimits)) {
    const input = form.querySelector<HTMLInputElement>(`input[name="${name}"]`)!;
    input.addEventListener("change", () => {
      const file = input.files?.[0];
      let message = "";
      if (file && !/\.pdf$/i.test(file.name)) {
        message = "Choose a PDF file.";
      } else if (file && (file.size === 0 || file.size > limit)) {
        message = `Choose a non-empty PDF of up to ${limit / 1000000} MB.`;
      }
      input.setCustomValidity(message);
      input.reportValidity();
    });
  }

  form.addEventListener("input", () => {
    submissionId = undefined;
    feedback.textContent = "";
  });

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (button.disabled || !form.reportValidity()) return;

    const reference = submissionId ??= crypto.randomUUID();
    const values = new FormData(form);
    values.set("submissionId", reference);
    button.disabled = true;
    button.textContent = "Submitting…";
    feedback.textContent = "Uploading your application…";

    try {
      const response = await fetch(form.action, { method: "POST", body: values });
      const result = await response.json().catch(() => null);
      if (!response.ok || typeof result?.reference !== "string") {
        feedback.textContent = typeof result?.error === "string"
          ? result.error
          : "We couldn’t submit your application. Please try again or email triecoteq@gmail.com.";
        return;
      }

      if (submissionId === reference) {
        form.reset();
        updateRoles();
        setOpening();
      }
      feedback.textContent = `Application received. Your reference is ${result.reference}.`;
    } catch {
      feedback.textContent = "We couldn’t submit your application. Check your connection and try again.";
    } finally {
      button.disabled = false;
      button.textContent = "Submit application";
    }
  });

  filterOpenings();
  updateRoles();
}
