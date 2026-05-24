import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from '@/contexts/AuthContext';

export const metadata: Metadata = {
  title: 'MyGiftList — Create & Share Your Gift Registry',
  description:
    'Create beautiful gift registries for weddings, birthdays, baby showers and more. Share with guests who can book gifts without signing up.',
  openGraph: {
    title: 'MyGiftList',
    description: 'Create & share beautiful gift registries.',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
