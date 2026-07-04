import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { signIn } from '../lib/auth-client';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2, Mail, Lock, ArrowRight, Cloud } from 'lucide-react';

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required')
});

type LoginForm = z.infer<typeof loginSchema>;

export default function Login() {
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema)
  });

  const onSubmit = async (data: LoginForm) => {
    setError('');

    try {
      await signIn.email({
        email: data.email,
        password: data.password,
        fetchOptions: {
          onSuccess: () => navigate('/'),
          onError: (ctx) => setError(ctx.error.message || 'Failed to login'),
        }
      });
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred');
    }
  };

  return (
    <div className="relative flex min-h-[calc(100vh-80px)] items-center justify-center overflow-hidden bg-slate-50">
      {/* Static Background Gradients for better performance */}
      <div className="absolute top-[-10%] left-[-5%] h-[600px] w-[600px] rounded-full bg-sky-200/50 blur-3xl transform-gpu" />
      <div className="absolute bottom-[-10%] right-[-5%] h-[700px] w-[700px] rounded-full bg-blue-200/40 blur-3xl transform-gpu" />

      <Card className="relative z-10 w-full max-w-[440px] overflow-hidden rounded-3xl border border-white/60 bg-white/40 p-2 shadow-[0_8px_40px_-12px_rgba(14,165,233,0.15)] backdrop-blur-2xl transition-all duration-500 hover:shadow-[0_8px_40px_-12px_rgba(14,165,233,0.25)]">
        <div className="rounded-2xl border border-white/50 bg-gradient-to-b from-white/80 to-white/40 p-8 shadow-sm">
          <CardHeader className="space-y-3 pb-8 pt-0 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-tr from-sky-400 to-blue-500 shadow-lg shadow-sky-500/30">
              <Cloud className="h-7 w-7 text-white" />
            </div>
            <CardTitle className="bg-gradient-to-br from-slate-700 to-slate-900 bg-clip-text text-3xl font-bold tracking-tight text-transparent">
              Welcome Back
            </CardTitle>
            <CardDescription className="text-sm font-medium text-slate-500">
              Enter your credentials to access the portal
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            {error && (
              <div className="mb-6 flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-600 shadow-sm animate-in slide-in-from-top-2">
                <div className="h-2 w-2 rounded-full bg-red-500 animate-pulse" />
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-xs font-bold uppercase tracking-wider text-slate-600 block text-left">
                  Email Address
                </Label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-slate-400 group-focus-within:text-sky-500 transition-colors" />
                  </div>
                  <Input
                    id="email"
                    type="email"
                    {...register('email')}
                    placeholder="name@company.com"
                    className={`h-12 w-full rounded-xl border-slate-200 bg-white/80 pl-11 text-slate-800 placeholder:text-slate-400 focus:border-sky-400 focus:bg-white focus:ring-4 focus:ring-sky-100 transition-all shadow-sm ${
                      errors.email ? "border-red-300 focus:border-red-400 focus:ring-red-100" : ""
                    }`}
                  />
                </div>
                {errors.email && (
                  <span className="block text-left text-xs font-medium text-red-500 mt-1.5 animate-in slide-in-from-top-1">
                    {errors.email.message}
                  </span>
                )}
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password" className="text-xs font-bold uppercase tracking-wider text-slate-600 block text-left">
                    Password
                  </Label>
                  <a href="#" className="text-xs font-semibold text-sky-500 hover:text-sky-600 transition-colors">
                    Forgot password?
                  </a>
                </div>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-slate-400 group-focus-within:text-sky-500 transition-colors" />
                  </div>
                  <Input
                    id="password"
                    type="password"
                    {...register('password')}
                    placeholder="••••••••"
                    className={`h-12 w-full rounded-xl border-slate-200 bg-white/80 pl-11 text-slate-800 placeholder:text-slate-400 focus:border-sky-400 focus:bg-white focus:ring-4 focus:ring-sky-100 transition-all shadow-sm ${
                      errors.password ? "border-red-300 focus:border-red-400 focus:ring-red-100" : ""
                    }`}
                  />
                </div>
                {errors.password && (
                  <span className="block text-left text-xs font-medium text-red-500 mt-1.5 animate-in slide-in-from-top-1">
                    {errors.password.message}
                  </span>
                )}
              </div>
              
              <Button
                type="submit"
                disabled={isSubmitting}
                className="group relative mt-6 h-12 w-full overflow-hidden rounded-xl bg-gradient-to-r from-sky-400 to-blue-500 text-white font-bold text-[15px] shadow-md shadow-sky-500/20 transition-all hover:shadow-lg hover:shadow-sky-500/30 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-70 disabled:hover:scale-100"
              >
                {isSubmitting ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Authenticating...
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    Sign In to Portal
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </span>
                )}
              </Button>
            </form>
          </CardContent>
        </div>
      </Card>
    </div>
  );
}
