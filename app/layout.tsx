import { DM_Sans } from "next/font/google";
import type { Metadata } from 'next'
import './globals.css'
import { cn } from '../lib/utils'
import { ThemeProvider } from "@/components/ui/theme-provider";
import { Toaster } from "sonner";
import '@/app/fonts.css'
import { ElementsProvider } from "@/hooks/elementsProvider";
import RemotionRootWrapper from "../remotion/Root";
import { DurationProvider } from "@/hooks/durationProvider";

const dmSans = DM_Sans({ subsets: ["latin"] });

export const metadata: Metadata = {
  metadataBase: new URL("https://insta-try-on-ai.vercel.app/"),
  title: {
    default: 'instaAutoShorts',
    template: `%s | instaAutoShorts`
  },
  description: 'Discover, Shop & Try on clothes virtually from all angles, whether on a model or on yourself, from the comfort of your home.',
  openGraph: {
    description: 'Discover, Shop & Try on clothes virtually from all angles, whether on a model or on yourself, from the comfort of your home.',
    images: ['https://utfs.io/f/8a428f85-ae83-4ca7-9237-6f8b65411293-eun6ii.png'],
    url: 'https://insta-try-on-ai.vercel.app/'
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Instant Try On',
    description: 'Discover, Shop & Try on clothes virtually from all angles, whether on a model or on yourself, from the comfort of your home.',
    siteId: "",
    creator: "",
    creatorId: "",
    images: ['https://utfs.io/f/8a428f85-ae83-4ca7-9237-6f8b65411293-eun6ii.png'],
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
      </head>
      <body className={cn(dmSans.className, 'antialiased overflow-x-hidden min-h-screen border-none outline-none', 'scrollbar scrollbar-thumb scrollbar-thumb-white scrollbar-track-slate-700')} suppressHydrationWarning={true}>
        <ElementsProvider>
          <DurationProvider>
            <ThemeProvider
              attribute="class"
              defaultTheme="system"
              enableSystem
              disableTransitionOnChange
            >
              {children}
              <Toaster />
            </ThemeProvider>
            <RemotionRootWrapper />
          </DurationProvider>
        </ElementsProvider>
      </body>
    </html>
  );
}
