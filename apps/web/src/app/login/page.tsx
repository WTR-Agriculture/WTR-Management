'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ThemeToggle } from '@/components/theme-toggle';

export default function LoginPage() {
    const router = useRouter();
    const { login, isLoading, error, clearError } = useAuthStore();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        clearError();

        try {
            await login(email, password);
            router.push('/dashboard');
        } catch (err) {
            // Error is handled by store
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-background relative">
            {/* Theme Toggle - Top Right */}
            <div className="absolute top-4 right-4">
                <ThemeToggle />
            </div>

            {/* Subtle background pattern */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-40 -right-40 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
                <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
            </div>

            <Card className="w-full max-w-md mx-4 relative z-10 bg-card border-border shadow-lg">
                <CardHeader className="space-y-1 text-center pb-4">
                    {/* Logo */}
                    <div className="mx-auto mb-4 w-14 h-14 bg-primary rounded-xl flex items-center justify-center shadow-sm">
                        <span className="text-xl font-bold text-primary-foreground">W</span>
                    </div>
                    <CardTitle className="text-2xl font-semibold text-foreground">
                        Welcome back
                    </CardTitle>
                    <CardDescription className="text-muted-foreground">
                        Enter your credentials to access your account
                    </CardDescription>
                </CardHeader>

                <CardContent className="pt-0">
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {error && (
                            <Alert variant="destructive" className="py-2">
                                <AlertDescription className="text-sm">{error}</AlertDescription>
                            </Alert>
                        )}

                        <div className="space-y-2">
                            <Label htmlFor="email" className="text-sm font-medium text-foreground">
                                Email
                            </Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="admin@wtr.local"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                className="h-10"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="password" className="text-sm font-medium text-foreground">
                                Password
                            </Label>
                            <Input
                                id="password"
                                type="password"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                className="h-10"
                            />
                        </div>

                        <Button
                            type="submit"
                            className="w-full h-10 bg-primary hover:bg-primary-hover text-primary-foreground font-medium transition-colors"
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <span className="flex items-center gap-2">
                                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                    </svg>
                                    Signing in...
                                </span>
                            ) : (
                                'Sign in'
                            )}
                        </Button>
                    </form>

                    <div className="mt-6 pt-4 border-t border-border text-center text-sm text-muted-foreground">
                        <p className="mb-1">Demo credentials:</p>
                        <p className="font-mono text-xs text-foreground/80">
                            admin@wtr.local / admin123
                        </p>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
