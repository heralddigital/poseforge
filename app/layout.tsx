import type { Metadata, Viewport } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'PoseForge',
  description: 'Generate detailed, natural-looking lifestyle photo prompts and track which ones you have used.'
};
export const viewport: Viewport = { width: 'device-width', initialScale: 1, themeColor: '#010916' };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: "try{if(localStorage.getItem('poseforge:theme')==='light')document.documentElement.dataset.theme='light'}catch(e){}" }} />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Geist:wght@300;400;500&family=IBM+Plex+Mono:wght@400;500&family=Newsreader:opsz,wght@6..72,400&display=swap"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
