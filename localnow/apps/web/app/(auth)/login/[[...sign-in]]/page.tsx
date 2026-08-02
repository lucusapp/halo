import { SignIn } from '@clerk/nextjs';
import { withBasePath } from '@/lib/base-path';

// Ruta catch-all opcional ([[...sign-in]]) en vez de un page.tsx plano: <SignIn /> navega
// internamente a subrutas propias (verificación de email, MFA, "olvidé mi contraseña...").
// Sin el catch-all esos pasos devuelven 404 en cuanto el flujo tiene más de un paso.
//
// forceRedirectUrl (no fallbackRedirectUrl) para el destino tras iniciar sesión:
// fallbackRedirectUrl solo se usa cuando Clerk no tiene NINGÚN otro criterio para
// decidir a dónde ir (ni env vars, ni search params) — el flujo de OAuth (Google)
// sí trae uno propio calculado internamente a partir de la URL de la petición
// entrante, que llega al proxy sin el prefijo /proxy/<puerto> y por eso 404. Con
// forceRedirectUrl (máxima prioridad, por delante de cualquier otro criterio) se
// fuerza el destino correcto sin importar qué calculó Clerk por su cuenta.
export default function LoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center p-8">
      <SignIn signUpUrl={withBasePath('/register')} forceRedirectUrl={withBasePath('/dashboard')} />
    </main>
  );
}
