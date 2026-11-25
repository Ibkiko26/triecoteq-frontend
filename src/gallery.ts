import { designPlans, portfolioProjects } from "./data";
import { escapeHtml } from "./utils";

const triggerSelector = "[data-gallery-project], [data-gallery-plan]";
const previewSelector = "[data-gallery-preview]";
const slideDelay = 1800;

interface CardPreview {
  card: HTMLElement;
  image: HTMLImageElement;
  images: string[];
  title: string;
  cover: string;
  coverAlt: string;
  status: HTMLElement;
  index: number;
  requested: number;
  version: number;
  manual: boolean;
}

function galleryFor(trigger: HTMLButtonElement) {
  const project = portfolioProjects.find(({ id }) => id === trigger.dataset.galleryProject);
  if (project) return { ...project, contact: `contact.html?project=${encodeURIComponent(project.title)}`, demoPdf: undefined };
  const plan = designPlans.find(({ id }) => id === trigger.dataset.galleryPlan);
  return plan && { ...plan, contact: "" };
}

function triggerFrom(target: EventTarget | null): HTMLButtonElement | null {
  return target instanceof Element ? target.closest<HTMLButtonElement>(triggerSelector) : null;
}

function previewFrom(target: EventTarget | null): HTMLElement | null {
  return target instanceof Element ? target.closest<HTMLElement>(previewSelector) : null;
}

export function initGalleries(): void {
  const dialog = document.querySelector<HTMLDialogElement>("[data-gallery-dialog]");
  if (!dialog) return;

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const previews = new WeakMap<HTMLElement, CardPreview>();
  let hovered: CardPreview | undefined;
  let timer: number | undefined;
  let opener: HTMLButtonElement | undefined;

  function previewFor(card: HTMLElement): CardPreview | undefined {
    const existing = previews.get(card);
    if (existing) return existing;
    const trigger = card.querySelector<HTMLButtonElement>(triggerSelector);
    const gallery = trigger && galleryFor(trigger);
    const image = trigger?.querySelector("img");
    const status = card.querySelector<HTMLElement>("[data-preview-status]");
    if (!gallery || gallery.images.length < 2 || !image || !status) return;
    const state: CardPreview = {
      card, image, status, images: gallery.images, title: gallery.title,
      cover: image.getAttribute("src") || image.src, coverAlt: image.alt,
      index: 0, requested: 0, version: 0, manual: false
    };
    previews.set(card, state);
    return state;
  }

  function displayImage(state: CardPreview, index: number, src: string): void {
    state.index = index;
    state.image.src = src;
    state.image.alt = index === 0 ? state.coverAlt : `${state.title}, image ${index + 1}`;
  }

  function stopHover(): void {
    window.clearTimeout(timer);
    const state = hovered;
    hovered = undefined;
    if (!state) return;
    state.version++;
    state.requested = state.manual ? state.index : 0;
    if (!state.manual && state.index !== 0) displayImage(state, 0, state.cover);
  }

  async function advance(state: CardPreview, direction: number): Promise<void> {
    const index = (state.requested + direction + state.images.length) % state.images.length;
    const version = ++state.version;
    state.requested = index;
    const src = index === 0 ? state.cover : state.images[index];
    const next = new Image();
    next.src = src;
    const loaded = await next.decode().then(() => true, () => false);
    if (version !== state.version || !state.card.isConnected) return;
    if (loaded) {
      displayImage(state, index, src);
      if (state.manual) state.status.textContent = `${state.title}, image ${index + 1} of ${state.images.length}`;
    } else if (state.manual) {
      state.status.textContent = "This image could not load. Try another image.";
    }
  }

  function stepCard(card: HTMLElement, direction: number): void {
    const state = previewFor(card);
    if (!state) return;
    state.manual = true;
    if (hovered === state) stopHover();
    void advance(state, direction);
  }

  document.addEventListener("pointerover", (event) => {
    if (event.pointerType !== "mouse" || reduceMotion.matches || dialog.open) return;
    const card = previewFrom(event.target);
    if (!card || card === hovered?.card) return;
    stopHover();
    const state = previewFor(card);
    if (!state || state.manual) return;
    hovered = state;
    const rotate = async () => {
      if (hovered !== state || !card.isConnected || !card.matches(":hover")) return;
      await advance(state, 1);
      if (hovered === state) timer = window.setTimeout(rotate, slideDelay);
    };
    timer = window.setTimeout(rotate, slideDelay);
  });

  document.addEventListener("pointerout", (event) => {
    if (hovered && previewFrom(event.target) === hovered.card && previewFrom(event.relatedTarget) !== hovered.card) stopHover();
  });
  reduceMotion.addEventListener("change", stopHover);
  document.addEventListener("visibilitychange", stopHover);

  document.addEventListener("keydown", (event) => {
    if (dialog.open || event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return;
    if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
    const card = previewFrom(event.target);
    if (!card?.querySelector("[data-preview-step]")) return;
    event.preventDefault();
    stepCard(card, event.key === "ArrowLeft" ? -1 : 1);
  });

  document.addEventListener("click", (event) => {
    if (dialog.open || !(event.target instanceof Element)) return;
    const card = previewFrom(event.target);
    const arrow = event.target.closest<HTMLButtonElement>("[data-preview-step]");
    if (card && arrow) {
      stepCard(card, Number(arrow.dataset.previewStep));
      return;
    }
    const trigger = triggerFrom(event.target);
    if (!trigger) return;
    const gallery = galleryFor(trigger);
    if (!gallery || (!gallery.images.length && !gallery.demoPdf)) return;
    const index = card ? previews.get(card)?.index ?? 0 : 0;
    stopHover();
    opener = trigger;
    showGallery(dialog, gallery, index);
  });

  dialog.addEventListener("close", () => {
    dialog.replaceChildren();
    dialog.onkeydown = null;
    opener?.focus();
    opener = undefined;
  });
}

function showGallery(
  dialog: HTMLDialogElement,
  { title, images, description, demoPdf, contact }: { title: string; images: string[]; description: string; demoPdf?: string; contact: string },
  index: number
): void {
  dialog.innerHTML = `
    <div class="plan-demo-header">
      <h2 id="gallery-title">${escapeHtml(title)}</h2>
      <form method="dialog"><button class="plan-demo-button" type="submit" autofocus>Close</button></form>
    </div>
    ${images.length ? '<figure class="plan-demo-image"><img data-gallery-image alt="" /></figure>' : ""}
    ${images.length > 1 ? `<div class="plan-demo-controls">
      <button class="plan-demo-button" type="button" data-gallery-step="-1">Previous image</button>
      <p role="status" data-gallery-count></p>
      <button class="plan-demo-button" type="button" data-gallery-step="1">Next image</button>
    </div>
    <div class="gallery-thumbnails" role="group" aria-label="Choose an image">
      ${images.map((src, position) => `<button type="button" data-gallery-index="${position}" aria-label="Show image ${position + 1}" aria-pressed="false"><img src="${escapeHtml(src)}" alt="" loading="lazy" decoding="async" /></button>`).join("")}
    </div>` : ""}
    <div class="plan-demo-details">
      <p>${escapeHtml(description)}</p>
      ${demoPdf ? `<a class="button button-dark button-small" href="${escapeHtml(demoPdf)}" target="_blank" rel="noopener noreferrer">Open sample PDF</a>` : ""}
      ${contact ? `<a class="button button-dark button-small" href="${escapeHtml(contact)}">Ask about this project</a>` : ""}
    </div>`;

  const image = dialog.querySelector<HTMLImageElement>("[data-gallery-image]");
  const count = dialog.querySelector<HTMLElement>("[data-gallery-count]");
  const thumbnails = Array.from(dialog.querySelectorAll<HTMLButtonElement>("[data-gallery-index]"));
  function showImage(position: number): void {
    if (!image) return;
    index = (position + images.length) % images.length;
    image.src = images[index];
    image.alt = images.length === 1 && description ? description : `${title}, image ${index + 1}`;
    if (count) count.textContent = `${index + 1} of ${images.length}`;
    thumbnails.forEach((button, thumbnail) => button.setAttribute("aria-pressed", String(index === thumbnail)));
  }

  dialog.querySelectorAll<HTMLButtonElement>("[data-gallery-step]").forEach((button) => {
    button.addEventListener("click", () => showImage(index + Number(button.dataset.galleryStep)));
  });
  thumbnails.forEach((button, position) => button.addEventListener("click", () => showImage(position)));
  dialog.onkeydown = (event) => {
    if (images.length < 2 || (event.key !== "ArrowLeft" && event.key !== "ArrowRight")) return;
    event.preventDefault();
    showImage(index + (event.key === "ArrowLeft" ? -1 : 1));
  };
  showImage(index);
  dialog.showModal();
}
