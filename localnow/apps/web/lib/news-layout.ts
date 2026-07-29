import type { NewsArticle } from './types';

export type NewsSegment =
  | { type: 'pair'; items: [NewsArticle, NewsArticle] }
  | { type: 'single'; item: NewsArticle }
  | { type: 'wide'; item: NewsArticle };

// Reparte el resto del feed (todo menos el hero) entre tarjetas estándar, en grid
// de 2 columnas, y tarjetas "wide" a ancho completo — por regla, no por posición:
// sin imagen = wide (así lo pide el diseño: "noticias de texto sin imagen, ancho
// completo"), con imagen = va emparejada en el grid de 2 columnas. Si queda una
// suelta sin pareja (imagen, pero el siguiente artículo es wide o se acaba el
// feed), se muestra sola en el grid — hueco ocasional, normal en una maquetación
// editorial con conteos impares.
export function segmentNewsArticles(articles: NewsArticle[]): NewsSegment[] {
  const segments: NewsSegment[] = [];
  let pending: NewsArticle | null = null;

  for (const article of articles) {
    if (!article.imageUrl) {
      if (pending) {
        segments.push({ type: 'single', item: pending });
        pending = null;
      }
      segments.push({ type: 'wide', item: article });
      continue;
    }

    if (pending) {
      segments.push({ type: 'pair', items: [pending, article] });
      pending = null;
    } else {
      pending = article;
    }
  }

  if (pending) {
    segments.push({ type: 'single', item: pending });
  }

  return segments;
}
