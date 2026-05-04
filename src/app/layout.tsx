import type { Metadata } from 'next';
import { Geist } from 'next/font/google';
import { Toaster } from 'react-hot-toast';
import './globals.css';
import QueryProvider from '@/lib/QueryProvider';
import FloatingChat from '@/components/common/FloatingChat';
import GoogleAuthProvider from '@/components/common/GoogleAuthProvider';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: '캐치테이블 클론',
  description: '레스토랑 예약/빈자리 알림 플랫폼',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className={`${geistSans.variable} h-full antialiased`}>
      <body className="min-h-full flex justify-center bg-gray-100">
        <div className="w-full max-w-[480px] min-h-dvh flex flex-col bg-white">
          <GoogleAuthProvider>
            <QueryProvider>
              {children}
              <FloatingChat />
              <Toaster position="top-center" toastOptions={{ duration: 3000 }} />
            </QueryProvider>
          </GoogleAuthProvider>
        </div>
      </body>
    </html>
  );
}
