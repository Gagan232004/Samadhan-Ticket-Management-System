import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { signIn, useSession } from '../lib/auth-client';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2, Mail, Lock, ArrowRight, Cloud } from 'lucide-react';

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const emailSchema = z.string()
  .email({ message: "Invalid email address" })
  .max(255, { message: "Email address is too long" });

const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Password is required')
});

type LoginForm = z.infer<typeof loginSchema>;

export default function Login() {
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { data: session } = useSession();

  useEffect(() => {
    if (session?.user) {
      navigate('/');
    }
  }, [session, navigate]);

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
      const { data: sessionData, error: authError } = await signIn.email({
        email: data.email,
        password: data.password,
      });

      if (authError) {
        let errorMsg = authError.message || 'Failed to login';
        if (errorMsg.includes('banned') || authError.code === 'BANNED_USER' || authError.status === 403) {
          errorMsg = 'User does not exist.';
        }
        setError(errorMsg);
        return;
      }

      navigate('/');
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred');
    }
  };

  return (
    <div className="relative flex min-h-[calc(100vh-80px)] items-center justify-center overflow-hidden bg-slate-50 bg-grid-white">
      {/* Static Background Gradients for better performance */}
      <div className="absolute top-[-10%] left-[-5%] h-[600px] w-[600px] rounded-full bg-indigo-600/20 blur-[120px] transform-gpu pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-5%] h-[700px] w-[700px] rounded-full bg-pink-600/10 blur-[120px] transform-gpu pointer-events-none" />

      <Card className="relative z-10 w-full max-w-[440px] overflow-hidden rounded-3xl border border-slate-200 glass-panel p-2 transition-all duration-500 hover:shadow-[0_8px_40px_-12px_rgba(99,102,241,0.4)]">
        <div className="rounded-2xl border border-slate-100 bg-white p-8 shadow-sm backdrop-blur-md">
          <CardHeader className="space-y-3 pb-8 pt-0 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-tr from-indigo-500 to-purple-500 shadow-lg shadow-indigo-500/30">
              <Cloud className="h-7 w-7 text-slate-900" />
            </div>
            <CardTitle className="text-3xl font-bold tracking-tight text-slate-900">
              Welcome Back
            </CardTitle>
            <CardDescription className="text-sm font-medium text-gray-400">
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
                <Label htmlFor="email" className="text-xs font-bold uppercase tracking-wider text-gray-400 block text-left">
                  Email Address
                </Label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-gray-500 group-focus-within:text-indigo-600 transition-colors" />
                  </div>
                  <Input
                    id="email"
                    type="email"
                    {...register('email')}
                    placeholder="name@company.com"
                    className={`h-12 w-full rounded-xl border-slate-200 bg-slate-50/50 pl-11 text-slate-900 placeholder:text-gray-600 focus:border-indigo-500 focus:bg-white focus:ring-1 focus:ring-indigo-500 transition-all shadow-inner ${
                      errors.email ? "border-red-500/50 focus:border-red-500 focus:ring-red-500/20" : ""
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
                  <Label htmlFor="password" className="text-xs font-bold uppercase tracking-wider text-gray-400 block text-left">
                    Password
                  </Label>
                  <a href="#" className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 transition-colors">
                    Forgot password?
                  </a>
                </div>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-500 group-focus-within:text-indigo-600 transition-colors" />
                  </div>
                  <Input
                    id="password"
                    type="password"
                    {...register('password')}
                    placeholder="••••••••"
                    className={`h-12 w-full rounded-xl border-slate-200 bg-slate-50/50 pl-11 text-slate-900 placeholder:text-gray-600 focus:border-indigo-500 focus:bg-white focus:ring-1 focus:ring-indigo-500 transition-all shadow-inner ${
                      errors.password ? "border-red-500/50 focus:border-red-500 focus:ring-red-500/20" : ""
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
                className="group relative mt-6 h-12 w-full overflow-hidden rounded-xl bg-gradient-to-r from-indigo-500 to-purple-500 text-slate-900 font-bold text-[15px] shadow-lg shadow-indigo-500/25 transition-all hover:shadow-indigo-500/40 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-70 disabled:hover:scale-100"
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
