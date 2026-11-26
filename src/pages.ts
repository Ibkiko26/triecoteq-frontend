import { clientFeedback, designPlans, portfolioProjects, services, team, type DesignPlan, type PortfolioProject } from "./data";
import { renderCareersSections } from "./careers";
import { renderNewsSection } from "./news";
import { escapeHtml, formatUsd } from "./utils";
import firstHeroImage from "../assets/hero/Mod1.webp?url";

export type PageName = "home" | "about" | "services" | "portfolio" | "careers" | "contact" | "plans" | "checkout";

const navigation: Array<{ label: string; href: string; page: PageName }> = [
  { label: "About", href: "about.html", page: "about" },
  { label: "Services", href: "services.html", page: "services" },
  { label: "Portfolio", href: "portfolio.html", page: "portfolio" },
  { label: "Ready-made plans", href: "buy-plan.html", page: "plans" }
];

const wordmarkImage = "/assets/brand/wordmark.webp";

// The Facebook and Pinterest marks are from Bootstrap Icons (MIT).
const socialLinks = [
  {
    label: "Facebook",
    href: "https://web.facebook.com/TriEcoTeqLTD",
    viewBox: "0 0 16 16",
    mark: '<path d="M16 8.049c0-4.446-3.582-8.05-8-8.05C3.58 0-.002 3.603-.002 8.05c0 4.017 2.926 7.347 6.75 7.951v-5.625h-2.03V8.05H6.75V6.275c0-2.017 1.195-3.131 3.022-3.131.876 0 1.791.157 1.791.157v1.98h-1.009c-.993 0-1.303.621-1.303 1.258v1.51h2.218l-.354 2.326H9.25V16c3.824-.604 6.75-3.934 6.75-7.951"/>'
  },
  {
    label: "X",
    href: "https://x.com/TriEcoTeq",
    viewBox: "0 0 24 24",
    mark: '<path d="M18.9 1.15h3.68l-8.04 9.19L24 22.85h-7.41l-5.8-7.59-6.64 7.59H.47l8.6-9.84L0 1.15h7.59l5.25 6.94zM17.61 20.64h2.04L6.49 3.24H4.3z"/>'
  },
  {
    label: "Instagram",
    href: "https://www.instagram.com/triecoteq",
    viewBox: "2 2 20 20",
    mark: '<g fill="none" stroke="currentColor" stroke-width="1.8"><rect x="3.2" y="3.2" width="17.6" height="17.6" rx="5"/><circle cx="12" cy="12" r="4.2"/></g><circle cx="17" cy="7" r="1.2"/>'
  },
  {
    label: "Pinterest",
    href: "https://www.pinterest.com/Triecoteq/",
    viewBox: "0 0 16 16",
    mark: '<path d="M8 0a8 8 0 0 0-2.915 15.452c-.07-.633-.134-1.606.027-2.297.146-.625.938-3.977.938-3.977s-.239-.479-.239-1.187c0-1.113.645-1.943 1.448-1.943.682 0 1.012.512 1.012 1.127 0 .686-.437 1.712-.663 2.663-.188.796.4 1.446 1.185 1.446 1.422 0 2.515-1.5 2.515-3.664 0-1.915-1.377-3.254-3.342-3.254-2.276 0-3.612 1.707-3.612 3.471 0 .688.265 1.425.595 1.826a.24.24 0 0 1 .056.23c-.061.252-.196.796-.222.907-.035.146-.116.177-.268.107-1-.465-1.624-1.926-1.624-3.1 0-2.523 1.834-4.84 5.286-4.84 2.775 0 4.932 1.977 4.932 4.62 0 2.757-1.739 4.976-4.151 4.976-.811 0-1.573-.421-1.834-.919l-.498 1.902c-.181.695-.669 1.566-.995 2.097A8 8 0 1 0 8 0"/>'
  }
];

function icon(name: "arrow" | "sun" | "moon" | "menu" | "close" | "plus" | "minus"): string {
  const paths: Record<typeof name, string> = {
    arrow: '<path d="M4 12h15M13 5l7 7-7 7"/>',
    sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2m0 16v2M4.93 4.93l1.42 1.42m11.3 11.3 1.42 1.42M2 12h2m16 0h2M4.93 19.07l1.42-1.42m11.3-11.3 1.42-1.42"/>',
    moon: '<path d="M20.5 15.5A8.5 8.5 0 0 1 8.5 3.5 8.5 8.5 0 1 0 20.5 15.5Z"/>',
    menu: '<path d="M4 7h16M4 12h16M4 17h16"/>',
    close: '<path d="m6 6 12 12M18 6 6 18"/>',
    plus: '<path d="M12 5v14M5 12h14"/>',
    minus: '<path d="M5 12h14"/>'
  };

  return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths[name]}</svg>`;
}

function header(page: PageName): string {
  const links = navigation.map(({ label, href, page: target }) => `
    <a class="nav-link${target === page ? " is-active" : ""}" href="${href}"${target === page ? ' aria-current="page"' : ""}>${label}</a>
  `).join("");

  return `
    <a class="skip-link" href="#main-content">Skip to content</a>
    <header class="site-header">
      <div class="utility-bar">
        <div class="container utility-inner">
          <span>Nairobi, Kenya</span>
          <a href="tel:+254728240363">+254 728 240 363</a>
        </div>
      </div>
      <div class="container nav-shell">
        <a class="wordmark" href="index.html" aria-label="Tri-EcoTeq Architects home"${page === "home" ? ' aria-current="page"' : ""}>
          <img src="${wordmarkImage}" alt="" width="42" height="42" />
          <span>Tri-EcoTeq <small>Architects</small></span>
        </a>
        <button class="nav-toggle" type="button" aria-expanded="false" aria-controls="primary-navigation" data-nav-toggle>
          Menu <span class="nav-toggle-open">${icon("menu")}</span><span class="nav-toggle-close">${icon("close")}</span>
        </button>
        <nav class="primary-navigation" id="primary-navigation" aria-label="Main navigation">
          ${links}
          <a class="nav-cart" href="checkout.html"${page === "checkout" ? ' aria-current="page"' : ""}>
            Basket <span class="cart-count" data-cart-count>0</span>
          </a>
          <button class="theme-button" type="button" data-theme-toggle aria-label="Use dark theme" title="Toggle color theme">${icon("moon")}</button>
          <a class="button button-dark nav-cta" href="contact.html"${page === "contact" ? ' aria-current="page"' : ""}>Discuss your project ${icon("arrow")}</a>
        </nav>
      </div>
    </header>`;
}

function footer(page: PageName): string {
  const socialIcons = socialLinks.map(({ label, href, viewBox, mark }) => `
    <a href="${href}" target="_blank" rel="noopener noreferrer" aria-label="${label} (opens in a new tab)" title="${label}">
      <svg viewBox="${viewBox}" fill="currentColor" aria-hidden="true">${mark}</svg>
    </a>
  `).join("");

  return `
    <footer class="site-footer">
      <div class="container footer-main">
        <div class="footer-intro">
          <a class="wordmark wordmark-footer" href="index.html">
            <img src="${wordmarkImage}" alt="" width="42" height="42" loading="lazy" decoding="async" />
            <span>Tri-EcoTeq <small>Architects</small></span>
          </a>
          <p>Architecture, interiors and engineering for projects in Nairobi and beyond.</p>
        </div>
        <nav aria-label="Studio links">
          <p class="footer-label">The practice</p>
          <a class="footer-link" href="about.html"${page === "about" ? ' aria-current="page"' : ""}>About the studio</a>
          <a class="footer-link" href="careers.html"${page === "careers" ? ' aria-current="page"' : ""}>Careers</a>
          <a class="footer-link" href="contact.html"${page === "contact" ? ' aria-current="page"' : ""}>Contact</a>
        </nav>
        <div>
          <p class="footer-label">Find us</p>
          <address>WoodVale Avenue, Westlands<br />Nairobi, Kenya</address>
          <a class="footer-link" href="https://maps.google.com/?q=WoodVale+Avenue+Westlands+Nairobi" target="_blank" rel="noopener noreferrer">Get directions ↗</a>
        </div>
        <div class="footer-contact">
          <p class="footer-label">Say hello</p>
          <a class="footer-link" href="tel:+254728240363">+254 728 240 363</a>
          <a class="footer-link" href="mailto:triecoteq@gmail.com">triecoteq@gmail.com</a>
          <nav class="footer-socials" aria-label="Social media">${socialIcons}</nav>
        </div>
      </div>
      <div class="container footer-bottom">
        <span>© ${new Date().getFullYear()} Tri-EcoTeq Architects</span>
      </div>
    </footer>
    <div class="toast" role="status" aria-live="polite" data-toast></div>`;
}

function pageHero(title: string, description: string, eyebrow?: string): string {
  return `
    <section class="page-intro">
      <div class="container">
        ${eyebrow ? `<p class="eyebrow">${eyebrow}</p>` : ""}
        <h1>${title}</h1>
        <p class="intro-copy">${description}</p>
      </div>
    </section>`;
}

function cardGallery(
  kind: "project" | "plan", { id, title, images }: Pick<PortfolioProject, "id" | "title" | "images">, cover: string, alt: string
): string {
  const count = images.length;
  const name = escapeHtml(title);
  return `
    <button class="gallery-trigger" type="button" data-gallery-${kind}="${escapeHtml(id)}" aria-label="Open gallery for ${name}${count > 1 ? `, ${count} images` : ""}" aria-haspopup="dialog">
      <img src="${escapeHtml(cover)}" alt="${escapeHtml(alt)}" loading="lazy" decoding="async"${kind === "project" ? " data-project-image" : ""} />
      <span class="gallery-badge" aria-hidden="true">${count > 1 ? `${count} images` : "Open gallery"}</span>
    </button>
    ${count > 1 ? `
      <button class="gallery-preview-arrow" type="button" data-preview-step="-1" aria-label="Previous image for ${name}">${icon("arrow")}</button>
      <button class="gallery-preview-arrow" type="button" data-preview-step="1" aria-label="Next image for ${name}">${icon("arrow")}</button>
      <span class="sr-only" role="status" data-preview-status></span>` : ""}`;
}

function projectCard(project: PortfolioProject, index: number): string {
  return `
    <article class="project-card${index === 0 ? " project-card-featured" : ""}" data-project-card data-category="${escapeHtml(project.category)}" data-year="${escapeHtml(project.year)}">
      <div class="project-image" data-gallery-preview>${cardGallery("project", project, project.image, project.description || project.title)}</div>
      <div class="project-caption">
        <div><p class="eyebrow">${escapeHtml(project.category)} <span class="caption-dot"></span> ${escapeHtml(project.year)}</p><h3>${escapeHtml(project.title)}</h3></div>
        <p>${escapeHtml(project.location)}</p>
      </div>
    </article>`;
}

function homePage(): string {
  const featured = portfolioProjects.slice(0, 3).map(projectCard).join("");
  const feedback = clientFeedback.find(({ name }) => name === "Angela C.");
  const slides = [
    { image: firstHeroImage, title: "Residential architecture", description: "Contemporary residence with a landscaped garden and swimming pool" },
    { image: "/assets/hero/Mod9.webp", title: "Spaces to gather", description: "Warm family lounge opening onto a garden terrace" },
    { image: "/assets/hero/Mod8.webp", title: "Room to retreat", description: "Bedroom suite with timber finishes and views into the garden" },
    { image: "/assets/hero/Mod7.webp", title: "Details that make a difference", description: "Marble bathroom with a freestanding bath and softly illuminated mirrors" },
    { image: "/assets/hero/Mod2.webp", title: "Connected living", description: "Double-height living space with a floating staircase and pool views" }
  ];

  return `
    <main id="main-content" tabindex="-1">
      <section class="home-hero" aria-label="Tri-EcoTeq Architects showcase" aria-roledescription="carousel" data-hero-carousel>
        <div class="hero-backdrop">
          ${slides.map((slide, index) => `
            <div class="hero-slide${index === 0 ? " is-active is-zooming" : ""}" data-hero-slide data-title="${slide.title}" aria-hidden="${index !== 0}">
              ${index === 0 ? `<img src="${slide.image}" alt="${slide.description}" fetchpriority="high" decoding="async" />` : `<template><img src="${slide.image}" alt="${slide.description}" decoding="async" /></template>`}
            </div>
          `).join("")}
        </div>
        <div class="hero-shade" aria-hidden="true"></div>
        <div class="container home-hero-content">
          <div class="hero-copy">
            <p class="eyebrow"><span class="eyebrow-line"></span> Tri-EcoTeq Architects</p>
            <h1>Architects and <br /><em>Interior Designers</em></h1>
            <p class="hero-description">We turn your ideas into contemporary homes and spaces that suit the way you live, the site and your budget.</p>
            <div class="button-row">
              <a class="button button-light" href="contact.html">Discuss your project ${icon("arrow")}</a>
              <a class="button button-outline" href="portfolio.html">View selected work</a>
            </div>
          </div>
        </div>
        <div class="container hero-bottom-bar">
          <a class="hero-scroll-link" href="#home-introduction">Scroll to explore <span aria-hidden="true">↓</span></a>
          <div class="hero-slide-caption"><span class="hero-slide-number" data-hero-number>01 / 05</span><span data-hero-caption>${slides[0].title}</span></div>
          <div class="hero-slideshow-controls" role="group" aria-label="Slideshow controls">
            <div class="hero-slide-selectors" role="group" aria-label="Choose an image">
              ${slides.map((slide, index) => `<button class="hero-slide-selector${index === 0 ? " is-active" : ""}" type="button" data-hero-select="${index}" aria-label="Show image ${index + 1}: ${slide.title}" aria-pressed="${index === 0}"><span></span></button>`).join("")}
            </div>
            <button class="hero-control hero-control-previous" type="button" data-hero-previous aria-label="Previous image">${icon("arrow")}</button>
            <button class="hero-control" type="button" data-hero-pause aria-label="Pause slideshow" aria-pressed="false"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><path d="M9 5v14M15 5v14"/></svg></button>
            <button class="hero-control" type="button" data-hero-next aria-label="Next image">${icon("arrow")}</button>
          </div>
        </div>
        <p class="sr-only" data-hero-status aria-live="polite" aria-atomic="true"></p>
      </section>

      <section class="intro-strip" id="home-introduction">
        <div class="container intro-strip-inner">
          <h2 class="eyebrow">About the practice</h2>
          <p>Tri-EcoTeq brings architects, designers and engineers together in Nairobi. We work closely with you from the initial brief through to the details your project team needs to build.</p>
          <a class="text-link" href="about.html">About Tri-EcoTeq</a>
        </div>
      </section>

      <section class="approach-band">
        <div class="container approach-grid">
          <p class="eyebrow">Services</p>
          <h2>From concept to <br /><em>construction drawings</em></h2>
          <div><p>We coordinate architecture, interiors, landscape and structural design with mechanical and electrical drawings. Our 3D renderings help you understand the design before construction begins.</p><a class="text-link text-link-light" href="services.html">Explore our services</a></div>
        </div>
      </section>

      <section class="section section-work">
        <div class="container">
          <div class="section-heading">
            <h2>Selected work</h2>
            <a class="text-link" href="portfolio.html">View the portfolio</a>
          </div>
          <div class="project-grid project-grid-home" data-home-projects>${featured}</div>
        </div>
      </section>

      ${renderNewsSection()}

      <section class="section section-contact-cta">
        <div class="container contact-cta-layout">
          ${feedback ? `<article class="home-feedback" aria-labelledby="home-feedback-title">
            <h2 class="eyebrow" id="home-feedback-title">Client feedback</h2>
            <p class="home-feedback-summary">${escapeHtml(feedback.summary)}</p>
            <p class="home-feedback-name">${escapeHtml(feedback.name)}</p>
            <a class="text-link" href="about.html#client-feedback">Read more client feedback ${icon("arrow")}</a>
          </article>` : ""}
          <div class="contact-cta">
            <h2>Planning a project?</h2>
            <p>Tell us what you have in mind and we’ll help you work out where to start.</p>
            <a class="button button-light" href="contact.html">Discuss your project ${icon("arrow")}</a>
          </div>
        </div>
      </section>
    </main>`;
}

function aboutPage(): string {
  const teamCards = team.map((member) => `
    <article class="team-card">
      <div class="team-photo"><img src="${member.image}" alt="Portrait of ${escapeHtml(member.name)}" loading="lazy" decoding="async" /></div>
      <div class="team-caption"><span class="eyebrow">${escapeHtml(member.role)}</span><h3>${escapeHtml(member.name)}</h3><p>${escapeHtml(member.focus)}</p></div>
    </article>`).join("");
  const feedbackItems = clientFeedback.map(({ name, summary }) => `
    <li><p>${escapeHtml(summary)}</p><p class="feedback-name">${escapeHtml(name)}</p></li>
  `).join("");

  return `
    <main id="main-content" tabindex="-1">
      ${pageHero("About <em>Tri-EcoTeq</em>", "We are a Nairobi-based practice bringing architecture, interior design and engineering together to meet the needs of each client.")}
      <section class="section section-story">
        <div class="container story-grid">
          <h2>Our story</h2>
          <div><p>Tri-EcoTeq grew out of founder Braxton Muma’s independent design work. As client referrals grew, he brought together colleagues with expertise in architecture, building services, structural planning and 3D modelling.</p><p>We start by understanding what each client needs and bring the relevant specialists into the conversation early. That helps us resolve design and construction questions while keeping the project aligned with the brief and budget.</p><a class="text-link" href="contact.html">Talk to our team</a></div>
        </div>
      </section>
      <section class="section section-values">
        <div class="container">
          <div class="section-heading"><h2>Our design philosophy</h2><p>We aim for buildings that are functional, economical, structurally sound and visually appealing.</p></div>
          <div class="values-grid">
            <article><h3>Imagine</h3><p>Listen to the client and explore what the brief and site make possible.</p></article>
            <article><h3>Test</h3><p>Assess ideas against how spaces will be used, what they will cost and how they can be built.</p></article>
            <article><h3>Plan</h3><p>Coordinate the design, engineering and materials before the work reaches site.</p></article>
            <article><h3>Deliver</h3><p>Prepare the drawings and work with the project team to carry the design through construction.</p></article>
          </div>
        </div>
      </section>
      <section class="section section-team">
        <div class="container">
          <div class="section-heading"><h2>Meet the team</h2></div>
          <div class="team-grid">${teamCards}</div>
        </div>
      </section>
      <section class="section section-feedback" id="client-feedback">
        <div class="container">
          <div class="section-heading"><h2>Client feedback</h2><p>Summarised from testimonials shared on our original website.</p></div>
          <ul class="feedback-grid">${feedbackItems}</ul>
        </div>
      </section>
    </main>`;
}

function servicesPage(): string {
  const serviceCards = services.map((service) => `
    <article class="service-card">
      <h2>${escapeHtml(service.title)}</h2>
      <p>${escapeHtml(service.description)}</p>
      <a class="text-link service-link" href="contact.html?service=${encodeURIComponent(service.title)}" aria-label="Enquire about ${escapeHtml(service.title)}">Enquire</a>
    </article>`).join("");

  return `
    <main id="main-content" tabindex="-1">
      ${pageHero("Design <em>services</em>", "From early concepts to construction drawings, we bring the disciplines your project needs into one coordinated design process.")}
      <section class="section section-services">
        <div class="container">
          <div class="service-list">${serviceCards}</div>
        </div>
      </section>
      <section class="approach-band">
        <div class="container approach-grid">
          <p class="eyebrow">Working together</p>
          <h2>From brief to <br /><em>building site</em></h2>
          <div><p>We agree on the brief with you, test design options and coordinate the technical details. We discuss key decisions with you as the project progresses so the design reflects your priorities.</p><a class="text-link text-link-light" href="contact.html">Talk through your brief</a></div>
        </div>
      </section>
    </main>`;
}

function portfolioPage(): string {
  const projects = portfolioProjects.map(projectCard).join("");
  const categories = [...new Set(portfolioProjects.map((project) => project.category))].sort();
  const years = [...new Set(portfolioProjects.map((project) => project.year))].sort().reverse();
  const archiveProject = "Proposed three-bedroom home";

  return `
    <main id="main-content" tabindex="-1">
      ${pageHero("<em>Portfolio</em>", "Explore residential, interior and commercial work alongside hospitality, institutional and civic projects. The portfolio includes design proposals, studies and completed work.")}
      <section class="section section-portfolio">
        <div class="container">
          <div class="portfolio-toolbar">
            <p><span data-project-count>${portfolioProjects.length}</span> projects <span class="caption-dot"></span> Nairobi &amp; beyond</p>
            <div class="filter-group">
              <label><span class="sr-only">Filter by category</span><select data-project-filter="category"><option value="all">All disciplines</option>${categories.map((category) => `<option value="${escapeHtml(category)}">${escapeHtml(category)}</option>`).join("")}</select></label>
              <label><span class="sr-only">Filter by year</span><select data-project-filter="year"><option value="all">All years</option>${years.map((year) => `<option value="${escapeHtml(year)}">${escapeHtml(year)}</option>`).join("")}</select></label>
            </div>
          </div>
          <div class="project-grid project-grid-portfolio" data-project-grid>${projects}</div>
          <p class="empty-state" data-project-empty hidden>No projects match these filters. Try another combination.</p>
        </div>
      </section>
      <section class="section section-archive">
        <div class="container">
          <div class="section-heading"><h2>From our archive</h2></div>
          <article class="archive-project">
            <img src="/assets/images/archived-three-bedroom-house.png" alt="Street-level rendering of the two-storey house with orange rooflines and glazed balconies" width="768" height="432" loading="lazy" />
            <div>
              <h3>${archiveProject}</h3>
              <p>The design includes a guest bedroom and staff quarters.</p>
              <a class="text-link" href="contact.html?project=${encodeURIComponent(archiveProject)}">Ask about this design</a>
            </div>
          </article>
        </div>
      </section>
      <section class="section section-portfolio-note">
        <div class="container note-grid"><p class="eyebrow">Planning to build?</p><p>Tell us about your site and the spaces you need.</p><a class="text-link" href="contact.html">Discuss your project</a></div>
      </section>
    </main>`;
}

function planCard(plan: DesignPlan): string {
  const image = plan.images[0] ?? "";
  const imageMarkup = image
    ? cardGallery("plan", plan, image, `${plan.title} architectural plan preview`)
    : `<span class="plan-image-placeholder" aria-hidden="true">TEQ</span>`;
  const oldPrice = plan.oldPrice && plan.oldPrice > plan.currentPrice
    ? `<del>${formatUsd(plan.oldPrice)}</del>`
    : "";
  const offerNote = plan.offer
    ? `<span class="offer-note" data-offer-note>Unlocked with 3 paid plans</span>`
    : "";

  return `
    <article class="plan-card" data-plan-card data-plan-id="${escapeHtml(plan.id)}" data-offer="${plan.offer}">
      <div class="plan-image" data-gallery-preview>${imageMarkup}<span class="plan-index">${escapeHtml(plan.id.replace("Proj-", ""))}</span>${plan.offer ? '<span class="plan-ribbon">A little extra</span>' : ""}</div>
      <div class="plan-body">
        <div class="plan-title-row"><h2>${escapeHtml(plan.title)}</h2><p class="plan-price">${oldPrice}<strong>${formatUsd(plan.currentPrice)}</strong></p></div>
        <p>${escapeHtml(plan.description)}</p>
        <div class="plan-actions">
          ${plan.images.length || plan.demoPdf ? `<button type="button" class="plan-demo-button" aria-label="View demo for ${escapeHtml(plan.title)}" data-gallery-plan="${escapeHtml(plan.id)}" aria-haspopup="dialog">View demo</button>` : ""}
          <a class="text-link" href="contact.html?plan=${encodeURIComponent(plan.id)}">Ask about this plan</a>
          <button type="button" class="button button-dark button-small" data-add-plan="${escapeHtml(plan.id)}" ${plan.offer ? "disabled" : ""}>${plan.offer ? "Unlock at 3 plans" : "Add to basket"}</button>
        </div>
        ${offerNote}
      </div>
    </article>`;
}

function plansPage(): string {
  return `
    <main id="main-content" tabindex="-1">
      ${pageHero("A good plan is<br /><em>a good place to start.</em>", "Explore completed residential design packages with coordinated architectural and structural drawings, ready to make your own.", "Ready-made collection")}
      <section class="section section-plans">
        <div class="container">
          <div class="plans-toolbar"><p>${designPlans.filter((plan) => !plan.offer).length} design packages</p><a class="text-link" href="checkout.html">View basket <span data-cart-count class="inline-count">0</span> <span aria-hidden="true">↗</span></a></div>
          <div class="plan-grid" data-plan-grid>${designPlans.map(planCard).join("")}</div>
          <aside class="plans-note"><span class="eyebrow">A note on the drawings</span><p>Every site is different. We recommend confirming local requirements and engaging a local professional before building from any standard plan.</p></aside>
        </div>
      </section>
    </main>`;
}

function checkoutPage(): string {
  return `
    <main id="main-content" tabindex="-1">
      ${pageHero("The next step<br /><em>starts here.</em>", "Review your selected plans and tell us how you would like to continue.", "Your selection")}
      <section class="section section-checkout">
        <div class="container checkout-layout">
          <section class="checkout-items-panel">
            <div class="checkout-panel-heading"><div><p class="eyebrow">In your basket</p><h2>Your plans</h2></div><a class="text-link" href="buy-plan.html">Keep browsing <span aria-hidden="true">↗</span></a></div>
            <div class="checkout-items" data-checkout-items></div>
            <a class="empty-basket-link" href="buy-plan.html" data-empty-basket hidden>Explore ready-made plans <span aria-hidden="true">↗</span></a>
          </section>
          <aside class="order-summary">
            <p class="eyebrow">Order summary</p>
            <div class="summary-row"><span>Plans <span data-checkout-count>0</span></span><strong data-checkout-total>$0</strong></div>
            <p class="summary-note" data-checkout-offer></p>
            <fieldset class="payment-fieldset"><legend>Preferred payment method</legend>
              <label><input type="radio" name="payment" value="Card" checked /><span>Card</span></label>
              <label><input type="radio" name="payment" value="PayPal" /><span>PayPal</span></label>
              <label><input type="radio" name="payment" value="Bitcoin" /><span>Bitcoin</span></label>
              <label><input type="radio" name="payment" value="USDT" /><span>USDT</span></label>
              <label><input type="radio" name="payment" value="USDC" /><span>USDC</span></label>
            </fieldset>
            <p class="payment-disclaimer">Send your order enquiry and the studio will confirm availability and payment details. After payment is confirmed, the studio will send a private link to the drawing PDF.</p>
            <a class="button button-dark button-full" href="contact.html" data-checkout-continue aria-disabled="true">Continue to enquiry ${icon("arrow")}</a>
            <button type="button" class="clear-basket" data-clear-basket disabled>Clear basket</button>
          </aside>
        </div>
      </section>
    </main>`;
}

function contactPage(): string {
  const serviceOptions = services.map(({ title }) => `<option>${escapeHtml(title)}</option>`).join("");

  return `
    <main id="main-content" tabindex="-1">
      ${pageHero("Contact <em>us</em>", "Tell us about a project, ask about our services or call to arrange a visit to our Nairobi studio.")}
      <section class="section section-contact">
        <div class="container contact-layout">
          <div class="contact-form-wrap">
            <h2>Project enquiry</h2>
            <form class="contact-form enquiry-form" data-contact-form action="/api/submit-inquiry" method="post">
              <div class="form-pair">
                <div class="form-field">
                  <label for="enquiry-name">Your name</label>
                  <input id="enquiry-name" name="name" type="text" autocomplete="name" maxlength="120" aria-describedby="enquiry-name-error" data-required-message="Enter your name." required />
                  <p class="field-error" id="enquiry-name-error" hidden></p>
                </div>
                <div class="form-field">
                  <label for="enquiry-email">Email address</label>
                  <input id="enquiry-email" name="email" type="email" autocomplete="email" maxlength="254" pattern="[^\\s@]+@[^\\s@]+\\.[^\\s@]+" aria-describedby="enquiry-email-error" data-required-message="Enter your email address." required />
                  <p class="field-error" id="enquiry-email-error" hidden></p>
                </div>
              </div>
              <div class="form-field">
                <label for="enquiry-service">Service <span class="field-optional">(optional)</span></label>
                <select id="enquiry-service" name="service"><option value="">Choose a service</option>${serviceOptions}<option>Ready-made plan</option><option>Something else</option></select>
              </div>
              <div class="form-field">
                <label for="enquiry-message">Project details</label>
                <p class="field-hint" id="enquiry-message-hint">Share the project location and what you have in mind.</p>
                <textarea id="enquiry-message" name="message" rows="5" data-contact-message maxlength="8000" aria-describedby="enquiry-message-hint enquiry-message-error" data-required-message="Tell us a little about your project." required></textarea>
                <p class="field-error" id="enquiry-message-error" hidden></p>
              </div>
              <div hidden><label>Leave this empty<input name="website" type="text" tabindex="-1" autocomplete="off" /></label></div>
              <button class="button button-dark" type="submit">Send enquiry</button>
              <p class="form-note" role="status" data-contact-feedback></p>
              <a class="text-link" href="mailto:triecoteq@gmail.com" data-contact-email-fallback hidden>Send by email instead</a>
            </form>
          </div>
          <aside class="contact-aside">
            <div class="contact-aside-top"><h2>Visit the studio</h2><address>WoodVale Avenue<br />Westlands, Nairobi, Kenya</address><a class="text-link" href="https://maps.google.com/?q=WoodVale+Avenue+Westlands+Nairobi" target="_blank" rel="noopener noreferrer">Get directions</a></div>
            <div>
              <dl class="contact-details">
                <div><dt>Call</dt><dd><a href="tel:+254728240363">+254 728 240 363</a></dd></div>
                <div><dt>Email</dt><dd><a href="mailto:triecoteq@gmail.com">triecoteq@gmail.com</a></dd></div>
              </dl>
              <h3>Studio hours</h3>
              <dl class="contact-details">
                <div><dt>Monday–Thursday</dt><dd>8:00 am–5:00 pm</dd></div>
                <div><dt>Friday</dt><dd>8:00 am–4:00 pm</dd></div>
                <div><dt>Saturday</dt><dd>10:30 am–3:00 pm</dd></div>
                <div><dt>Sunday</dt><dd>Closed</dd></div>
              </dl>
              <p class="holiday-hours">Holiday hours may vary.</p>
            </div>
          </aside>
        </div>
      </section>
    </main>`;
}

const pageRenderers: Record<PageName, () => string> = {
  home: homePage,
  about: aboutPage,
  services: servicesPage,
  portfolio: portfolioPage,
  careers: () => `
    <main id="main-content" tabindex="-1">
      ${pageHero("<em>Careers</em>", "Explore opportunities across architecture, interior design, engineering and construction at our Nairobi practice.")}
      ${renderCareersSections()}
    </main>`,
  contact: contactPage,
  plans: plansPage,
  checkout: checkoutPage
};

const pageTitles: Record<PageName, string> = {
  home: "Home",
  about: "About",
  services: "Services",
  portfolio: "Portfolio",
  careers: "Careers",
  contact: "Contact",
  plans: "Ready-made Plans",
  checkout: "Basket"
};

export function renderPage(page: PageName): string {
  document.title = `${pageTitles[page]} | Tri-EcoTeq Architects`;
  const showsGallery = page === "home" || page === "portfolio" || page === "plans";
  const gallery = showsGallery ? '<dialog class="plan-demo-dialog" aria-labelledby="gallery-title" data-gallery-dialog></dialog>' : "";
  return `${header(page)}${pageRenderers[page]()}${footer(page)}${gallery}`;
}

export function refreshProjectListings(): void {
  const homeGrid = document.querySelector<HTMLElement>("[data-home-projects]");
  const projectGrid = document.querySelector<HTMLElement>("[data-project-grid]");

  if (homeGrid) {
    homeGrid.innerHTML = portfolioProjects.slice(0, 3).map(projectCard).join("");
  }

  if (projectGrid) {
    projectGrid.innerHTML = portfolioProjects.map(projectCard).join("");
    const categorySelect = document.querySelector<HTMLSelectElement>('[data-project-filter="category"]');
    const yearSelect = document.querySelector<HTMLSelectElement>('[data-project-filter="year"]');

    if (categorySelect) {
      const selectedCategory = categorySelect.value;
      const categories = [...new Set(portfolioProjects.map((project) => project.category))].sort();
      categorySelect.innerHTML = `<option value="all">All disciplines</option>${categories.map((category) => `<option value="${escapeHtml(category)}">${escapeHtml(category)}</option>`).join("")}`;
      categorySelect.value = categories.includes(selectedCategory) ? selectedCategory : "all";
      categorySelect.dispatchEvent(new Event("change"));
    }

    if (yearSelect) {
      const selectedYear = yearSelect.value;
      const years = [...new Set(portfolioProjects.map((project) => project.year))].sort().reverse();
      yearSelect.innerHTML = `<option value="all">All years</option>${years.map((year) => `<option value="${escapeHtml(year)}">${escapeHtml(year)}</option>`).join("")}`;
      yearSelect.value = years.includes(selectedYear) ? selectedYear : "all";
      yearSelect.dispatchEvent(new Event("change"));
    }
  }

  const count = document.querySelector<HTMLElement>("[data-project-count]");
  if (count) count.textContent = String(portfolioProjects.length);
}

export function refreshPlanListings(): void {
  const grid = document.querySelector<HTMLElement>("[data-plan-grid]");
  if (grid) grid.innerHTML = designPlans.map(planCard).join("");
}
