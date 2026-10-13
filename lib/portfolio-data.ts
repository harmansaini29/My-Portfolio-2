// lib/portfolio-data.ts
// ============================================================================
// CENTRALIZED SOCIAL & CONTACT CONFIGURATION (Requirement R6)
// ============================================================================

export interface SocialLink {
  readonly name: string;
  readonly url: string;
  readonly handle?: string;
  readonly label?: string;
}

export const SOCIAL_LINKS = {
  github: {
    name: 'GitHub',
    url: 'https://www.github.com/harmansaini29',
    handle: '@Harmansaini11',
    label: 'Open Source',
  },
  linkedin: {
    name: 'LinkedIn',
    url: 'https://www.linkedin.com/in/harman-saini-d29/',
    handle: 'harman-saini-d29',
    label: 'Professional Network',
  },
  twitter: {
    name: 'Twitter',
    url: 'https://x.com/Harmansaini2905',
    handle: '@harmansaini29',
    label: 'Social Updates',
  },
  email: {
    name: 'Email',
    url: 'mailto:harmansinghsaini4134@gmail.com',
    handle: 'harmansinghsaini4134@gmail.com',
    label: "Let's Talk",
  },
} as const;

export type SocialKey = keyof typeof SOCIAL_LINKS;

// ============================================================================
// PORTFOLIO MEDIA ASSET REGISTRY & TYPE DEFINITIONS (Requirement R3)
// ============================================================================

export type MediaType = 'image' | 'video';

export interface MediaAsset {
  readonly type: MediaType;
  readonly url: string;
  readonly posterUrl?: string; // Fallback image or video poster
  readonly videoUrl?: string;  // Explicit video demo URL
  readonly alt?: string;
  readonly width?: number;
  readonly height?: number;
}

// ----------------------------------------------------------------------------
// 1. Centralized Media Assets Registry
// ----------------------------------------------------------------------------
export const PORTFOLIO_MEDIA = {
  hero: {
    base: {
      type: 'image' as const,
      url: '/images/base.png',
      alt: 'Harman Saini Portrait Base Layer',
    },
    portrait: {
      type: 'image' as const,
      url: '/images/portrait.png',
      alt: 'Harman Saini Main Portrait Layer',
    },
    chrome: {
      type: 'image' as const,
      url: '/images/chrome.png',
      alt: 'Harman Saini Liquid Chrome Mask Layer',
    },
  },
  journey: {
    school: {
      type: 'image' as const,
      url: '/images/journey/school.jpg',
      alt: 'Smt. Kantaben Chandulal Gandhi English School – Kalyan Education Society',
    },
    college: {
      type: 'image' as const,
      url: '/images/journey/college.jpg',
      alt: 'Holy Angels School & Junior College',
    },
    university: {
      type: 'image' as const,
      url: '/images/journey/university.jpg',
      alt: 'Chhatrapati Shivaji Maharaj University – Navi Mumbai',
    },
    zathura: {
      type: 'image' as const,
      url: '/images/journey/zathura2.jpg',
      alt: 'Zathura Ventures – Freelancer',
    },
    growsphere: {
      type: 'image' as const,
      url: '/images/journey/growsphere.jpg',
      alt: 'GrowSphere – Founder & Community Builder',
    },
  },
  projects: {
    umbrella: {
      type: 'image' as const,
      url: '/images/Projects/umbrella.jpeg',
      videoUrl: '', // Ready for video demo URL e.g. '/videos/umbrella-demo.mp4'
      alt: 'Project UMBRELLA Autonomous Multi-Agent System',
    },
    harriot: {
      type: 'image' as const,
      url: '/images/Projects/Harriot.jpeg',
      videoUrl: '',
      alt: 'Harriot SOA Smart Occupancy Agent',
    },
    aegis: {
      type: 'image' as const,
      url: 'images/Projects/Aegis.Ai.jpeg',
      videoUrl: '',
      alt: 'Aegis.AI Intelligent Anti-Bot Defense',
    },
    connex: {
      type: 'image' as const,
      url: '/images/Projects/Connex Systems.jpeg',
      videoUrl: '',
      alt: 'Connex Systems Railway Automation',
    },
    nyaya: {
      type: 'image' as const,
      url: 'https://images.unsplash.com/photo-1589829085413-56de8ae18c73?w=900&auto=format&fit=crop&q=60',
      videoUrl: '',
      alt: 'NyayaAI Legal Copilot',
    },
    pgRental: {
      type: 'image' as const,
      url: '/images/Projects/Karamstay Pg app.jpeg',
      videoUrl: '',
      alt: 'PG Rental CRM Platform',
    },
    onlineGyan: {
      type: 'image' as const,
      url: 'https://images.unsplash.com/photo-1501504905252-473c47e087f8?w=900&auto=format&fit=crop&q=60',
      videoUrl: '',
      alt: 'OnlineGyan EdTech Portal',
    },
    smartUmpire: {
      type: 'image' as const,
      url: 'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?w=900&auto=format&fit=crop&q=60',
      videoUrl: '',
      alt: 'Smart AI Umpire 3D System',
    },
    cetPortal: {
      type: 'image' as const,
      url: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=900&auto=format&fit=crop&q=60',
      videoUrl: '',
      alt: 'CET Exam Utility Portal',
    },
    aiLogoMaker: {
      type: 'image' as const,
      url: 'https://images.unsplash.com/photo-1626785774573-4b799315345d?w=900&auto=format&fit=crop&q=60',
      videoUrl: '',
      alt: 'Generative AI Logo Maker',
    },
  },
  achievements: {
    hackathonWinner: {
      type: 'image' as const,
      url: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=800&auto=format&fit=crop&q=60',
      alt: '2× Hackathon Winner Trophy',
    },
    ghostMode: {
      type: 'image' as const,
      url: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=800&auto=format&fit=crop&q=60',
      alt: 'Ghost Mode Security Challenge',
    },
    enigmaTop10: {
      type: 'image' as const,
      url: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&auto=format&fit=crop&q=60',
      alt: 'ENIGMA National Top 10 Finalist',
    },
    hacknova7th: {
      type: 'image' as const,
      url: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=800&auto=format&fit=crop&q=60',
      alt: 'HackNova 7th Place Award',
    },
    nptelGold: {
      type: 'image' as const,
      url: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=800&auto=format&fit=crop&q=60',
      alt: 'NPTEL Elite Gold Certification',
    },
  },
} as const;

export const HERO_MEDIA = PORTFOLIO_MEDIA.hero;

// ----------------------------------------------------------------------------
// 2. Strongly Typed Domain Entities
// ----------------------------------------------------------------------------

export interface JourneyItem {
  readonly id: string;
  readonly title: string;
  readonly desc: string;
  readonly period?: string;
  readonly media: MediaAsset;
  readonly image: string; // Backward compatibility alias
  readonly video?: string;
}

export interface ProjectItem {
  readonly id: string;
  readonly title: string;
  readonly desc: string;
  readonly media: MediaAsset;
  readonly image: string; // Backward compatibility alias
  readonly video?: string;
  readonly link?: string;
  readonly github?: string;
  readonly tags?: readonly string[];
}

export interface AchievementItem {
  readonly id: string;
  readonly text: string;
  readonly media: MediaAsset;
  readonly image: { readonly src: string; readonly alt?: string }; // HoverImageReveal format
  readonly video?: string;
  readonly link?: string;
}

// ----------------------------------------------------------------------------
// 3. Centralized Data Collections (Fully Compatible with UI Components)
// ----------------------------------------------------------------------------

export const CAROUSEL_DATA: readonly JourneyItem[] = [
  {
    id: 'school',
    title: 'Smt. K.C. Gandhi English School',
    desc: 'Kalyan Education Society | Foundation Years | Kalyan, Maharashtra',
    period: '2009 - 2020',
    media: PORTFOLIO_MEDIA.journey.school,
    image: PORTFOLIO_MEDIA.journey.school.url,
  },
  {
    id: 'college',
    title: 'Holy Angels School & Junior College',
    desc: 'HSC Science | Nurturing Future Potential | Love & Serve',
    period: '2020 - 2022',
    media: PORTFOLIO_MEDIA.journey.college,
    image: PORTFOLIO_MEDIA.journey.college.url,
  },
  {
    id: 'university',
    title: 'Chhatrapati Shivaji Maharaj University',
    desc: 'B.Tech CSE | CGPA 8.6 | Navi Mumbai | 2023 – 2027',
    period: '2023 - 2027',
    media: PORTFOLIO_MEDIA.journey.university,
    image: PORTFOLIO_MEDIA.journey.university.url,
  },
  {
    id: 'zathura',
    title: 'Zathura Ventures',
    desc: 'Freelancer | Full-Stack & AI Engineering | Client-Facing Products',
    period: '2024 - Present',
    media: PORTFOLIO_MEDIA.journey.zathura,
    image: PORTFOLIO_MEDIA.journey.zathura.url,
  },
  {
    id: 'growsphere',
    title: 'Founder @ GrowSphere',
    desc: 'Community Builder | 1,200+ Developers | Learn. Build. Grow.',
    period: 'Mar 2026 - Present',
    media: PORTFOLIO_MEDIA.journey.growsphere,
    image: PORTFOLIO_MEDIA.journey.growsphere.url,
  },
];

export const PROJECT_DATA: readonly ProjectItem[] = [
  {
    id: 'umbrella',
    title: 'Project UMBRELLA',
    desc: 'Risk-Aware Multi-Agent Fault Detection System',
    media: PORTFOLIO_MEDIA.projects.umbrella,
    image: PORTFOLIO_MEDIA.projects.umbrella.url,
    video: PORTFOLIO_MEDIA.projects.umbrella.videoUrl,
    github: 'https://github.com/Harmansaini11/project-umbrella',
    link: 'https://github.com/Harmansaini11/project-umbrella',
    tags: ['Multi-Agent', 'Fault Detection', 'Python'],
  },
  {
    id: 'harriot-soa',
    title: 'Harriot SOA',
    desc: 'Smart Occupancy Agent | React | FastAPI | LangGraph',
    media: PORTFOLIO_MEDIA.projects.harriot,
    image: PORTFOLIO_MEDIA.projects.harriot.url,
    video: PORTFOLIO_MEDIA.projects.harriot.videoUrl,
    github: 'https://github.com/Harmansaini11/harriot-soa',
    link: 'https://github.com/Harmansaini11/harriot-soa',
    tags: ['LangGraph', 'FastAPI', 'React'],
  },
  {
    id: 'aegis-ai',
    title: 'Aegis.AI',
    desc: 'Intelligent Anti-Bot Defense | Live → aegis-ai.vercel.app',
    media: PORTFOLIO_MEDIA.projects.aegis,
    image: PORTFOLIO_MEDIA.projects.aegis.url,
    video: PORTFOLIO_MEDIA.projects.aegis.videoUrl,
    github: 'https://github.com/Harmansaini11/aegis-ai',
    link: 'https://aegis-ai.vercel.app',
    tags: ['Cybersecurity', 'Anti-Bot', 'Next.js'],
  },
  {
    id: 'connex-systems',
    title: 'Connex Systems',
    desc: 'Railway Concession Automation | 60% Less Manual Processing',
    media: PORTFOLIO_MEDIA.projects.connex,
    image: PORTFOLIO_MEDIA.projects.connex.url,
    video: PORTFOLIO_MEDIA.projects.connex.videoUrl,
    github: 'https://github.com/Harmansaini11/connex-railways',
    link: 'https://github.com/Harmansaini11/connex-railways',
    tags: ['Automation', 'PostgreSQL', 'Express'],
  },
  {
    id: 'nyaya-ai',
    title: 'NyayaAI',
    desc: 'AI Legal Copilot | OCR | NER | RAG | FAISS',
    media: PORTFOLIO_MEDIA.projects.nyaya,
    image: PORTFOLIO_MEDIA.projects.nyaya.url,
    video: PORTFOLIO_MEDIA.projects.nyaya.videoUrl,
    github: 'https://github.com/Harmansaini11/nyaya-ai',
    link: 'https://github.com/Harmansaini11/nyaya-ai',
    tags: ['RAG', 'FAISS', 'NER', 'OCR'],
  },
  {
    id: 'pg-rental',
    title: 'PG Rental CRM',
    desc: 'Property Management | 10,000+ Users',
    media: PORTFOLIO_MEDIA.projects.pgRental,
    image: PORTFOLIO_MEDIA.projects.pgRental.url,
    video: PORTFOLIO_MEDIA.projects.pgRental.videoUrl,
    github: 'https://github.com/Harmansaini11/pg-rental-crm',
    link: 'https://github.com/Harmansaini11/pg-rental-crm',
    tags: ['CRM', 'Next.js', 'Prisma'],
  },
  {
    id: 'online-gyan',
    title: 'OnlineGyan',
    desc: 'E-learning Platform | Sapphire Infocom',
    media: PORTFOLIO_MEDIA.projects.onlineGyan,
    image: PORTFOLIO_MEDIA.projects.onlineGyan.url,
    video: PORTFOLIO_MEDIA.projects.onlineGyan.videoUrl,
    github: 'https://github.com/Harmansaini11/online-gyan',
    link: 'https://github.com/Harmansaini11/online-gyan',
    tags: ['EdTech', 'Full Stack', 'WebSockets'],
  },
  {
    id: 'smart-ai-umpire',
    title: 'Smart AI Umpire',
    desc: '3D Sports Umpiring | Three.js | Socket.io',
    media: PORTFOLIO_MEDIA.projects.smartUmpire,
    image: PORTFOLIO_MEDIA.projects.smartUmpire.url,
    video: PORTFOLIO_MEDIA.projects.smartUmpire.videoUrl,
    github: 'https://github.com/Harmansaini11/smart-ai-umpire',
    link: 'https://github.com/Harmansaini11/smart-ai-umpire',
    tags: ['Three.js', 'Socket.io', 'Computer Vision'],
  },
  {
    id: 'cet-exam-portal',
    title: 'CET Exam Portal',
    desc: 'CSMU Utility | Live → cet-exam-portal.vercel.app',
    media: PORTFOLIO_MEDIA.projects.cetPortal,
    image: PORTFOLIO_MEDIA.projects.cetPortal.url,
    video: PORTFOLIO_MEDIA.projects.cetPortal.videoUrl,
    github: 'https://github.com/Harmansaini11/cet-exam-portal',
    link: 'https://cet-exam-portal.vercel.app',
    tags: ['Portal', 'Next.js', 'Tailwind'],
  },
  {
    id: 'ai-logo-maker',
    title: 'AI Logo Maker',
    desc: 'Generative AI Branding | Live → ai-logo-maker.vercel.app',
    media: PORTFOLIO_MEDIA.projects.aiLogoMaker,
    image: PORTFOLIO_MEDIA.projects.aiLogoMaker.url,
    video: PORTFOLIO_MEDIA.projects.aiLogoMaker.videoUrl,
    github: 'https://github.com/Harmansaini11/ai-logo-maker',
    link: 'https://ai-logo-maker.vercel.app',
    tags: ['Generative AI', 'Diffusion', 'Canvas'],
  },
];

export const ACHIEVEMENTS_LIST: readonly AchievementItem[] = [
  {
    id: 'hackathon-winner',
    text: '2× HACKATHON WINNER',
    media: PORTFOLIO_MEDIA.achievements.hackathonWinner,
    image: { src: PORTFOLIO_MEDIA.achievements.hackathonWinner.url, alt: '2× Hackathon Winner Trophy' },
  },
  {
    id: 'ghost-mode',
    text: 'GHOST MODE',
    media: PORTFOLIO_MEDIA.achievements.ghostMode,
    image: { src: PORTFOLIO_MEDIA.achievements.ghostMode.url, alt: 'Ghost Mode Security Challenge' },
  },
  {
    id: 'enigma-top-10',
    text: 'ENIGMA TOP 10',
    media: PORTFOLIO_MEDIA.achievements.enigmaTop10,
    image: { src: PORTFOLIO_MEDIA.achievements.enigmaTop10.url, alt: 'ENIGMA National Top 10 Finalist' },
  },
  {
    id: 'hacknova-7th',
    text: 'HACKNOVA 7TH',
    media: PORTFOLIO_MEDIA.achievements.hacknova7th,
    image: { src: PORTFOLIO_MEDIA.achievements.hacknova7th.url, alt: 'HackNova 7th Place Award' },
  },
  {
    id: 'nptel-gold',
    text: 'NPTEL ELITE GOLD',
    media: PORTFOLIO_MEDIA.achievements.nptelGold,
    image: { src: PORTFOLIO_MEDIA.achievements.nptelGold.url, alt: 'NPTEL Elite Gold Certification' },
  },
];

// OriginKit HoverImageReveal preset compatible dictionary structure
export const ACHIEVEMENTS_DATA = {
  itemCount: ACHIEVEMENTS_LIST.length,
  item1: ACHIEVEMENTS_LIST[0],
  item2: ACHIEVEMENTS_LIST[1],
  item3: ACHIEVEMENTS_LIST[2],
  item4: ACHIEVEMENTS_LIST[3],
  item5: ACHIEVEMENTS_LIST[4],
};
