const slideDuration = 9000;

export function initHeroCarousel(): void {
  const hero = document.querySelector<HTMLElement>("[data-hero-carousel]");
  if (!hero) return;

  const slides = Array.from(hero.querySelectorAll<HTMLElement>("[data-hero-slide]"));
  const selectors = Array.from(hero.querySelectorAll<HTMLButtonElement>("[data-hero-select]"));
  const pauseButton = hero.querySelector<HTMLButtonElement>("[data-hero-pause]");
  const caption = hero.querySelector<HTMLElement>("[data-hero-caption]");
  const number = hero.querySelector<HTMLElement>("[data-hero-number]");
  const status = hero.querySelector<HTMLElement>("[data-hero-status]");
  if (slides.length < 2 || !pauseButton) return;

  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  let current = 0;
  let userPaused = reducedMotion.matches;
  let controlsHovered = false;
  let inView = true;
  let timer: number | undefined;
  let startedAt = 0;
  let remaining = slideDuration;

  function stopTimer(): void {
    if (timer === undefined) return;
    window.clearTimeout(timer);
    timer = undefined;
    remaining = Math.max(0, remaining - (performance.now() - startedAt));
  }

  function updatePlayback(): void {
    const paused = userPaused || controlsHovered || !inView || document.hidden;
    hero!.classList.toggle("is-paused", paused);
    pauseButton!.setAttribute("aria-label", userPaused ? "Play slideshow" : "Pause slideshow");
    pauseButton!.setAttribute("aria-pressed", String(userPaused));
    pauseButton!.innerHTML = userPaused
      ? '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><path d="m9 5 10 7-10 7Z"/></svg>'
      : '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><path d="M9 5v14M15 5v14"/></svg>';

    if (paused) {
      stopTimer();
    } else if (timer === undefined) {
      startedAt = performance.now();
      timer = window.setTimeout(() => {
        timer = undefined;
        showSlide(current + 1);
      }, remaining);
    }
  }

  function showSlide(index: number, manual = false): void {
    const next = (index + slides.length) % slides.length;
    if (next === current) return;

    stopTimer();
    remaining = slideDuration;
    const outgoing = slides[current];
    current = next;

    slides.forEach((slide, slideIndex) => {
      slide.classList.toggle("is-active", slideIndex === current);
      if (slideIndex === current) slide.classList.add("is-zooming");
    });
    // Keep the outgoing image moving until its crossfade has finished.
    window.setTimeout(() => {
      if (!outgoing.classList.contains("is-active")) outgoing.classList.remove("is-zooming");
    }, 1500);

    selectors.forEach((selector, slideIndex) => {
      selector.classList.toggle("is-active", slideIndex === current);
      selector.setAttribute("aria-pressed", String(slideIndex === current));
    });

    const title = slides[current].dataset.title ?? "";
    if (caption) caption.textContent = title;
    if (number) number.textContent = `${String(current + 1).padStart(2, "0")} / ${String(slides.length).padStart(2, "0")}`;
    if (manual && status) status.textContent = `Image ${current + 1} of ${slides.length}: ${title}`;
    updatePlayback();
  }

  hero.querySelector("[data-hero-previous]")?.addEventListener("click", () => showSlide(current - 1, true));
  hero.querySelector("[data-hero-next]")?.addEventListener("click", () => showSlide(current + 1, true));
  selectors.forEach((selector, index) => selector.addEventListener("click", () => showSlide(index, true)));

  pauseButton.addEventListener("click", () => {
    userPaused = !userPaused;
    updatePlayback();
  });

  // Keyboard interaction stops autoplay until the visitor explicitly restarts it.
  hero.addEventListener("focusin", (event) => {
    if (event.target === pauseButton) return;
    userPaused = true;
    updatePlayback();
  });
  hero.addEventListener("keydown", (event) => {
    if (event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return;
    if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
    event.preventDefault();
    showSlide(current + (event.key === "ArrowRight" ? 1 : -1), true);
  });

  const controls = hero.querySelector<HTMLElement>(".hero-slideshow-controls");
  controls?.addEventListener("pointerenter", (event) => {
    if (event.pointerType !== "mouse") return;
    controlsHovered = true;
    updatePlayback();
  });
  controls?.addEventListener("pointerleave", () => {
    controlsHovered = false;
    updatePlayback();
  });

  // Consume horizontal trackpad gestures only; vertical scrolling stays native.
  let wheelTotal = 0;
  let lastWheelAt = 0;
  let lastWheelChange = 0;
  hero.addEventListener("wheel", (event) => {
    if (event.ctrlKey || event.metaKey) return;
    const horizontal = event.shiftKey && event.deltaX === 0 ? event.deltaY : event.deltaX;
    const vertical = event.shiftKey ? 0 : event.deltaY;
    if (Math.abs(horizontal) <= Math.abs(vertical) || horizontal === 0) return;
    event.preventDefault();
    const now = performance.now();
    if (now - lastWheelAt > 180 || Math.sign(wheelTotal) !== Math.sign(horizontal)) wheelTotal = 0;
    lastWheelAt = now;
    if (now - lastWheelChange < 1000) return;
    wheelTotal += horizontal * (event.deltaMode === WheelEvent.DOM_DELTA_LINE ? 16 : event.deltaMode === WheelEvent.DOM_DELTA_PAGE ? hero!.clientWidth : 1);
    if (Math.abs(wheelTotal) < 45) return;
    showSlide(current + Math.sign(wheelTotal), true);
    lastWheelChange = now;
    wheelTotal = 0;
  }, { passive: false });

  let gesture: { id: number; x: number; y: number } | undefined;
  hero.addEventListener("pointerdown", (event) => {
    if (event.pointerType === "mouse" || !event.isPrimary) return;
    if (event.target instanceof Element && event.target.closest("a, button")) return;
    gesture = { id: event.pointerId, x: event.clientX, y: event.clientY };
  });
  hero.addEventListener("pointerup", (event) => {
    if (!gesture || gesture.id !== event.pointerId) return;
    const dx = event.clientX - gesture.x;
    const dy = event.clientY - gesture.y;
    gesture = undefined;
    if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) * 1.4) {
      showSlide(current + (dx < 0 ? 1 : -1), true);
    }
  });
  hero.addEventListener("pointercancel", () => { gesture = undefined; });
  hero.querySelectorAll("img").forEach((image) => image.addEventListener("dragstart", (event) => event.preventDefault()));

  document.addEventListener("visibilitychange", updatePlayback);
  reducedMotion.addEventListener("change", () => {
    if (reducedMotion.matches) userPaused = true;
    updatePlayback();
  });
  const observer = new IntersectionObserver(([entry]) => {
    inView = entry.isIntersecting;
    updatePlayback();
  }, { threshold: 0.15 });
  observer.observe(hero);
  updatePlayback();
}
