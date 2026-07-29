import type { ReactNode } from 'react';
import { apiFetch } from '@/lib/api';
import type { PublicCity } from '@/lib/types';
import { Header } from '@/components/ui/header';

export default async function PublicLayout({ children }: { children: ReactNode }) {
  // Piloto de una sola ciudad (PROYECTO.md §15.2): sin selector todavía, se muestra
  // la primera ciudad activa. GET /cities es público y barato de cachear.
  const cities = await apiFetch<PublicCity[]>('/cities').catch(() => []);
  const cityName = cities[0]?.name ?? null;

  return (
    <div className="min-h-screen bg-gray-50">
      <Header cityName={cityName} />
      <div className="mx-auto max-w-5xl px-4 py-6">{children}</div>
    </div>
  );
}
