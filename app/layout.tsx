import type { Metadata, Viewport } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'PoseForge',
  description: 'Generate detailed, natural-looking lifestyle photo prompts and track which ones you have used.'
};
export const viewport: Viewport = { width: 'device-width', initialScale: 1, themeColor: '#0b0b10' };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body>{children}</body>
    </html>
  );
}
