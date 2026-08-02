import { SignUp } from '@clerk/nextjs';

// Ver el comentario en app/(auth)/login/[[...sign-in]]/page.tsx sobre el catch-all
// (verificación de email, etc. son subrutas de /register).
export default function RegisterPage() {
  return (
    <main className="flex min-h-screen items-center justify-center p-8">
      <SignUp signInUrl="/login" forceRedirectUrl="/dashboard" />
    </main>
  );
}
