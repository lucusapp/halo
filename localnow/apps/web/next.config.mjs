/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['@localnow/shared'],
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
