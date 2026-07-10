import { SignUp } from '@clerk/nextjs';
import { withBasePath } from '@/lib/base-path';

// Ver el comentario en app/(auth)/login/[[...sign-in]]/page.tsx: mismo motivo para el
// catch-all opcional aquí (verificación de email, etc. son subrutas de /register).
export default function RegisterPage() {
  return (
    <main className="flex min-h-screen items-center justify-center p-8">
      <SignUp signInUrl={withBasePath('/login')} fallbackRedirectUrl={withBasePath('/dashboard')} />
    </main>
  );
}
