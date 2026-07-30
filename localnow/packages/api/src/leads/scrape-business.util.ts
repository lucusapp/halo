import * as cheerio from 'cheerio';
import type { ScrapedBusinessResult } from './types';

const FETCH_TIMEOUT_MS = 10_000;
// Muchos sitios bloquean peticiones sin User-Agent de navegador — no es spoofing
// malicioso, es la misma cabecera que manda cualquier navegador real.
const USER_AGENT =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36';

// Coincide con un teléfono español (fijo o móvil, con o sin prefijo +34/0034).
const PHONE_PATTERN = /(?:\+34|0034)?[\s.-]?(?:\d[\s.-]?){9}/;
// Heurística de dirección: "Calle/Avenida/Rúa/Plaza/Paseo ..." hasta la siguiente
// coma o salto de línea — funciona razonablemente con webs españolas/gallegas, no
// es un parser de direcciones real.
const ADDRESS_PATTERN = /(Calle|Avenida|Avda\.?|Rúa|Plaza|Praza|Paseo)\s+[^\n,.]{3,80}/i;

// Mejor esfuerzo, nunca definitivo: prioriza metaetiquetas Open Graph (el estándar
// que la mayoría de webs de negocio ya rellenan para compartir en redes) y cae a
// heurísticas de texto solo si faltan. El admin revisa y edita todo antes de
// confirmar el alta (§9.4) — esto es un punto de partida, no un dato verificado.
export async function scrapeBusinessUrl(url: string): Promise<ScrapedBusinessResult> {
  const response = await fetch(url, {
    headers: { 'User-Agent': USER_AGENT },
    signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
  });
  if (!response.ok) {
    throw new Error(`No se pudo acceder a la URL (respuesta ${response.status})`);
  }

  const html = await response.text();
  const $ = cheerio.load(html);

  const name =
    clean($('meta[property="og:site_name"]').attr('content')) ??
    clean($('meta[property="og:title"]').attr('content')) ??
    clean($('title').first().text());

  const description =
    clean($('meta[property="og:description"]').attr('content')) ?? clean($('meta[name="description"]').attr('content'));

  const imageUrl = clean($('meta[property="og:image"]').attr('content'));

  const bodyText = $('body').text().replace(/\s+/g, ' ');
  const phoneMatch = bodyText.match(PHONE_PATTERN);
  const phone = phoneMatch ? phoneMatch[0].trim() : null;

  const addressMatch = bodyText.match(ADDRESS_PATTERN);
  const address = addressMatch ? addressMatch[0].trim() : null;

  return { name, description, phone, address, imageUrl };
}

function clean(value: string | undefined): string | null {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
}
