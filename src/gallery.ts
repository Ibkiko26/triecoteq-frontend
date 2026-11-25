import { designPlans, portfolioProjects } from "./data";
import { escapeHtml } from "./utils";

const triggerSelector = "[data-gallery-project], [data-gallery-plan]";
const slideDelay = 1800;

function galleryFor(trigger: HTMLButtonElement) {
  const project = portfolioProjects.find(({ id }) => id === trigger.dataset.galleryProject);
  if (project) return { ...project, contact: `contact.html?project=${encodeURIComponent(project.title)}`, demoPdf: undefined };
  const plan = designPlans.find(({ id }) => id === trigger.dataset.galleryPlan);
  return plan && { ...plan, contact: "" };
}

function triggerFrom(target: EventTarget | null): HTMLButtonElement | null {
  return target instanceof Element ? target.closest<HTMLButtonElement>(triggerSelector) : null;
}

export function initGalleries(): void {
  const dialog = document.querySelector<HTMLDialogElement>("[data-gallery-dialog]");
  if (!dialog) return;

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  let preview: { button: HTMLButtonElement; image: HTMLImageElement; cover: string; index: number; timer?: number } | undefined;
  let opener: HTMLButtonElement | undefined;

  function stopPreview(): void {
    if (!preview) return;
    window.clearTimeout(preview.timer);
    preview.image.src = preview.cover;
    preview = undefined;
  }

  document.addEventListener("pointerover", (event) => {
    if (event.pointerType !== "mouse" || reduceMotion.matches || dialog.open) return;
    const button = triggerFrom(event.target);
    if (!button || button === preview?.button || !button.classList.contains("gallery-trigger")) return;
    stopPreview();
    const gallery = galleryFor(button);
    const image = button.querySelector("img");
    if (!image || !gallery || gallery.images.length < 2) return;

    const state = { button, image, cover: image.getAttribute("src") || image.src, index: 0, timer: 0 };
    preview = state;
    let candidate = 0;
    const advance = async () => {
      if (preview !== state || !button.isConnected || !button.matches(":hover")) return;
      candidate = (candidate + 1) % gallery.images.length;
      const next = new Image();
      next.src = candidate === 0 ? state.cover : gallery.images[candidate];
      const loaded = await next.decode().then(() => true, () => false);
      if (preview !== state) return;
      if (loaded) {
        state.image.src = next.src;
        state.index = candidate;
      }
      state.timer = window.setTimeout(advance, slideDelay);
    };
    state.timer = window.setTimeout(advance, slideDelay);
  });

  document.addEventListener("pointerout", (event) => {
    if (preview && triggerFrom(event.target) === preview.button && triggerFrom(event.relatedTarget) !== preview.button) stopPreview();
  });
  reduceMotion.addEventListener("change", stopPreview);
  document.addEventListener("visibilitychange", stopPreview);

  document.addEventListener("click", (event) => {
    const trigger = triggerFrom(event.target);
    if (!trigger || dialog.open) return;
    const gallery = galleryFor(trigger);
    if (!gallery || (!gallery.images.length && !gallery.demoPdf)) return;
    const index = preview?.button === trigger ? preview.index : 0;
    stopPreview();
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
