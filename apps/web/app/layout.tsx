import './globals.css';
import type { ReactNode } from 'react';

export const metadata = {
  title: 'PL 2024/25 3D Season Lab',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <main className="app-root">{children}</main>
      </body>
    </html>
  );
}
