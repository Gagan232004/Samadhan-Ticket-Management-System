import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { signIn } from '../lib/auth-client';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

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
          onSuccess: () => {
            navigate('/');
          },
          onError: (ctx) => {
            setError(ctx.error.message || 'Failed to login');
          },
        }
      });
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred');
    }
  };

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: 'calc(100vh - 80px)',
      background: 'radial-gradient(circle at 50% 50%, #1a1a2e 0%, #0f0f1a 100%)',
    }}>
      <div style={{
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        padding: '2.5rem',
        borderRadius: '16px',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
        width: '100%',
        maxWidth: '400px',
      }}>
        <h2 style={{
          textAlign: 'center',
          fontSize: '2rem',
          marginBottom: '0.5rem',
          color: '#fff',
        }}>Welcome Back</h2>
        <p style={{
          textAlign: 'center',
          color: '#a0a0a0',
          marginBottom: '2rem',
        }}>Please sign in to your account</p>

        {error && (
          <div style={{
            backgroundColor: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid #ef4444',
            color: '#ef4444',
            padding: '0.75rem',
            borderRadius: '8px',
            marginBottom: '1.5rem',
            textAlign: 'center',
            fontSize: '0.9rem',
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} noValidate style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div>
            <label htmlFor="email" style={{ display: 'block', marginBottom: '0.5rem', color: '#e0e0e0', fontSize: '0.9rem', textAlign: 'left' }}>Email</label>
            <input
              id="email"
              type="email"
              {...register('email')}
              placeholder="name@example.com"
              style={{
                width: '100%',
                padding: '0.75rem',
                borderRadius: '8px',
                border: `1px solid ${errors.email ? '#ef4444' : 'rgba(255, 255, 255, 0.2)'}`,
                backgroundColor: 'rgba(0, 0, 0, 0.2)',
                color: '#fff',
                fontSize: '1rem',
                outline: 'none',
                boxSizing: 'border-box',
                transition: 'border-color 0.2s',
              }}
              onFocus={(e) => { if(!errors.email) e.target.style.borderColor = '#646cff' }}
              onBlur={(e) => { if(!errors.email) e.target.style.borderColor = 'rgba(255, 255, 255, 0.2)' }}
            />
            {errors.email && (
              <span style={{ color: '#ef4444', fontSize: '0.8rem', marginTop: '0.25rem', display: 'block', textAlign: 'left' }}>
                {errors.email.message}
              </span>
            )}
          </div>
          
          <div>
            <label htmlFor="password" style={{ display: 'block', marginBottom: '0.5rem', color: '#e0e0e0', fontSize: '0.9rem', textAlign: 'left' }}>Password</label>
            <input
              id="password"
              type="password"
              {...register('password')}
              placeholder="••••••••"
              style={{
                width: '100%',
                padding: '0.75rem',
                borderRadius: '8px',
                border: `1px solid ${errors.password ? '#ef4444' : 'rgba(255, 255, 255, 0.2)'}`,
                backgroundColor: 'rgba(0, 0, 0, 0.2)',
                color: '#fff',
                fontSize: '1rem',
                outline: 'none',
                boxSizing: 'border-box',
                transition: 'border-color 0.2s',
              }}
              onFocus={(e) => { if(!errors.password) e.target.style.borderColor = '#646cff' }}
              onBlur={(e) => { if(!errors.password) e.target.style.borderColor = 'rgba(255, 255, 255, 0.2)' }}
            />
            {errors.password && (
              <span style={{ color: '#ef4444', fontSize: '0.8rem', marginTop: '0.25rem', display: 'block', textAlign: 'left' }}>
                {errors.password.message}
              </span>
            )}
          </div>
          
          <button
            type="submit"
            disabled={isSubmitting}
            style={{
              marginTop: '0.5rem',
              width: '100%',
              padding: '0.875rem',
              borderRadius: '8px',
              border: 'none',
              backgroundColor: '#646cff',
              color: 'white',
              fontSize: '1rem',
              fontWeight: 600,
              cursor: isSubmitting ? 'not-allowed' : 'pointer',
              opacity: isSubmitting ? 0.7 : 1,
              transition: 'background-color 0.2s, transform 0.1s',
            }}
            onMouseOver={(e) => { if(!isSubmitting) e.currentTarget.style.backgroundColor = '#535bf2' }}
            onMouseOut={(e) => { if(!isSubmitting) e.currentTarget.style.backgroundColor = '#646cff' }}
            onMouseDown={(e) => { if(!isSubmitting) e.currentTarget.style.transform = 'scale(0.98)' }}
            onMouseUp={(e) => { if(!isSubmitting) e.currentTarget.style.transform = 'scale(1)' }}
          >
            {isSubmitting ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  );
}
