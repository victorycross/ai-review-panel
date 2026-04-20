import { LoginForm } from "@/components/auth/login-form";

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-bg flex items-center justify-center p-4">
      <div className="w-full max-w-sm space-y-8">
        <div className="text-center space-y-1">
          <p className="text-xs font-medium tracking-widest text-muted uppercase">
            BrightPath Technologies
          </p>
          <h1 className="text-2xl font-semibold text-neutral-100 tracking-tight">
            techassist
          </h1>
          <p className="text-sm text-muted">AI System Review Panel</p>
        </div>
        <LoginForm />
        <p className="text-center text-xs text-muted">
          Access is by invitation only. Contact your administrator.
        </p>
      </div>
    </div>
  );
}
