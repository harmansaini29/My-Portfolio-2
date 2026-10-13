import type { Metadata } from 'next';
import { Plus_Jakarta_Sans, Geist } from 'next/font/google';
import './globals.css';
import { cn } from "@/lib/utils";
import SmoothScroll from '@/components/SmoothScroll';

const geist = Geist({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
  adjustFontFallback: true,
  fallback: ['system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
});

const jakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-jakarta',
  weight: ['300', '400', '500', '600', '700', '800'],
  display: 'swap',
  adjustFontFallback: true,
  fallback: ['system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
});

export const metadata: Metadata = {
  title: 'Harman Saini — Systems Engineer & Spatial 3D WebGL Architect',
  description:
    'Full-stack engineer building low-latency Java engines, algorithmic trading systems, and 120 FPS WebGL spatial experiences.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={cn("dark", "bg-black", "text-white", "antialiased", jakarta.variable, "font-sans", geist.variable)}
    >
      <head>
        <link rel="preload" as="image" href="/images/portrait.png" fetchPriority="high" />
      </head>
      <body className="min-h-screen bg-black overflow-x-hidden" suppressHydrationWarning>
        <SmoothScroll>
          {children}
        </SmoothScroll>
      </body>
    </html>
  );
}
