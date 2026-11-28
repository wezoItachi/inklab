import type { Metadata, Viewport } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  applicationName: 'INKLAB',
  title: 'INKLAB · Splatoon 3 配装实验室',
  description:
    '面向 Splatoon 3 玩家的非官方配装研究工具：比较装备能力收益、关键 AP 档位与武器参数。',
  icons: { icon: '/favicon.svg' },
  openGraph: {
    type: 'website',
    locale: 'zh_CN',
    siteName: 'INKLAB',
    title: 'INKLAB · Splatoon 3 配装实验室',
    description:
      '比较 Splatoon 3 装备能力收益、关键 AP 档位与来源可追溯的武器参数。',
  },
  twitter: {
    card: 'summary',
    title: 'INKLAB · Splatoon 3 配装实验室',
    description:
      '比较 Splatoon 3 装备能力收益、关键 AP 档位与来源可追溯的武器参数。',
  },
};

export const viewport: Viewport = {
  colorScheme: 'light',
  themeColor: '#6842ff',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
