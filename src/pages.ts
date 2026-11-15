import { designPlans, portfolioProjects, services, team, type DesignPlan, type PortfolioProject } from "./data";
import { escapeHtml, formatUsd } from "./utils";

export type PageName = "home" | "about" | "services" | "portfolio" | "contact" | "plans" | "checkout";

const navigation: Array<{ label: string; href: string; page: PageName }> = [
  { label: "Studio", href: "about.html", page: "about" },
  { label: "Services", href: "services.html", page: "services" },
  { label: "Work", href: "portfolio.html", page: "portfolio" },
  { label: "Ready-made plans", href: "buy-plan.html", page: "plans" },
  { label: "Contact", href: "contact.html", page: "contact" }
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
          <span>Nairobi, Kenya <span class="utility-dot"></span> Architecture, interiors &amp; place</span>
          <a href="mailto:triecoteq@gmail.com">Start a conversation <span aria-hidden="true">↗</span></a>
        </div>
      </div>
      <div class="container nav-shell">
        <a class="wordmark" href="index.html" aria-label="Tri-EcoTeq Architects home">
          <img src="/assets/brand/Tri-EcoTeq%20Architects%20Logo.png" alt="" width="42" height="42" />
          <span>Tri-EcoTeq <small>Architects</small></span>
        </a>
        <button class="nav-toggle" type="button" aria-expanded="false" aria-controls="primary-navigation" data-nav-toggle>
          <span class="sr-only">Open navigation</span>${icon("menu")}
        </button>
        <nav class="primary-navigation" id="primary-navigation" aria-label="Main navigation">
          ${links}
          <a class="nav-cart" href="checkout.html" aria-label="Open basket">
            Basket <span class="cart-count" data-cart-count>0</span>
          </a>
          <button class="theme-button" type="button" data-theme-toggle aria-label="Use dark theme" title="Toggle color theme">${icon("moon")}</button>
        </nav>
      </div>
    </header>`;
}

function footer(): string {
  return `
    <footer class="site-footer">
      <div class="container footer-main">
        <div class="footer-intro">
          <a class="wordmark wordmark-footer" href="index.html">
            <img src="/assets/brand/Tri-EcoTeq%20Architects%20Logo.png" alt="" width="42" height="42" />
            <span>Tri-EcoTeq <small>Architects</small></span>
          </a>
          <p>Thoughtful architecture for the way people live, work, and grow.</p>
        </div>
        <div>
          <p class="footer-label">Find us</p>
          <address>WoodVale Avenue, Westlands<br />Nairobi, Kenya</address>
          <a class="footer-link" href="https://maps.google.com/?q=WoodVale+Avenue+Westlands+Nairobi" target="_blank" rel="noopener noreferrer">Get directions ↗</a>
        </div>
        <div>
          <p class="footer-label">Say hello</p>
          <a class="footer-link" href="tel:+254728240363">+254 728 240 363</a>
          <a class="footer-link" href="mailto:triecoteq@gmail.com">triecoteq@gmail.com</a>
          <div class="footer-socials" aria-label="Social media">
            <a href="https://www.instagram.com/TRIECOTEQ" target="_blank" rel="noopener noreferrer">Instagram ↗</a>
            <a href="https://www.facebook.com/TriEcoTeqLTD" target="_blank" rel="noopener noreferrer">Facebook ↗</a>
            <a href="https://x.com/TRIECOTEQ" target="_blank" rel="noopener noreferrer">X ↗</a>
          </div>
        </div>
      </div>
      <div class="container footer-bottom">
        <span>© ${new Date().getFullYear()} Tri-EcoTeq Architects</span>
        <span>Designed with care in Nairobi</span>
      </div>
    </footer>
    <div class="toast" role="status" aria-live="polite" data-toast></div>`;
}

function pageHero(eyebrow: string, title: string, description: string): string {
  return `
    <section class="page-intro">
      <div class="container">
        <p class="eyebrow">${eyebrow}</p>
        <h1>${title}</h1>
        <p class="intro-copy">${description}</p>
      </div>
    </section>`;
}

function projectCard(project: PortfolioProject, index: number): string {
  return `
    <article class="project-card${index === 0 ? " project-card-featured" : ""}" data-project-card data-category="${escapeHtml(project.category)}" data-year="${escapeHtml(project.year)}">
      <a class="project-image" href="contact.html?project=${encodeURIComponent(project.title)}" aria-label="Ask about ${escapeHtml(project.title)}">
        <img src="${escapeHtml(project.image)}" alt="${escapeHtml(project.title)}" loading="lazy" data-project-image />
        <span class="project-index">${String(index + 1).padStart(2, "0")}</span>
        <span class="project-arrow">${icon("arrow")}</span>
      </a>
      <div class="project-caption">
        <div><p class="eyebrow">${escapeHtml(project.category)} <span class="caption-dot"></span> ${escapeHtml(project.year)}</p><h3>${escapeHtml(project.title)}</h3></div>
        <p>${escapeHtml(project.location)}</p>
      </div>
    </article>`;
}

function homePage(): string {
  const featured = portfolioProjects.slice(0, 3).map(projectCard).join("");
  const slides = [
    { image: "Mod1", title: "Residential architecture", description: "Contemporary residence with a landscaped garden and swimming pool", position: "center 58%" },
    { image: "Mod9", title: "Spaces to gather", description: "Warm family lounge opening onto a garden terrace", position: "center" },
    { image: "Mod8", title: "Room to retreat", description: "Bedroom suite with timber finishes and views into the garden", position: "center" },
    { image: "Mod7", title: "Details that make a difference", description: "Marble bathroom with a freestanding bath and softly illuminated mirrors", position: "center" },
    { image: "Mod2", title: "Connected living", description: "Double-height living space with a floating staircase and pool views", position: "center" }
  ];

  return `
    <main id="main-content">
      <section class="home-hero" aria-label="Tri-EcoTeq Architects showcase" aria-roledescription="carousel" data-hero-carousel>
        <div class="hero-backdrop" aria-hidden="true">
          ${slides.map((slide, index) => `
            <div class="hero-slide${index === 0 ? " is-active is-zooming" : ""}" data-hero-slide data-title="${slide.title}">
              <img src="/assets/hero/${slide.image}.jpg" alt="${slide.description}" style="object-position: ${slide.position}" fetchpriority="${index === 0 ? "high" : "low"}" decoding="async" />
            </div>
          `).join("")}
        </div>
        <div class="hero-shade" aria-hidden="true"></div>
        <div class="container home-hero-content">
          <div class="hero-copy">
            <p class="eyebrow"><span class="eyebrow-line"></span> Tri-EcoTeq Architects · Nairobi</p>
            <h1>Room to live.<br /><em>Space to become.</em></h1>
            <p class="hero-description">We shape homes and places with a clear point of view: beautiful, practical, and made for the lives unfolding inside them.</p>
            <div class="button-row">
              <a class="button button-light" href="portfolio.html">Explore our work ${icon("arrow")}</a>
              <a class="text-link" href="contact.html">Tell us what you’re planning <span aria-hidden="true">↗</span></a>
            </div>
            <div class="hero-footnote"><span class="status-dot"></span> Design-led. Detail-minded. Built around you.</div>
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
          <p class="eyebrow">Good design is a way of thinking.</p>
          <p>From the first conversation to the final detail, we bring architecture, engineering, and imagination to the same table.</p>
          <a class="round-link" href="about.html" aria-label="Meet the studio">${icon("arrow")}</a>
        </div>
      </section>

      <section class="section section-work">
        <div class="container">
          <div class="section-heading">
            <div><p class="eyebrow">A few things we’ve made</p><h2>Selected work<span class="heading-period">.</span></h2></div>
            <a class="text-link" href="portfolio.html">View all projects <span aria-hidden="true">↗</span></a>
          </div>
          <div class="project-grid project-grid-home" data-home-projects>${featured}</div>
        </div>
      </section>

      <section class="approach-band">
        <div class="container approach-grid">
          <p class="eyebrow">01 — Our approach</p>
          <h2>Make it meaningful.<br /><em>Make it make sense.</em></h2>
          <div><p>We believe good architecture earns its place: it answers a real need, makes the most of its setting, and stands up to everyday life.</p><a class="text-link text-link-light" href="services.html">How we can help <span aria-hidden="true">↗</span></a></div>
        </div>
      </section>

      <section class="section section-contact-cta">
        <div class="container contact-cta">
          <p class="eyebrow">Your project starts somewhere</p>
          <h2>Let’s start with<br /><em>a conversation.</em></h2>
          <a class="button button-light" href="contact.html">Get in touch ${icon("arrow")}</a>
        </div>
      </section>
    </main>`;
}

function aboutPage(): string {
  const teamCards = team.map((member, index) => `
    <article class="team-card">
      <div class="team-photo"><img src="${member.image}" alt="${escapeHtml(member.name)}" loading="lazy" /></div>
      <div class="team-caption"><span class="eyebrow">${String(index + 1).padStart(2, "0")} / ${escapeHtml(member.role)}</span><h3>${escapeHtml(member.name)}</h3><p>${escapeHtml(member.focus)}</p></div>
    </article>`).join("");

  return `
    <main id="main-content">
      ${pageHero("The studio", "A clear idea,<br /><em>carefully made.</em>", "We are a Nairobi-based team of architects, designers, and engineers who believe thoughtful work should feel as good as it functions.")}
      <section class="section section-story">
        <div class="container story-grid">
          <p class="eyebrow">A practice built on trust</p>
          <div><h2>Good work grows from good relationships.</h2><p>Tri-EcoTeq began with independent design work by founder Braxton Muma. Referrals grew into a practice, and a trusted circle of colleagues became a studio with architecture, structural design, and visualization under one roof.</p><p>Today, we bring those disciplines together early. Clients get one thoughtful team, clear communication, and a design that respects both the brief and the budget.</p><a class="text-link" href="contact.html">Meet us over a project brief <span aria-hidden="true">↗</span></a></div>
          <div class="story-aside"><span>10<span>+</span></span><p>years shaping projects with care</p></div>
        </div>
      </section>
      <section class="section section-team">
        <div class="container">
          <div class="section-heading"><div><p class="eyebrow">People make the practice</p><h2>Meet the team<span class="heading-period">.</span></h2></div><p>Different strengths, one shared commitment to thoughtful, buildable design.</p></div>
          <div class="team-grid">${teamCards}</div>
        </div>
      </section>
      <section class="section section-values">
        <div class="container">
          <div class="section-heading"><div><p class="eyebrow">What we believe</p><h2>Design with intent<span class="heading-period">.</span></h2></div></div>
          <div class="values-grid">
            <article><span>01</span><h3>Listen before drawing.</h3><p>The best brief is a conversation. We take time to understand what matters and what is possible.</p></article>
            <article><span>02</span><h3>Make every decision count.</h3><p>Good materials, clear plans, and careful coordination help a project feel considered from every angle.</p></article>
            <article><span>03</span><h3>Stay close to the build.</h3><p>Practical thinking and steady collaboration carry the design through to the finished place.</p></article>
          </div>
        </div>
      </section>
      <section class="section section-quote">
        <div class="container quote-layout"><p class="eyebrow">The way we work</p><blockquote>“We want every project to feel unmistakably its own—and entirely right for the people who call it theirs.”</blockquote><a class="text-link" href="services.html">Discover our services <span aria-hidden="true">↗</span></a></div>
      </section>
    </main>`;
}

function servicesPage(): string {
  const serviceCards = services.map((service) => `
    <article class="service-card">
      <span class="service-number">${service.number}</span>
      <div><h2>${escapeHtml(service.title)}</h2><p>${escapeHtml(service.description)}</p><a href="contact.html?service=${encodeURIComponent(service.title)}" class="service-link" aria-label="Enquire about ${escapeHtml(service.title)}">${icon("arrow")}</a></div>
    </article>`).join("");

  return `
    <main id="main-content">
      ${pageHero("What we do", "Ideas into places.<br /><em>Plans into reality.</em>", "A considered set of services for projects at every scale—from the first sketch to the final drawing set.")}
      <section class="section section-services">
        <div class="container">
          <div class="services-intro"><p class="eyebrow">A connected set of disciplines</p><p>Architecture, structure, interiors, and visualization work best when they work together. Our integrated team helps keep the thinking joined up from day one.</p></div>
          <div class="service-list">${serviceCards}</div>
        </div>
      </section>
      <section class="approach-band">
        <div class="container approach-grid">
          <p class="eyebrow">02 — From first meeting to handover</p>
          <h2>A good process<br /><em>makes room for good work.</em></h2>
          <div><p>We begin by listening, then define the brief, test ideas, and coordinate the details. You stay involved at every key decision—without having to manage every moving part.</p><a class="text-link text-link-light" href="contact.html">Talk through your brief <span aria-hidden="true">↗</span></a></div>
        </div>
      </section>
      <section class="section">
        <div class="container service-cta"><p class="eyebrow">Have a project in mind?</p><h2>Let’s work out<br /><em>what it could be.</em></h2><a class="button button-dark" href="contact.html">Start a conversation ${icon("arrow")}</a></div>
      </section>
    </main>`;
}

function portfolioPage(): string {
  const projects = portfolioProjects.map(projectCard).join("");
  const categories = [...new Set(portfolioProjects.map((project) => project.category))].sort();
  const years = [...new Set(portfolioProjects.map((project) => project.year))].sort().reverse();

  return `
    <main id="main-content">
      ${pageHero("Selected work", "Made for a place.<br /><em>Made for people.</em>", "A selection of ideas, studies, and built work shaped by context, collaboration, and the details of everyday life.")}
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
      <section class="section section-portfolio-note">
        <div class="container note-grid"><p class="eyebrow">Every project has a starting point</p><p>Need something specific? Tell us a little about your site, your brief, or the thing you can’t stop thinking about.</p><a class="round-link" href="contact.html" aria-label="Discuss a project">${icon("arrow")}</a></div>
      </section>
    </main>`;
}

function planCard(plan: DesignPlan): string {
  const image = plan.images[0] ?? "";
  const imageMarkup = image
    ? `<img src="${escapeHtml(image)}" alt="${escapeHtml(plan.title)} architectural plan preview" loading="lazy" />`
    : `<span class="plan-image-placeholder" aria-hidden="true">TEQ</span>`;
  const oldPrice = plan.oldPrice && plan.oldPrice > plan.currentPrice
    ? `<del>${formatUsd(plan.oldPrice)}</del>`
    : "";
  const offerNote = plan.offer
    ? `<span class="offer-note" data-offer-note>Unlocked with 3 paid plans</span>`
    : "";

  return `
    <article class="plan-card" data-plan-card data-plan-id="${escapeHtml(plan.id)}" data-offer="${plan.offer}">
      <div class="plan-image">${imageMarkup}<span class="plan-index">${escapeHtml(plan.id.replace("Proj-", ""))}</span>${plan.offer ? '<span class="plan-ribbon">A little extra</span>' : ""}</div>
      <div class="plan-body">
        <div class="plan-title-row"><h2>${escapeHtml(plan.title)}</h2><p class="plan-price">${oldPrice}<strong>${formatUsd(plan.currentPrice)}</strong></p></div>
        <p>${escapeHtml(plan.description)}</p>
        <div class="plan-actions"><a class="text-link" href="contact.html?plan=${encodeURIComponent(plan.id)}">Ask about this plan <span aria-hidden="true">↗</span></a><button type="button" class="button button-dark button-small" data-add-plan="${escapeHtml(plan.id)}" ${plan.offer ? "disabled" : ""}>${plan.offer ? "Unlock at 3 plans" : "Add to basket"}</button></div>
        ${offerNote}
      </div>
    </article>`;
}

function plansPage(): string {
  return `
    <main id="main-content">
      ${pageHero("Ready-made collection", "A good plan is<br /><em>a good place to start.</em>", "Explore completed residential design packages with coordinated architectural and structural drawings, ready to make your own.")}
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
    <main id="main-content">
      ${pageHero("Your selection", "The next step<br /><em>starts here.</em>", "Review your selected plans and tell us how you would like to continue.")}
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
            <p class="payment-disclaimer">No payment is taken here. We’ll confirm availability and next steps with you first.</p>
            <a class="button button-dark button-full" href="contact.html" data-checkout-continue aria-disabled="true">Continue to enquiry ${icon("arrow")}</a>
            <button type="button" class="clear-basket" data-clear-basket disabled>Clear basket</button>
          </aside>
        </div>
      </section>
    </main>`;
}

function contactPage(): string {
  return `
    <main id="main-content">
      ${pageHero("Start a conversation", "Tell us what you’re<br /><em>thinking about.</em>", "A first note doesn’t need to be a complete brief. Share what you know so far, and we’ll take it from there.")}
      <section class="section section-contact">
        <div class="container contact-layout">
          <div class="contact-form-wrap">
            <p class="eyebrow">The first conversation</p>
            <h2>What are you<br />hoping to make?</h2>
            <form class="contact-form" data-contact-form action="mailto:triecoteq@gmail.com" method="post" enctype="text/plain">
              <div class="form-pair">
                <label>Your name<input name="name" type="text" autocomplete="name" required placeholder="Name" /></label>
                <label>Email address<input name="email" type="email" autocomplete="email" required placeholder="you@example.com" /></label>
              </div>
              <label>What kind of project?<select name="service"><option value="">Choose one</option><option>Architecture</option><option>Interior design</option><option>Structural design</option><option>Working drawings</option><option>3D visualization</option><option>Ready-made plan</option><option>Something else</option></select></label>
              <label>A little about it<textarea name="message" rows="5" data-contact-message required placeholder="Location, project type, what you have in mind…"></textarea></label>
              <button class="button button-dark" type="submit">Prepare your message ${icon("arrow")}</button>
              <p class="form-note" data-contact-feedback>Submitting opens your email app with your enquiry ready to send.</p>
            </form>
          </div>
          <aside class="contact-aside">
            <div class="contact-aside-top"><p class="eyebrow">Come say hello</p><h3>WoodVale Avenue<br />Westlands, Nairobi</h3><a class="text-link" href="https://maps.google.com/?q=WoodVale+Avenue+Westlands+Nairobi" target="_blank" rel="noopener noreferrer">Get directions <span aria-hidden="true">↗</span></a></div>
            <div class="contact-aside-bottom">
              <p><span>Call</span><a href="tel:+254728240363">+254 728 240 363</a></p>
              <p><span>Email</span><a href="mailto:triecoteq@gmail.com">triecoteq@gmail.com</a></p>
              <p><span>Studio hours</span><span>Mon–Thu 8–5 · Fri 8–4<br />Sat 10:30–3 · Sun closed</span></p>
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
  contact: contactPage,
  plans: plansPage,
  checkout: checkoutPage
};

const pageTitles: Record<PageName, string> = {
  home: "Home",
  about: "The Studio",
  services: "Services",
  portfolio: "Selected Work",
  contact: "Contact",
  plans: "Ready-made Plans",
  checkout: "Basket"
};

export function renderPage(page: PageName): string {
  document.title = `${pageTitles[page]} | Tri-EcoTeq Architects`;
  return `${header(page)}${pageRenderers[page]()}${footer()}`;
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
