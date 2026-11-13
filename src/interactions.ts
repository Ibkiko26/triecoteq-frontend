import { designPlans, portfolioProjects, type DesignPlan } from "./data";
import { escapeHtml, formatUsd } from "./utils";
import type { PageName } from "./pages";

const cartStorageKey = "teq-buy-plan-cart-v1";

interface CartEntry {
  id: string;
  qty: number;
  price: number;
}

function isStoredCartEntry(value: unknown): value is CartEntry {
  if (typeof value !== "object" || value === null) return false;
  const entry = value as Record<string, unknown>;
  return typeof entry.id === "string" && Number.isFinite(Number(entry.qty)) && Number(entry.qty) > 0;
}

function announce(message: string): void {
  const toast = document.querySelector<HTMLElement>("[data-toast]");
  if (!toast) return;
  toast.textContent = message;
  toast.classList.add("is-visible");
  window.setTimeout(() => toast.classList.remove("is-visible"), 3200);
}

function readStorage(key: string): string | null {
  try {
    return window.localStorage.getItem(key);
  } catch {
    announce("Browser storage is unavailable. Your choices may not be saved.");
    return null;
  }
}

function saveStorage(key: string, value: string): boolean {
  try {
    window.localStorage.setItem(key, value);
    return true;
  } catch {
    announce("Your browser could not save this change. Check its storage settings and try again.");
    return false;
  }
}

function initTheme(): void {
  const storedTheme = readStorage("teq-theme");
  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  const theme = storedTheme === "light" || storedTheme === "dark"
    ? storedTheme
    : prefersDark ? "dark" : "light";

  document.body.dataset.theme = theme;
  updateThemeButton(theme);

  document.querySelectorAll<HTMLButtonElement>("[data-theme-toggle]").forEach((button) => {
    button.addEventListener("click", () => {
      const nextTheme = document.body.dataset.theme === "dark" ? "light" : "dark";
      document.body.dataset.theme = nextTheme;
      updateThemeButton(nextTheme);
      saveStorage("teq-theme", nextTheme);
    });
  });
}

function updateThemeButton(theme: string): void {
  document.querySelectorAll<HTMLButtonElement>("[data-theme-toggle]").forEach((button) => {
    button.setAttribute("aria-label", theme === "dark" ? "Use light theme" : "Use dark theme");
    button.innerHTML = theme === "dark"
      ? '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="4"/><path d="M12 2v2m0 16v2M4.93 4.93l1.42 1.42m11.3 11.3 1.42 1.42M2 12h2m16 0h2M4.93 19.07l1.42-1.42m11.3-11.3 1.42-1.42"/></svg>'
      : '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20.5 15.5A8.5 8.5 0 0 1 8.5 3.5 8.5 8.5 0 1 0 20.5 15.5Z"/></svg>';
  });
}

function initNavigation(): void {
  const toggle = document.querySelector<HTMLButtonElement>("[data-nav-toggle]");
  const navigation = document.querySelector<HTMLElement>("#primary-navigation");
  if (!toggle || !navigation) return;

  toggle.addEventListener("click", () => {
    const expanded = toggle.getAttribute("aria-expanded") === "true";
    toggle.setAttribute("aria-expanded", String(!expanded));
    navigation.classList.toggle("is-open", !expanded);
    toggle.innerHTML = `<span class="sr-only">${expanded ? "Open" : "Close"} navigation</span>${expanded
      ? '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" aria-hidden="true"><path d="M4 7h16M4 12h16M4 17h16"/></svg>'
      : '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" aria-hidden="true"><path d="m6 6 12 12M18 6 6 18"/></svg>'}`;
  });

  navigation.querySelectorAll<HTMLAnchorElement>("a").forEach((link) => {
    link.addEventListener("click", () => {
      toggle.setAttribute("aria-expanded", "false");
      navigation.classList.remove("is-open");
    });
  });
}

function loadCart(): Map<string, CartEntry> {
  const raw = readStorage(cartStorageKey);
  if (!raw) return new Map();

  try {
    const stored: unknown = JSON.parse(raw);
    if (!Array.isArray(stored)) throw new TypeError("Basket data must be an array.");

    const cart = new Map<string, CartEntry>();
    for (const value of stored) {
      if (!isStoredCartEntry(value)) continue;
      const plan = designPlans.find((candidate) => candidate.id === value.id);
      if (!plan) continue;
      const price = Number(value.price);
      cart.set(value.id, {
        id: value.id,
        qty: Math.floor(Number(value.qty)),
        price: Number.isFinite(price) && price >= 0 ? price : plan.currentPrice
      });
    }
    return cart;
  } catch {
    announce("Saved basket data could not be read. Start a new basket or contact us for help.");
    return new Map();
  }
}

let cart = new Map<string, CartEntry>();

function writeCart(): void {
  const entries = JSON.stringify(Array.from(cart.values()));
  saveStorage(cartStorageKey, entries);
}

function paidPlanCount(): number {
  return Array.from(cart.values())
    .filter((entry) => !designPlans.find((plan) => plan.id === entry.id)?.offer)
    .reduce((count, entry) => count + entry.qty, 0);
}

function offerPlan(): DesignPlan | undefined {
  return designPlans.find((plan) => plan.offer);
}

function totalCartCount(): number {
  return Array.from(cart.values()).reduce((count, entry) => count + entry.qty, 0);
}

function updateCartBadges(): void {
  document.querySelectorAll<HTMLElement>("[data-cart-count]").forEach((badge) => {
    badge.textContent = String(totalCartCount());
  });
}

function updateOfferButton(): void {
  const offer = offerPlan();
  if (!offer) return;
  const button = document.querySelector<HTMLButtonElement>(`[data-add-plan="${CSS.escape(offer.id)}"]`);
  if (!button) return;

  const unlocked = paidPlanCount() >= 3;
  const alreadyAdded = cart.has(offer.id);
  button.disabled = !unlocked || alreadyAdded;
  button.textContent = alreadyAdded ? "Added to basket" : unlocked ? "Add bonus plan" : "Unlock at 3 plans";
}

function planById(id: string): DesignPlan | undefined {
  return designPlans.find((plan) => plan.id === id);
}

function setPlanQuantity(id: string, delta: number): void {
  const plan = planById(id);
  const existing = cart.get(id);
  if (!plan || !existing) return;

  const quantity = existing.qty + delta;
  if (quantity <= 0) cart.delete(id);
  else cart.set(id, { ...existing, qty: quantity });

  const offer = offerPlan();
  if (offer && paidPlanCount() < 3) cart.delete(offer.id);
  updateCart();
}

function updateCart(): void {
  writeCart();
  updateCartBadges();
  updateOfferButton();
  renderCheckout();
}

function addPlan(id: string): void {
  const plan = planById(id);
  if (!plan) {
    announce("That plan is no longer available.");
    return;
  }

  if (plan.offer && paidPlanCount() < 3) {
    announce("Add three paid plans to unlock the bonus plan.");
    return;
  }

  const existing = cart.get(id);
  if (plan.offer && existing) {
    announce("The bonus plan is already in your basket.");
    return;
  }

  cart.set(id, existing
    ? { ...existing, qty: existing.qty + 1 }
    : { id, qty: 1, price: plan.currentPrice });
  announce(`${plan.title} added to your basket.`);
  updateCart();
}

function checkoutItem(entry: CartEntry): string {
  const plan = planById(entry.id);
  const title = plan?.title ?? entry.id;
  const description = plan?.description ?? "Completed design package.";

  return `
    <article class="checkout-item">
      <div class="checkout-item-image">${plan?.images[0] ? `<img src="${escapeHtml(plan.images[0])}" alt="" loading="lazy" />` : ""}</div>
      <div class="checkout-item-details"><h3>${escapeHtml(title)}</h3><p>${escapeHtml(description)}</p><div class="quantity-control" aria-label="Quantity for ${escapeHtml(title)}"><button type="button" data-cart-change="-1" data-cart-id="${escapeHtml(entry.id)}" aria-label="Remove one ${escapeHtml(title)}">${entry.qty === 1 ? "Remove" : iconText("minus")}</button><span>${entry.qty}</span><button type="button" data-cart-change="1" data-cart-id="${escapeHtml(entry.id)}" aria-label="Add one ${escapeHtml(title)}">${iconText("plus")}</button></div></div>
      <strong class="checkout-item-price">${formatUsd(entry.price * entry.qty)}</strong>
    </article>`;
}

function iconText(kind: "plus" | "minus"): string {
  return kind === "plus" ? "+" : "−";
}

function renderCheckout(): void {
  const container = document.querySelector<HTMLElement>("[data-checkout-items]");
  if (!container) return;

  const entries = Array.from(cart.values());
  const itemCount = entries.reduce((count, entry) => count + entry.qty, 0);
  const total = entries.reduce((amount, entry) => amount + entry.price * entry.qty, 0);
  const count = document.querySelector<HTMLElement>("[data-checkout-count]");
  const totalElement = document.querySelector<HTMLElement>("[data-checkout-total]");
  const continueLink = document.querySelector<HTMLAnchorElement>("[data-checkout-continue]");
  const clearButton = document.querySelector<HTMLButtonElement>("[data-clear-basket]");
  const emptyLink = document.querySelector<HTMLElement>("[data-empty-basket]");
  const offerNotice = document.querySelector<HTMLElement>("[data-checkout-offer]");

  container.innerHTML = entries.length
    ? entries.map(checkoutItem).join("")
    : '<p class="empty-state">Your basket is empty. Choose a ready-made plan to get started.</p>';
  if (count) count.textContent = String(itemCount);
  if (totalElement) totalElement.textContent = formatUsd(total);
  if (clearButton) clearButton.disabled = itemCount === 0;
  if (emptyLink) emptyLink.hidden = itemCount > 0;

  if (continueLink) {
    continueLink.setAttribute("aria-disabled", String(itemCount === 0));
    const payment = document.querySelector<HTMLInputElement>('input[name="payment"]:checked')?.value ?? "Card";
    const order = entries.map((entry) => `${entry.id} x${entry.qty}`).join(", ");
    continueLink.href = itemCount
      ? `contact.html?order=${encodeURIComponent(order)}&total=${encodeURIComponent(String(total))}&payment=${encodeURIComponent(payment)}`
      : "contact.html";
  }

  const offer = offerPlan();
  const paidCount = paidPlanCount();
  if (offerNotice) {
    offerNotice.textContent = offer && paidCount < 3
      ? `Add ${3 - paidCount} more paid plan${paidCount === 2 ? "" : "s"} to unlock ${offer.id}.`
      : offer && cart.has(offer.id) ? `${offer.id} is included in your basket.` : "";
  }
}

function initPortfolioFilters(): void {
  const categoryFilter = document.querySelector<HTMLSelectElement>('[data-project-filter="category"]');
  const yearFilter = document.querySelector<HTMLSelectElement>('[data-project-filter="year"]');
  const emptyState = document.querySelector<HTMLElement>("[data-project-empty]");
  const count = document.querySelector<HTMLElement>("[data-project-count]");
  if (!categoryFilter || !yearFilter) return;

  const filterProjects = () => {
    const cards = document.querySelectorAll<HTMLElement>("[data-project-card]");
    let visible = 0;
    cards.forEach((card) => {
      const matchesCategory = categoryFilter.value === "all" || card.dataset.category === categoryFilter.value;
      const matchesYear = yearFilter.value === "all" || card.dataset.year === yearFilter.value;
      card.hidden = !matchesCategory || !matchesYear;
      if (!card.hidden) visible += 1;
    });
    if (count) count.textContent = String(visible);
    if (emptyState) emptyState.hidden = visible > 0;
  };

  categoryFilter.addEventListener("change", filterProjects);
  yearFilter.addEventListener("change", filterProjects);
  if (count) count.textContent = String(portfolioProjects.length);
}

function prefillContactForm(): void {
  const message = document.querySelector<HTMLTextAreaElement>("[data-contact-message]");
  const service = document.querySelector<HTMLSelectElement>('select[name="service"]');
  if (!message) return;

  const parameters = new URLSearchParams(window.location.search);
  const context = [
    parameters.get("order") ? `Basket: ${parameters.get("order")}` : "",
    parameters.get("total") ? `Estimated total: ${formatUsd(Number(parameters.get("total")))}` : "",
    parameters.get("payment") ? `Preferred payment: ${parameters.get("payment")}` : "",
    parameters.get("plan") ? `Plan: ${parameters.get("plan")}` : "",
    parameters.get("project") ? `Project: ${parameters.get("project")}` : "",
    parameters.get("service") ? `Service: ${parameters.get("service")}` : ""
  ].filter(Boolean);

  if (context.length && !message.value) {
    message.value = `${context.join("\n")}\n\nA little more about my project:`;
  }

  const requestedService = parameters.get("service") || (parameters.has("plan") ? "Ready-made plan" : "");
  if (service && requestedService) {
    const option = Array.from(service.options).find((candidate) => candidate.value.toLowerCase() === requestedService.toLowerCase());
    if (option) service.value = option.value;
  }
}

function initContactForm(): void {
  const form = document.querySelector<HTMLFormElement>("[data-contact-form]");
  const feedback = document.querySelector<HTMLElement>("[data-contact-feedback]");
  if (!form) return;

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    if (!form.reportValidity()) return;

    const values = new FormData(form);
    const name = String(values.get("name") ?? "").trim();
    const email = String(values.get("email") ?? "").trim();
    const service = String(values.get("service") ?? "New project enquiry");
    const message = String(values.get("message") ?? "").trim();
    const subject = `Project enquiry${service ? ` — ${service}` : ""}`;
    const body = [`Name: ${name}`, `Email: ${email}`, `Project type: ${service || "Not specified"}`, "", message].join("\n");
    const mailto = `mailto:triecoteq@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

    if (feedback) feedback.textContent = "Your email app should open with the enquiry details ready to send.";
    window.location.href = mailto;
  });
}

export function initInteractions(page: PageName): void {
  initTheme();
  initNavigation();
  cart = loadCart();
  updateCartBadges();

  document.body.addEventListener("click", (event) => {
    const target = event.target;
    if (!(target instanceof Element)) return;
    const button = target.closest<HTMLButtonElement>("[data-add-plan]");
    if (button) addPlan(button.dataset.addPlan ?? "");
  });

  document.querySelectorAll<HTMLElement>("[data-checkout-items]").forEach((container) => {
    container.addEventListener("click", (event) => {
      const target = event.target;
      if (!(target instanceof Element)) return;
      const button = target.closest<HTMLButtonElement>("[data-cart-change]");
      if (button) setPlanQuantity(button.dataset.cartId ?? "", Number(button.dataset.cartChange));
    });
  });

  document.querySelector<HTMLButtonElement>("[data-clear-basket]")?.addEventListener("click", () => {
    cart.clear();
    updateCart();
    announce("Your basket has been cleared.");
  });

  document.querySelector<HTMLAnchorElement>("[data-checkout-continue]")?.addEventListener("click", (event) => {
    if (cart.size === 0) {
      event.preventDefault();
      announce("Add a plan before continuing.");
    }
  });

  document.querySelectorAll<HTMLInputElement>('input[name="payment"]').forEach((input) => {
    input.addEventListener("change", renderCheckout);
  });

  window.addEventListener("storage", (event) => {
    if (event.key === cartStorageKey) {
      cart = loadCart();
      updateCartBadges();
      updateOfferButton();
      renderCheckout();
    }
  });

  if (page === "portfolio") initPortfolioFilters();
  if (page === "contact") {
    prefillContactForm();
    initContactForm();
  }
  if (page === "plans" || page === "checkout") {
    updateOfferButton();
    renderCheckout();
  }

  document.body.addEventListener("error", (event) => {
    const target = event.target;
    if (!(target instanceof HTMLImageElement) || !target.hasAttribute("data-project-image")) return;
    if (target.dataset.fallbackApplied) return;
    target.dataset.fallbackApplied = "true";
    target.src = "/assets/hero/Proj%202.jpg";
  }, true);
}

export function refreshInteractions(): void {
  updateCartBadges();
  updateOfferButton();
  renderCheckout();
}
