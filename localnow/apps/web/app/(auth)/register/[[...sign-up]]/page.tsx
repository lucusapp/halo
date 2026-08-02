import { SignUp } from '@clerk/nextjs';
import { withBasePath } from '@/lib/base-path';

// Ver los comentarios en app/(auth)/login/[[...sign-in]]/page.tsx: mismo motivo
// para el catch-all (verificación de email, etc. son subrutas de /register) y para
// forceRedirectUrl en vez de fallbackRedirectUrl (el registro con Google pasa por
// el mismo problema de prefijo que el login con Google).
export default function RegisterPage() {
  return (
    <main className="flex min-h-screen items-center justify-center p-8">
      <SignUp signInUrl={withBasePath('/login')} forceRedirectUrl={withBasePath('/dashboard')} />
    </main>
  );
}
