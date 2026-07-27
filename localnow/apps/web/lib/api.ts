const API_URL = process.env.API_URL ?? 'http://localhost:3001';

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    message: string,
  ) {
    super(message);
  }
}

// Fetch server-side (Server Components) contra packages/api — no pasa por el
// navegador, así que el proxy de puertos de VS Code Server y CORS no aplican aquí.
// Contenido público (noticias, directorio) cambia con poca frecuencia: revalidar
// cada minuto evita golpear la API en cada request sin servir algo demasiado viejo.
export async function apiFetch<T>(path: string): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, { next: { revalidate: 60 } });
  if (!response.ok) {
    const body = await response.text().catch(() => '');
    throw new ApiError(response.status, body || response.statusText);
  }
  return response.json() as Promise<T>;
}
