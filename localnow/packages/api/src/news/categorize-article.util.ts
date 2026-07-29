import { NewsCategory as PrismaNewsCategory } from '@prisma/client';

// Heurística por palabras clave (castellano + galego, los feeds mezclan ambos):
// cuenta apariciones por categoría en título+resumen y se queda con la que más
// coincidencias tiene. Es aproximada a propósito — sin dependencias nuevas
// (nada de LLM ni servicio externo) a cambio de alguna clasificación imperfecta.
// 15 categorías (PROYECTO.md §19.1) — MUNICIPIO absorbe también lo que antes era
// DIPUTACION (organismos oficiales/provinciales), esa categoría ya no existe sola.
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
    'diputación',
    'diputacion',
    'deputación',
    'deputacion',
    'provincial',
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
    'gimnasio',
    'entrenamiento',
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
    'gestoría',
    'gestoria',
    'coworking',
  ],
  GASTRONOMIA: [
    'restaurante',
    'bar',
    'cafetería',
    'cafeteria',
    'menú',
    'menu',
    'cocina',
    'chef',
    'gastronomía',
    'gastronomia',
    'tapas',
    'receta',
  ],
  HOGAR_DECORACION: [
    'mueble',
    'muebles',
    'decoración',
    'decoracion',
    'ferretería',
    'ferreteria',
    'electricista',
    'fontanero',
    'pintor',
    'interiorismo',
    'reforma del hogar',
  ],
  SALUD_BIENESTAR: [
    'salud',
    'clínica',
    'clinica',
    'farmacia',
    'óptica',
    'optica',
    'psicólogo',
    'psicologo',
    'estética',
    'estetica',
    'nutricionista',
    'bienestar',
    'sanidad',
    'hospital',
  ],
  CULTURA_OCIO: [
    'cultura',
    'teatro',
    'música',
    'musica',
    'festival',
    'exposición',
    'exposicion',
    'cine',
    'concierto',
    'museo',
    'ocio',
    'librería',
    'libreria',
  ],
  EDUCACION: [
    'educación',
    'educacion',
    'colegio',
    'academia',
    'formación',
    'formacion',
    'universidad',
    'instituto',
    'papelería',
    'papeleria',
  ],
  TECNOLOGIA: [
    'tecnología',
    'tecnologia',
    'informática',
    'informatica',
    'móvil',
    'movil',
    'software',
    'digital',
    'ordenador',
  ],
  MODA_BELLEZA: ['moda', 'ropa', 'peluquería', 'peluqueria', 'belleza', 'complementos', 'boutique'],
  MOTOR: [
    'coche',
    'taller',
    'concesionario',
    'gasolinera',
    'recambios',
    'automóvil',
    'automovil',
    'vehículo',
    'vehiculo',
    'neumático',
    'neumatico',
  ],
  MASCOTAS: ['mascota', 'mascotas', 'veterinario', 'veterinaria', 'perro', 'gato'],
  INMOBILIARIA: ['inmobiliaria', 'piso', 'vivienda', 'alquiler', 'arquitecto', 'hipoteca'],
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
  SOCIEDAD: ['sociedad', 'vecinos', 'vecinal', 'solidaridad', 'ong', 'voluntariado', 'asociación', 'asociacion'],
};

// Bolsa genérica: cuando ninguna palabra clave coincide y la fuente tampoco tiene
// una categoría de resguardo configurada, es preferible una categoría plausible a
// que NewsArticle.category (obligatorio) reviente la inserción.
const DEFAULT_CATEGORY: PrismaNewsCategory = 'SOCIEDAD';

// \b en límites de palabra: sin esto, un .includes() plano hace que "parte" cuente
// como acierto de la keyword "arte" (CULTURA_OCIO), "paro" case dentro de "reparo"
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
