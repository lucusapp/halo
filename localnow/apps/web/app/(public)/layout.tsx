import type { ReactNode } from 'react';
import { Header } from '@/components/ui/header';

export default function PublicLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="mx-auto max-w-5xl px-4 py-6">{children}</div>
    </div>
  );
}
