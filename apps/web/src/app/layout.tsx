import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'ArtXFlow',
  description: 'Open-source content distribution platform for developers',
  icons: {
    icon: '/logo.png',
    shortcut: '/logo.png',
    apple: '/logo.png',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
