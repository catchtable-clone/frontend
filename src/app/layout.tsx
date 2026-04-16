import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import QueryProvider from '@/lib/QueryProvider';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
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
    <html
      lang="ko"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex justify-center bg-gray-100">
        <div className="w-full max-w-[480px] min-h-dvh flex flex-col bg-white">
          <QueryProvider>{children}</QueryProvider>
        </div>
      </body>
    </html>
  );
}
