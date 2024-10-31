import './globals.css';
import { Providers } from './providers';

export const metadata = {
  title: 'FieldHive',
  description: 'Field Service Management',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
