import Image from 'next/image';

// next/image exige listar cada dominio en next.config.mjs#images.remotePatterns de
// antemano — las fuentes RSS traen imágenes de dominios arbitrarios que no se
// pueden conocer todos con antelación. Se optimizan los dominios ya verificados en
// uso (el resto cae a <img> normal). El padre debe ser `relative` con altura fija:
// ambas ramas rellenan ese contenedor con position:absolute + object-cover.
const OPTIMIZABLE_HOSTS = new Set(['estaticos-cdn.prensaiberica.es', 'images.unsplash.com']);

function isOptimizable(url: string): boolean {
  try {
    return OPTIMIZABLE_HOSTS.has(new URL(url).hostname);
  } catch {
    return false;
  }
}

export function NewsImage({ src, alt = '' }: { src: string; alt?: string }) {
  if (isOptimizable(src)) {
    return <Image src={src} alt={alt} fill sizes="(min-width: 1024px) 50vw, 100vw" className="object-cover" />;
  }
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={src} alt={alt} className="absolute inset-0 h-full w-full object-cover" />;
}
