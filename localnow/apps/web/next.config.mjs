// El proxy de puertos de VS Code Server quita el prefijo /proxy/<puerto> ANTES de
// reenviar a Next (confirmado empíricamente en esta sesión, dos veces). No usamos
// `basePath` porque exige ese prefijo también en las peticiones entrantes, que ya no
// lo llevan cuando llegan aquí. `assetPrefix` en cambio solo cambia el prefijo de las
// URLs de assets generadas, sin exigirlo en el matching de páginas — verificado que
// Next también SIRVE los assets en esa ruta prefijada, no solo los genera ahí.
// Los enlaces/redirects internos de la app (que assetPrefix no toca) se prefijan a
// mano con lib/base-path.ts#withBasePath. Sin BASE_PATH definida, todo es un no-op.
const assetPrefix = process.env.BASE_PATH ?? '';

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['@localnow/shared'],
  assetPrefix,
  images: {
    // next/image exige listar cada dominio de antemano — las fuentes RSS traen
    // imágenes de dominios arbitrarios que no se pueden conocer todos con
    // antelación. Solo se listan aquí los dominios ya verificados en uso
    // (components/news/news-image.tsx cae a <img> normal para el resto).
    remotePatterns: [
      { protocol: 'https', hostname: 'estaticos-cdn.prensaiberica.es' },
      { protocol: 'https', hostname: 'images.unsplash.com' },
    ],
  },
};

export default nextConfig;
