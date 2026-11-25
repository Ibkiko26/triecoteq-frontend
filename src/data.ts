import portfolioContent from "../content/portfolio.json";
import planContent from "../content/buy-plans.json";

export interface PortfolioProject {
  id: string;
  title: string;
  category: string;
  location: string;
  year: string;
  description: string;
  priceLabel: string;
  image: string;
}

export interface DesignPlan {
  id: string;
  title: string;
  description: string;
  currentPrice: number;
  oldPrice: number | null;
  offer: boolean;
  images: string[];
  demoPdf?: string;
}

interface ContentStore {
  getData: () => {
    portfolioProjects: PortfolioProject[];
    plans: DesignPlan[];
  };
}

declare global {
  interface Window {
    TEQContentStore?: ContentStore;
  }
}

const availablePortfolioImages = new Set(
  Object.keys(import.meta.glob("../assets/portfolio/*")).map((path) => path.split("/").pop())
);
const portfolioPreviews = new Set(
  Object.keys(import.meta.glob("../assets/portfolio/previews/*.webp")).map((path) => path.split("/").pop())
);

export let portfolioProjects: PortfolioProject[] = [];
export let designPlans: DesignPlan[] = [];

function normalizePortfolioImage(path: string): string {
  const cleanPath = path.trim().replace(/^\/+/, "");
  const parts = cleanPath.split("/");
  const isProjectMedia = parts.length > 1 && (parts[0] === "assets" || parts[0] === "admin");
  if (!isProjectMedia || parts.some((part) => part === ".." || !part)) {
    return "/assets/hero/Proj%202.jpg";
  }

  const filename = parts[parts.length - 1];
  if (parts.length === 3 && parts[0] === "admin" && parts[1] === "portfolio-library" && portfolioPreviews.has(`${filename}.webp`)) {
    return `/assets/portfolio/previews/${encodeURIComponent(filename)}.webp`;
  }
  if (parts[0] === "assets" && parts[1] === "portfolio" && !availablePortfolioImages.has(filename)) {
    return "/assets/hero/Proj%202.jpg";
  }

  return `/${parts.map((part) => encodeURIComponent(part)).join("/")}`;
}

const publishedPortfolio = portfolioContent.portfolioProjects.map((project) => ({
  ...project,
  image: normalizePortfolioImage(project.image)
}));
const publishedProjectIds = new Set(publishedPortfolio.map(({ id }) => id));

function normalizePlan(plan: DesignPlan): DesignPlan {
  const demoPdf = plan.demoPdf && /^\/assets\/plan-demos\/[a-z0-9_-]+\.pdf$/i.test(plan.demoPdf)
    ? plan.demoPdf
    : undefined;
  return { ...plan, images: plan.images.filter(Boolean), demoPdf };
}

const publishedPlans = planContent.map(normalizePlan);
const publishedPlanIds = new Set(publishedPlans.map(({ id }) => id));

export function updateContentFromStore(): boolean {
  const store = window.TEQContentStore;
  if (!store) return false;

  const data = store.getData();
  // Deployments publish these records from Git. Keep local drafts that have no published counterpart.
  portfolioProjects = [
    ...publishedPortfolio,
    ...data.portfolioProjects.filter(({ id }) => !publishedProjectIds.has(id)).map((project) => ({
      ...project,
      image: normalizePortfolioImage(project.image)
    }))
  ];
  designPlans = [
    ...publishedPlans,
    ...data.plans.filter(({ id }) => !publishedPlanIds.has(id)).map(normalizePlan)
  ];
  return true;
}

portfolioProjects = publishedPortfolio;
designPlans = publishedPlans;

export const services = [
  {
    title: "Architecture",
    description: "We design homes and other buildings around your brief, site and budget, developing concepts into coordinated architectural drawings."
  },
  {
    title: "Interior design",
    description: "We plan layouts, lighting, finishes and furnishings to make interiors comfortable and practical for everyday use."
  },
  {
    title: "Structural design",
    description: "We develop and coordinate structural designs that support the architecture and give the construction team a clear basis for building."
  },
  {
    title: "Mechanical drawings",
    description: "We prepare mechanical services drawings and coordinate system layouts with the architecture and structure."
  },
  {
    title: "Electrical drawings",
    description: "We prepare drawings for lighting and power, coordinating their layouts with how the building will be used."
  },
  {
    title: "Landscape design",
    description: "We plan gardens, outdoor living areas and routes through the site so they work with the building and its surroundings."
  },
  {
    title: "Working drawings",
    description: "We document dimensions, materials and construction details in coordinated drawing sets for the project team."
  },
  {
    title: "3D visualization",
    description: "We create 3D models and renderings so you can see how spaces, materials and finishes work together before construction begins."
  },
  {
    title: "Project advisory",
    description: "We guide you through design decisions, budgets and consultant coordination as the project moves towards construction."
  }
];

export const team = [
  {
    name: "Braxton Muma",
    role: "Founder",
    focus: "Architectural, mechanical, and electrical planning.",
    image: "/assets/team/braxton-muma.webp"
  },
  {
    name: "Ibrahim Kiprotich",
    role: "Co-founder",
    focus: "3D architectural modelling and visualization.",
    image: "/assets/team/ibrahim-kiprotich.webp"
  },
  {
    name: "Wilfred Omondi",
    role: "Co-founder",
    focus: "Architectural design and structural planning.",
    image: "/assets/team/wilfred-omondi.webp"
  },
  {
    name: "Joseph Mbugua",
    role: "Architectural planner",
    focus: "Architectural planning, interior design and project documentation.",
    image: "/assets/team/joseph-mbugua.webp"
  }
];

export const clientFeedback = [
  {
    name: "Jennifer T.",
    summary: "Recommended the practice after seeing the quality of its work early on."
  },
  {
    name: "Brian P.",
    summary: "Felt confident he would return to the team for his next project."
  },
  {
    name: "Angela C.",
    summary: "Appreciated how the team developed her initial idea and found the service affordable."
  }
];
