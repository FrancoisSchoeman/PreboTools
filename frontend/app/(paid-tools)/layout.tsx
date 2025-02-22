import '@/app/globals.css';
import { Titillium_Web } from 'next/font/google';

import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import SessionProvider from '@/components/auth/SessionProvider';
import { ThemeProvider } from '@/components/ThemeProvider';

import ScrollToTop from '@/components/ScrollToTop';
import Header from '@/components/Header';
import SignInButton from '@/components/auth/SignInButton';
import Footer from '@/components/Footer';
import { Toaster } from '@/components/ui/toaster';

import type { Metadata } from 'next';

const titilliumWeb = Titillium_Web({
  subsets: ['latin'],
  weight: ['400'],
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.BASE_URL!),
  title: 'Prebo Digital Tools - Free tools for anyone',
  description:
    'Grow your business online with Prebo Digital, a leading performance marketing agency in South Africa.',
  openGraph: {
    title: 'Prebo Digital Tools - Free tools for anyone',
    description:
      'Grow your business online with Prebo Digital, a leading performance marketing agency in South Africa.',
    images: [
      {
        url: '/images/Our-Team-Website-Image.webp',
        alt: 'Prebo Digital | Digital Marketing Agency in South Africa',
      },
    ],
  },
  verification: {
    google: process.env.GOOGLE_SITE_VERIFICATION!,
  },
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        id="top"
        className={`${titilliumWeb.className} antialiased relative`}
      >
        <SessionProvider session={session}>
          <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
            <div className="fixed inset-0 -z-10 h-full w-full bg-white dark:bg-[--background] bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] dark:bg-[radial-gradient(#262626_1px,transparent_1px)] [background-size:16px_16px]"></div>
            {session ? (
              <>
                <Header />
                <main className="pt-10 container max-w-7xl mx-auto px-4 min-h-[85svh]">
                  {children}
                </main>
                <Footer />
                <ScrollToTop />
                <Toaster />
              </>
            ) : (
              <SignInButton />
            )}
          </ThemeProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
