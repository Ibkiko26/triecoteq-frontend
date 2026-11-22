import { designPlans } from "./data";
import { escapeHtml } from "./utils";

export function openPlanPreview(id: string): void {
  const plan = designPlans.find((item) => item.id === id);
  const dialog = document.querySelector<HTMLDialogElement>("[data-plan-demo]");
  if (!plan || !dialog || dialog.open || (!plan.images.length && !plan.demoPdf)) return;

  dialog.innerHTML = `
    <div class="plan-demo-header">
      <h2 id="plan-demo-title">${escapeHtml(plan.title)}</h2>
      <form method="dialog"><button class="plan-demo-button" type="submit" autofocus>Close</button></form>
    </div>
    ${plan.images.length ? `<figure class="plan-demo-image"><img data-plan-render alt="" /></figure>` : ""}
    ${plan.images.length > 1 ? `<div class="plan-demo-controls">
      <button class="plan-demo-button" type="button" data-previous-render>Previous render</button>
      <p role="status" data-render-count></p>
      <button class="plan-demo-button" type="button" data-next-render>Next render</button>
    </div>` : ""}
    <div class="plan-demo-details">
      <p>${escapeHtml(plan.description)}</p>
      ${plan.demoPdf ? `<a class="button button-dark button-small" href="${escapeHtml(plan.demoPdf)}" target="_blank" rel="noopener noreferrer">Open sample PDF</a>` : ""}
    </div>`;

  let index = 0;
  const image = dialog.querySelector<HTMLImageElement>("[data-plan-render]");
  const count = dialog.querySelector<HTMLElement>("[data-render-count]");
  function showRender(): void {
    if (!image || !plan) return;
    image.src = plan.images[index];
    image.alt = `${plan.title} render ${index + 1}`;
    if (count) count.textContent = `${index + 1} of ${plan.images.length}`;
  }
  dialog.querySelector("[data-previous-render]")?.addEventListener("click", () => {
    index = (index + plan.images.length - 1) % plan.images.length;
    showRender();
  });
  dialog.querySelector("[data-next-render]")?.addEventListener("click", () => {
    index = (index + 1) % plan.images.length;
    showRender();
  });
  showRender();
  dialog.showModal();
}
