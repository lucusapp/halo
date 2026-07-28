export const API_URL = process.env.API_URL ?? 'http://localhost:3001';

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    message: string,
  ) {
    super(message);
  }
}

// NestJS devuelve errores como { message, error, statusCode } — cuando el cuerpo es
// JSON válido usamos ese `message` (así podemos distinguir p.ej. "Usuario no
// encontrado" de otros 404), si no cae al texto crudo.
export async function parseErrorMessage(response: Response): Promise<string> {
  const text = await response.text().catch(() => '');
  try {
    const body: unknown = JSON.parse(text);
    if (body && typeof body === 'object' && 'message' in body && typeof body.message === 'string') {
      return body.message;
    }
  } catch {
    // cuerpo no era JSON — se usa el texto crudo tal cual
  }
  return text || response.statusText;
}

// Fetch server-side (Server Components) contra packages/api — no pasa por el
// navegador, así que el proxy de puertos de VS Code Server y CORS no aplican aquí.
// Contenido público (noticias, directorio) cambia con poca frecuencia: revalidar
// cada minuto evita golpear la API en cada request sin servir algo demasiado viejo.
export async function apiFetch<T>(path: string): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, { next: { revalidate: 60 } });
  if (!response.ok) {
    throw new ApiError(response.status, await parseErrorMessage(response));
  }
  return response.json() as Promise<T>;
}
