import { NewsCategory as PrismaNewsCategory } from '@prisma/client';

// Heurística por palabras clave (castellano + galego, los feeds mezclan ambos):
// cuenta apariciones por categoría en título+resumen y se queda con la que más
// coincidencias tiene. Es aproximada a propósito — sin dependencias nuevas
// (nada de LLM ni servicio externo) a cambio de alguna clasificación imperfecta.
const KEYWORDS: Record<PrismaNewsCategory, string[]> = {
  MUNICIPIO: [
    'ayuntamiento',
    'concello',
    'alcalde',
    'alcaldesa',
    'concejal',
    'concelleiro',
    'concelleira',
    'pleno municipal',
    'municipio',
    'urbanismo',
    'obras públicas',
    'obras publicas',
  ],
  DEPORTES: [
    'fútbol',
    'futbol',
    'liga',
    'deporte',
    'deportivo',
    'baloncesto',
    'gol',
    'jugador',
    'partido',
    'champions',
    'mundial',
    'selección',
    'seleccion',
    'equipo',
  ],
  ECONOMIA: [
    'economía',
    'economia',
    'empresa',
    'empleo',
    'paro',
    'mercado',
    'inversión',
    'inversion',
    'pyme',
    'impuesto',
    'hacienda',
    'banco',
    'bolsa',
    'inflación',
    'inflacion',
  ],
  JUDICIAL: [
    'juicio',
    'tribunal',
    'audiencia provincial',
    'fiscalía',
    'fiscalia',
    'sentencia',
    'condena',
    'detenido',
    'detenida',
    'juez',
    'jueza',
    'delito',
    'arresto',
    'investigación policial',
  ],
  CULTURA: [
    'cultura',
    'teatro',
    'música',
    'musica',
    'festival',
    'exposición',
    'exposicion',
    'cine',
    'libro',
    'literatura',
    'arte',
    'concierto',
    'museo',
  ],
  DIPUTACION: ['diputación', 'diputacion', 'deputación', 'deputacion', 'provincial'],
  SOCIEDAD: [
    'sociedad',
    'vecinos',
    'vecinal',
    'solidaridad',
    'ong',
    'voluntariado',
    'sanidad',
    'salud',
    'educación',
    'educacion',
    'colegio',
    'hospital',
  ],
};

// Bolsa genérica: cuando ninguna palabra clave coincide y la fuente tampoco tiene
// una categoría de resguardo configurada, es preferible una categoría plausible a
// que NewsArticle.category (obligatorio) reviente la inserción.
const DEFAULT_CATEGORY: PrismaNewsCategory = 'SOCIEDAD';

// \b en límites de palabra: sin esto, un .includes() plano hace que "parte" cuente
// como acierto de la keyword "arte" (CULTURA), "paro" case dentro de "reparo"
// (ECONOMIA), etc. — falsos positivos por coincidencia de substring, no de palabra.
const KEYWORD_PATTERNS: Record<PrismaNewsCategory, RegExp[]> = Object.fromEntries(
  (Object.entries(KEYWORDS) as [PrismaNewsCategory, string[]][]).map(([category, keywords]) => [
    category,
    keywords.map((keyword) => new RegExp(`\\b${keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i')),
  ]),
) as Record<PrismaNewsCategory, RegExp[]>;

export function categorizeArticle(text: string, fallback?: PrismaNewsCategory | null): PrismaNewsCategory {
  let bestCategory: PrismaNewsCategory | null = null;
  let bestScore = 0;

  for (const [category, patterns] of Object.entries(KEYWORD_PATTERNS) as [PrismaNewsCategory, RegExp[]][]) {
    const score = patterns.reduce((count, pattern) => (pattern.test(text) ? count + 1 : count), 0);
    if (score > bestScore) {
      bestScore = score;
      bestCategory = category;
    }
  }

  return bestCategory ?? fallback ?? DEFAULT_CATEGORY;
}
