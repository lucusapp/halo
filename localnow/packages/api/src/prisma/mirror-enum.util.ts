// Los enums de @localnow/shared son un espejo 1:1 (mismos valores string) de los enums
// generados por Prisma a partir de schema.prisma (ver packages/shared/src/types/enums.ts).
// TypeScript los trata como tipos nominales distintos aunque coincidan en tiempo de
// ejecución, así que cruzar la frontera Prisma <-> @localnow/shared siempre pide un
// cast. Se documenta esa garantía en este único punto en vez de repetir `as` sueltos
// por cada campo enum de cada módulo.
export function mirrorEnum<TTarget extends string>(value: string): TTarget {
  return value as TTarget;
}
