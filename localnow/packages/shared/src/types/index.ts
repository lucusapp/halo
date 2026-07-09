// Tipos espejo de los modelos definidos en packages/api/prisma/schema.prisma.
//
// Nota sobre dinero: en BD los importes son `Decimal` (10,2) para evitar errores
// de redondeo. Aquí se representan como `number` porque estos tipos cruzan la
// frontera HTTP hacia apps/web y apps/mobile, donde Decimal no existe — el
// backend es responsable de redondear/formatear al serializar. No usar estos
// tipos para cálculos aritméticos encadenados sin cuidado de precisión.
//
// Nota sobre relaciones: estos tipos solo incluyen los campos escalares y las
// claves foráneas (ej. `commerceId`), igual que el modelo conceptual de
// PROYECTO.md §11. No incluyen objetos de relación anidados (ej. `commerce: Commerce`)
// para evitar ambigüedad sobre cuándo vienen poblados — cuando un endpoint
// necesite datos anidados, se define un tipo `*WithRelations` específico junto
// al endpoint que lo produce.

export * from './enums';
export * from './city';
export * from './user';
export * from './commerce';
export * from './product';
export * from './transaction';
export * from './coupon';
export * from './reward';
export * from './segment';
export * from './campaign';
export * from './news';
export * from './admin';
