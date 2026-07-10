// EXPERIMENTO: el proxy de VS Code Server quita el prefijo /proxy/<puerto> ANTES de
// reenviar a Next (confirmado: /proxy/3000/login llega a Next como /login y da su
// propio 404). Por eso NO usamos basePath (exige el prefijo también en las peticiones
// entrantes, que ya no lo llevan). Probando assetPrefix en su lugar: solo cambia el
// prefijo de las URLs de assets generadas, sin exigirlo en el matching de rutas.
const assetPrefix = process.env.BASE_PATH ?? '';

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['@localnow/shared'],
  assetPrefix,
};

export default nextConfig;
