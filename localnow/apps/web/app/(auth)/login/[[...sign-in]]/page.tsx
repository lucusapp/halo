import { SignIn } from '@clerk/nextjs';
import { withBasePath } from '@/lib/base-path';

// Ruta catch-all opcional ([[...sign-in]]) en vez de un page.tsx plano: <SignIn /> navega
// internamente a subrutas propias (verificación de email, MFA, "olvidé mi contraseña...").
// Sin el catch-all esos pasos devuelven 404 en cuanto el flujo tiene más de un paso.
export default function LoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center p-8">
      <SignIn signUpUrl={withBasePath('/register')} fallbackRedirectUrl={withBasePath('/dashboard')} />
    </main>
  );
}
