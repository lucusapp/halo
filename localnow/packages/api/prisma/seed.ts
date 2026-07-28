import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Datos de ejemplo para tener algo real que ver en apps/web sin depender de fuentes
// RSS externas ni de comercios dados de alta a mano. Todo con id fijo + upsert, así
// que `npx prisma db seed` es idempotente (se puede volver a ejecutar sin duplicar).
async function main() {
  const city = await prisma.city.upsert({
    where: { slug: 'lugo' },
    update: {},
    create: { id: 'seed-city-lugo', name: 'Lugo', slug: 'lugo', pointsRatioGlobal: 2 },
  });

  const source = await prisma.newsSource.upsert({
    where: { id: 'seed-source-lugo' },
    update: {},
    create: {
      id: 'seed-source-lugo',
      cityId: city.id,
      name: 'Diario de Lugo',
      url: 'https://example.com/diario-de-lugo',
      active: true,
    },
  });

  // Fuentes RSS reales (medios gallegos) para poblar la BD con noticias de verdad
  // vía NewsService.fetchAndStore(). Cada fuente solo admite una categoría
  // (NewsArticle.category es obligatorio y se hereda de la fuente, no del feed
  // en sí, que mezcla secciones) — se reparten para poder probar el filtro.
  const realSources = [
    {
      id: 'seed-source-farodevigo',
      name: 'Faro de Vigo',
      url: 'https://www.farodevigo.es',
      feedUrl: 'https://www.farodevigo.es/rss/2.0/?section=portada',
      category: 'MUNICIPIO' as const,
    },
    {
      id: 'seed-source-lavozdegalicia',
      name: 'La Voz de Galicia',
      url: 'https://www.lavozdegalicia.es',
      feedUrl: 'https://www.lavozdegalicia.es/rss/index.xml',
      category: 'SOCIEDAD' as const,
    },
    {
      id: 'seed-source-elcorreogallego',
      name: 'El Correo Gallego',
      url: 'https://www.elcorreogallego.es',
      feedUrl: 'https://www.elcorreogallego.es/rss',
      category: 'CULTURA' as const,
    },
  ];

  for (const realSource of realSources) {
    await prisma.newsSource.upsert({
      where: { id: realSource.id },
      update: {},
      create: { ...realSource, cityId: city.id, active: true },
    });
  }

  const commerces = [
    {
      id: 'seed-commerce-taberna',
      authId: 'seed-auth-taberna',
      name: 'Taberna A Muralla',
      slug: 'taberna-a-muralla',
      category: 'RESTAURACION' as const,
      cif: 'B00000001',
      address: 'Rúa Nova 12, Lugo',
      email: 'contacto@tabernaamuralla.example',
      phone: '982 000 001',
      description: 'Cocina tradicional gallega junto a la muralla romana.',
    },
    {
      id: 'seed-commerce-libreria',
      authId: 'seed-auth-libreria',
      name: 'Librería Follas Novas',
      slug: 'libreria-follas-novas',
      category: 'COMERCIO' as const,
      cif: 'B00000002',
      address: 'Praza Maior 5, Lugo',
      email: 'contacto@follasnovas.example',
      phone: '982 000 002',
      description: 'Libros, papelería y prensa local desde 1985.',
    },
    {
      id: 'seed-commerce-peluqueria',
      authId: 'seed-auth-peluqueria',
      name: 'Peluquería Estilo Norte',
      slug: 'peluqueria-estilo-norte',
      category: 'SERVICIOS' as const,
      cif: 'B00000003',
      address: 'Ronda da Muralla 20, Lugo',
      email: 'contacto@estilonorte.example',
      phone: '982 000 003',
      description: 'Peluquería y estética unisex, cita previa online.',
    },
    {
      id: 'seed-commerce-cine',
      authId: 'seed-auth-cine',
      name: 'Cines Yelmo Lugo',
      slug: 'cines-yelmo-lugo',
      category: 'OCIO' as const,
      cif: 'B00000004',
      address: 'Avenida Coruña 500, Lugo',
      email: 'contacto@yelmolugo.example',
      phone: '982 000 004',
      description: 'Estrenos de cine en versión original y doblada.',
    },
  ];

  for (const commerce of commerces) {
    await prisma.commerce.upsert({
      where: { id: commerce.id },
      update: {},
      create: { ...commerce, cityId: city.id, active: true, verified: true },
    });
  }

  const now = new Date();
  const inOneMonth = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

  const coupons = [
    {
      id: 'seed-coupon-taberna-10',
      commerceId: 'seed-commerce-taberna',
      title: '10% en el menú del día',
      description: 'Válido de lunes a viernes, no combinable con otras ofertas.',
      type: 'PERCENTAGE' as const,
      value: 10,
      maxRedemptions: 100,
    },
    {
      id: 'seed-coupon-libreria-5',
      commerceId: 'seed-commerce-libreria',
      title: '5€ de descuento en libros',
      description: 'En compras superiores a 30€.',
      type: 'FIXED' as const,
      value: 5,
      maxRedemptions: 50,
    },
    {
      id: 'seed-coupon-cine-2x1',
      commerceId: 'seed-commerce-cine',
      title: '2x1 en entradas los miércoles',
      description: null,
      type: 'TWO_FOR_ONE' as const,
      value: 0,
      maxRedemptions: 200,
    },
  ];

  for (const coupon of coupons) {
    await prisma.coupon.upsert({
      where: { id: coupon.id },
      update: {},
      create: { ...coupon, startDate: now, endDate: inOneMonth, status: 'ACTIVE' },
    });
  }

  const articles = [
    {
      id: 'seed-article-1',
      title: 'El Concello de Lugo aprueba el nuevo plan de movilidad urbana',
      summary:
        'El plan incluye nuevos carriles bici y la peatonalización progresiva del centro histórico.',
      url: 'https://example.com/diario-de-lugo/movilidad-urbana',
      imageUrl: 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=800',
      category: 'MUNICIPIO' as const,
      featured: true,
      hoursAgo: 2,
    },
    {
      id: 'seed-article-2',
      title: 'El CB Breogán suma su tercera victoria consecutiva en la ACB',
      summary: 'El equipo lucense se afianza en la zona media de la clasificación.',
      url: 'https://example.com/diario-de-lugo/breogan-victoria',
      imageUrl: 'https://images.unsplash.com/photo-1546519638-68e109498ffc?w=800',
      category: 'DEPORTES' as const,
      featured: false,
      hoursAgo: 5,
    },
    {
      id: 'seed-article-3',
      title: 'El comercio local lucense cierra el año con un crecimiento del 4%',
      summary: 'La patronal destaca la recuperación del centro tras la pandemia.',
      url: 'https://example.com/diario-de-lugo/comercio-crecimiento',
      imageUrl: null,
      category: 'ECONOMIA' as const,
      featured: false,
      hoursAgo: 9,
    },
    {
      id: 'seed-article-4',
      title: 'Comienza el juicio por el caso de corrupción urbanística en la provincia',
      summary: 'La Audiencia Provincial prevé varias sesiones a lo largo del mes.',
      url: 'https://example.com/diario-de-lugo/juicio-urbanistico',
      imageUrl: null,
      category: 'JUDICIAL' as const,
      featured: false,
      hoursAgo: 12,
    },
    {
      id: 'seed-article-5',
      title: 'Vuelve el Arde Lucus con más de 300 actividades culturales',
      summary: 'La fiesta de recreación histórica se celebrará el próximo fin de semana.',
      url: 'https://example.com/diario-de-lugo/arde-lucus',
      imageUrl: 'https://images.unsplash.com/photo-1533106418989-88406c7cc8ca?w=800',
      category: 'CULTURA' as const,
      featured: false,
      hoursAgo: 20,
    },
    {
      id: 'seed-article-6',
      title: 'La Diputación de Lugo destina 2 millones a la mejora de carreteras rurales',
      summary: 'Las obras beneficiarán a una veintena de ayuntamientos de la provincia.',
      url: 'https://example.com/diario-de-lugo/diputacion-carreteras',
      imageUrl: null,
      category: 'DIPUTACION' as const,
      featured: false,
      hoursAgo: 30,
    },
    {
      id: 'seed-article-7',
      title: 'Voluntariado vecinal recupera el entorno del río Miño a su paso por la ciudad',
      summary: 'Más de 150 personas participaron en la jornada de limpieza.',
      url: 'https://example.com/diario-de-lugo/voluntariado-rio-mino',
      imageUrl: 'https://images.unsplash.com/photo-1508873535684-277a3cbcc4e8?w=800',
      category: 'SOCIEDAD' as const,
      featured: false,
      hoursAgo: 40,
    },
  ];

  for (const article of articles) {
    const { hoursAgo, ...data } = article;
    await prisma.newsArticle.upsert({
      where: { id: data.id },
      update: {},
      create: {
        ...data,
        sourceId: source.id,
        cityId: city.id,
        publishedAt: new Date(now.getTime() - hoursAgo * 60 * 60 * 1000),
      },
    });
  }

  console.log('Seed completado: 1 ciudad, 4 comercios, 3 cupones, 7 noticias.');
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
