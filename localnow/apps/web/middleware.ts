import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';

// Los grupos de rutas (user) y (panel) no aparecen en la URL, así que se protege por
// path real, no por carpeta. Panel de comercio en /panel (no /dashboard ni /pos, que
// habrían colisionado con (user)/dashboard — ver PROYECTO.md §18).
const isProtectedRoute = createRouteMatcher(['/dashboard(.*)', '/tickets(.*)', '/puntos(.*)', '/panel(.*)']);

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
