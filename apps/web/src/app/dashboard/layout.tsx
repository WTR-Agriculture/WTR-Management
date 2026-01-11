'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/auth';
import { Sidebar } from '@/components/layout/Sidebar';
import { Header } from '@/components/layout/Header';

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const router = useRouter();
    const { isAuthenticated, user } = useAuthStore();

    useEffect(() => {
        // Redirect to login if not authenticated
        if (!isAuthenticated) {
            router.push('/login');
        }
    }, [isAuthenticated, router]);

    // Show loading while checking auth
    if (!isAuthenticated || !user) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="flex flex-col items-center gap-3">
                    <div className="animate-spin h-8 w-8 border-3 border-primary border-t-transparent rounded-full" />
                    <p className="text-sm text-muted-foreground">Loading...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="h-screen bg-background flex overflow-hidden">
            <Sidebar />
            <div className="flex-1 flex flex-col h-screen overflow-hidden">
                <Header />
                <main className="flex-1 p-4 lg:p-6 overflow-y-auto">
                    {children}
                </main>
            </div>
        </div>
    );
}
