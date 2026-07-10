// El proxy de puertos de VS Code Server quita el prefijo /proxy/<puerto> ANTES de
// reenviar a Next (confirmado empíricamente: pedirle a Next /proxy/3000/login con
// basePath configurado devuelve 404, porque a Next le llega /login sin prefijo).
// Por eso NO usamos `basePath` de Next.js — exige el prefijo también en las peticiones
// entrantes, y ya no lo llevan. En su lugar:
//   - next.config.mjs usa `assetPrefix` para que los assets estáticos se generen y
//     sirvan con el prefijo (assetPrefix no lo exige en el matching de páginas).
//   - los enlaces/redirects internos de la app se prefijan a mano con este helper,
//     porque `assetPrefix` no toca next/link ni next/navigation.
// Sin BASE_PATH definida (desarrollo local normal, sin proxy), es un no-op.
const BASE_PATH = process.env.BASE_PATH ?? '';

export function withBasePath(path: string): string {
  return `${BASE_PATH}${path}`;
}
