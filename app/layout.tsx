import type { Metadata } from 'next';
import './globals.css';
import { ThemeProvider } from '@/components/ThemeProvider';

export const metadata: Metadata = {
  title: 'Tech Events Curitiba',
  description: 'Busca, curadoria e envio de eventos, palestras e hackathons de tecnologia na região de Curitiba',
  openGraph: {
    title: 'Tech Events Curitiba',
    description: 'Busca, curadoria e envio de eventos, palestras e hackathons de tecnologia na região de Curitiba',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className="dark" suppressHydrationWarning>
      <body className="antialiased">
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
