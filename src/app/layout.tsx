import type { Metadata } from 'next';
import './globals.css';
import { ThemeProvider } from '@/components/providers/ThemeProvider';
import { Navbar } from '@/components/layout/Navbar';

export const metadata: Metadata = {
  title: 'Pack Points — Track Your Card Game Scores',
  description: 'Track pack game points and scores between friends',
  icons: { icon: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>🃏</text></svg>" },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased min-h-screen">
        <ThemeProvider>
          {/* Floating suit decorations */}
          <div aria-hidden="true">
            <span className="suit-float" style={{ top: '10%', left: '5%', animationDelay: '0s' }}>♠</span>
            <span className="suit-float" style={{ top: '30%', right: '8%', animationDelay: '5s', color: '#ef4444' }}>♥</span>
            <span className="suit-float" style={{ bottom: '20%', left: '12%', animationDelay: '10s', color: '#ef4444' }}>♦</span>
            <span className="suit-float" style={{ bottom: '10%', right: '5%', animationDelay: '15s' }}>♣</span>
          </div>

          <Navbar />
          <main className="page-wrapper max-w-7xl mx-auto px-4 sm:px-6 py-8">
            {children}
          </main>
        </ThemeProvider>
      </body>
    </html>
  );
}
