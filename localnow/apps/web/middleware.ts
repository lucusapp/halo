import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';

// Los grupos de rutas (user) y (panel) no aparecen en la URL, así que se protege por
// path real, no por carpeta. OJO: si en el futuro se crea apps/web/app/(panel)/dashboard
// colisiona con apps/web/app/(user)/dashboard (ambos resuelven a /dashboard) — hay que
// renombrar uno de los dos antes de construir el panel de comercio.
const isProtectedRoute = createRouteMatcher(['/dashboard(.*)', '/tickets(.*)', '/points(.*)', '/pos(.*)']);

export default clerkMiddleware(async (auth, req) => {
  if (isProtectedRoute(req)) {
    await auth.protect();
  }
});

export const config = {
  matcher: [
    // Salta los internos de Next.js y los archivos estáticos, salvo que se busquen explícitamente por query param.
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
};
