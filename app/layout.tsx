import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'De Fluisterweek · Fluisterend Lichaam',
  description:
    'Een warme, vertraagde reis naar rust in het zenuwstelsel en een lichaam dat opnieuw durft fluisteren.'
};

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="nl">
      <body className="min-h-screen bg-gradient-to-b from-[#e6d5c0] via-[#f5e8d7] to-[#fdf8f1] font-body text-[#2f1d12] antialiased">
        {children}
      </body>
    </html>
  );
}
