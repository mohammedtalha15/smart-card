'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signInWithGoogle, signInWithEmail, signUpWithEmail, isValidCollegeEmail } from '@/lib/auth';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { TextEffect } from '@/components/motion-primitives/text-effect';
import { AnimatedGroup } from '@/components/motion-primitives/animated-group';
import { transitionVariants } from '@/lib/utils';
import { toast } from 'sonner';
import { Mail, Chrome, AlertTriangle } from 'lucide-react';

export default function LoginPage() {
  const { configured } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleGoogleLogin = async () => {
    try {
      setLoading(true);
      const result = await signInWithGoogle();
      if (result.user.email && !isValidCollegeEmail(result.user.email)) {
        toast.error('Only college emails (@bmsit.in) are allowed');
        return;
      }
      toast.success('Welcome to Artha!');
      router.push('/dashboard');
    } catch (error) {
      toast.error('Google sign-in failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValidCollegeEmail(email)) {
      toast.error('Only college emails (e.g., name@bmsit.in) are allowed');
      return;
    }
    try {
      setLoading(true);
      if (isSignUp) {
        await signUpWithEmail(email, password);
        toast.success('Account created! Welcome to Artha.');
      } else {
        await signInWithEmail(email, password);
        toast.success('Welcome back!');
      }
      router.push('/dashboard');
    } catch (error: any) {
      const msg = error?.code === 'auth/user-not-found'
        ? 'No account found. Try signing up.'
        : error?.code === 'auth/wrong-password'
        ? 'Incorrect password.'
        : 'Authentication failed. Please try again.';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-6 py-12">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <AnimatedGroup
            variants={{
              container: {
                visible: {
                  transition: { staggerChildren: 0.05, delayChildren: 0.1 },
                },
              },
              ...transitionVariants,
            }}
            className="flex flex-col items-center gap-4"
          >
            <div className="size-16 rounded-2xl bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-3xl">A</span>
            </div>
          </AnimatedGroup>

          <TextEffect
            preset="fade-in-blur"
            speedSegment={0.3}
            as="h1"
            className="mt-6 text-balance text-4xl font-semibold tracking-tight"
          >
            Welcome to Artha
          </TextEffect>

          <TextEffect
            per="line"
            preset="fade-in-blur"
            speedSegment={0.3}
            delay={0.3}
            as="p"
            className="mt-3 text-muted-foreground"
          >
            Unlock real-world value through verified student discounts
          </TextEffect>
        </div>

        <AnimatedGroup
          variants={{
            container: {
              visible: {
                transition: { staggerChildren: 0.05, delayChildren: 0.5 },
              },
            },
            ...transitionVariants,
          }}
        >
          {!configured && (
            <Card className="border-yellow-500/30 bg-yellow-500/5 mb-4">
              <CardContent className="pt-6">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="size-5 text-yellow-500 shrink-0 mt-0.5" />
                  <div className="space-y-2">
                    <p className="font-semibold text-sm">Firebase Not Configured</p>
                    <p className="text-sm text-muted-foreground">
                      Update <code className="text-xs bg-secondary px-1.5 py-0.5 rounded font-mono">.env.local</code> with your Firebase project credentials to enable authentication.
                    </p>
                    <p className="text-xs text-muted-foreground font-mono">
                      NEXT_PUBLIC_FIREBASE_API_KEY=your_key
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
          <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
            <CardHeader className="text-center">
              <CardTitle className="text-lg">{isSignUp ? 'Create account' : 'Sign in'}</CardTitle>
              <CardDescription>
                Use your college email to continue
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button
                variant="outline"
                className="w-full h-11 gap-3 group"
                onClick={handleGoogleLogin}
                disabled={loading}
              >
                <Chrome className="size-5 group-hover:text-primary transition-colors" />
                <span>Continue with Google</span>
              </Button>

              <div className="relative">
                <Separator />
                <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-card px-3 text-xs text-muted-foreground font-mono">
                  OR
                </span>
              </div>

              <form onSubmit={handleEmailAuth} className="space-y-3">
                <div className="space-y-1.5">
                  <Label htmlFor="email" className="text-xs font-mono uppercase text-muted-foreground">
                    Email
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@bmsit.in"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="password" className="text-xs font-mono uppercase text-muted-foreground">
                    Password
                  </Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={6}
                  />
                </div>
                <Button
                  type="submit"
                  className="w-full h-11"
                  disabled={loading}
                >
                  <Mail className="size-4" />
                  <span>{isSignUp ? 'Create Account' : 'Sign In'}</span>
                </Button>
              </form>

              <p className="text-center text-sm text-muted-foreground">
                {isSignUp ? 'Already have an account? ' : 'Don\'t have an account? '}
                <button
                  onClick={() => setIsSignUp(!isSignUp)}
                  className="text-foreground underline underline-offset-4 hover:text-primary cursor-pointer transition-all duration-200"
                >
                  {isSignUp ? 'Sign in' : 'Sign up'}
                </button>
              </p>
            </CardContent>
          </Card>
        </AnimatedGroup>
      </div>
    </div>
  );
}
