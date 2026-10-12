"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { AlertCircle, Loader2, Lock, Mail } from "lucide-react";
import { loginAction, type LoginState } from "@/app/admin/login/actions";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

function TombolSubmit() {
  const { pending } = useFormStatus();
  return (
    <Button
      type="submit"
      disabled={pending}
      className="h-11 w-full bg-primary text-primary-foreground transition-colors hover:bg-primary-hover"
    >
      {pending ? (
        <>
          <Loader2 className="size-4 animate-spin" aria-hidden />
          Memeriksa...
        </>
      ) : (
        "Masuk"
      )}
    </Button>
  );
}

export function LoginForm({ redirectTo }: { redirectTo?: string }) {
  const [state, formAction] = useActionState<LoginState, FormData>(loginAction, undefined);

  return (
    <Card className="w-full max-w-sm shadow-sm">
      <CardHeader className="space-y-1.5 text-center">
        <div className="mx-auto mb-2 flex size-11 items-center justify-center rounded-xl bg-primary-soft">
          <Lock className="size-5 text-primary" aria-hidden />
        </div>
        <CardTitle className="text-xl">Masuk ke CMS</CardTitle>
        <CardDescription>
          Halaman ini khusus pengelola sekolah.
        </CardDescription>
      </CardHeader>

      <CardContent>
        <form action={formAction} className="space-y-4">
          {redirectTo ? (
            <input type="hidden" name="redirectTo" value={redirectTo} />
          ) : null}

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <div className="relative">
              <Mail
                className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
                aria-hidden
              />
              <Input
                id="email"
                name="email"
                type="email"
                autoComplete="username"
                required
                placeholder="admin@sekolah.sch.id"
                className="h-11 pl-9"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Kata sandi</Label>
            <div className="relative">
              <Lock
                className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
                aria-hidden
              />
              <Input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                className="h-11 pl-9"
              />
            </div>
          </div>

          {state?.error ? (
            <Alert variant="destructive" role="alert" aria-live="polite">
              <AlertCircle className="size-4" aria-hidden />
              <AlertDescription>{state.error}</AlertDescription>
            </Alert>
          ) : null}

          <TombolSubmit />
        </form>
      </CardContent>
    </Card>
  );
}
