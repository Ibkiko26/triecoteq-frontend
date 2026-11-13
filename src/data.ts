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
  if (parts[0] === "assets" && parts[1] === "portfolio" && !availablePortfolioImages.has(filename)) {
    return "/assets/hero/Proj%202.jpg";
  }

  return `/${parts.map((part) => encodeURIComponent(part)).join("/")}`;
}

export function updateContentFromStore(): boolean {
  const store = window.TEQContentStore;
  if (!store) return false;

  const data = store.getData();
  portfolioProjects = data.portfolioProjects.map((project) => ({
    ...project,
    image: normalizePortfolioImage(project.image)
  }));
  designPlans = data.plans.map((plan) => ({
    ...plan,
    images: plan.images.filter(Boolean)
  }));
  return true;
}

portfolioProjects = portfolioContent.portfolioProjects.map((project) => ({
  ...project,
  image: normalizePortfolioImage(project.image)
}));
designPlans = planContent.map((plan) => ({ ...plan, images: plan.images }));

export const services = [
  {
    number: "01",
    title: "Architecture",
    description: "From first sketch to planning set, we shape homes and workplaces around the people who use them."
  },
  {
    number: "02",
    title: "Interior design",
    description: "Material, light, and furniture come together in interiors that feel considered and easy to live in."
  },
  {
    number: "03",
    title: "Structural design",
    description: "Clear engineering coordination keeps the ambition of a design grounded in buildable detail."
  },
  {
    number: "04",
    title: "Working drawings",
    description: "Detailed, coordinated documentation gives the project team the clarity to build with confidence."
  },
  {
    number: "05",
    title: "3D visualization",
    description: "Spatial studies and rendered views help make the important decisions before construction begins."
  },
  {
    number: "06",
    title: "Project advisory",
    description: "Practical guidance through consultants, budgets, and construction protects the intent of the work."
  }
];

export const team = [
  {
    name: "Braxton Muma",
    role: "Founder",
    focus: "Architectural, mechanical, and electrical planning.",
    image: "/assets/team/Braxton%20Muma.png"
  },
  {
    name: "Ibrahim Kiprotich",
    role: "Co-founder",
    focus: "3D architectural modelling and visualization.",
    image: "/assets/team/Ibrahim%20Koros.jpg"
  },
  {
    name: "Wilfred Omondi",
    role: "Co-founder",
    focus: "Structural planning, performance, and durability.",
    image: "/assets/team/Wilfred%20Omondi.png"
  },
  {
    name: "Joseph Mbugua",
    role: "Architectural planner",
    focus: "Interior design and project documentation.",
    image: "/assets/team/Joseph%20Mbugua.jpg"
  }
];
