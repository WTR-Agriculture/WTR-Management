'use client';

import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';
import { Sun, Moon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export function ThemeToggle() {
    const { theme, setTheme, resolvedTheme } = useTheme();
    const [mounted, setMounted] = useState(false);

    // Prevent hydration mismatch
    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) {
        return (
            <Button variant="ghost" size="icon" className="w-9 h-9">
                <div className="h-4 w-4" />
            </Button>
        );
    }

    const isDark = resolvedTheme === 'dark';

    return (
        <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(isDark ? 'light' : 'dark')}
            className={cn(
                'w-9 h-9 rounded-full transition-all duration-200',
                'hover:bg-muted/80',
                'relative overflow-hidden'
            )}
            aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
        >
            <Sun
                className={cn(
                    'h-4 w-4 transition-all duration-300 absolute',
                    isDark
                        ? 'rotate-90 scale-0 opacity-0'
                        : 'rotate-0 scale-100 opacity-100'
                )}
            />
            <Moon
                className={cn(
                    'h-4 w-4 transition-all duration-300 absolute',
                    isDark
                        ? 'rotate-0 scale-100 opacity-100'
                        : '-rotate-90 scale-0 opacity-0'
                )}
            />
        </Button>
    );
}

// Pill-style toggle (alternative design)
export function ThemeTogglePill() {
    const { resolvedTheme, setTheme } = useTheme();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) {
        return <div className="w-20 h-8 bg-muted rounded-full" />;
    }

    const isDark = resolvedTheme === 'dark';

    return (
        <div
            className={cn(
                'relative flex items-center w-20 h-8 rounded-full p-1 cursor-pointer transition-colors duration-200',
                isDark ? 'bg-surface-elevated' : 'bg-muted'
            )}
            onClick={() => setTheme(isDark ? 'light' : 'dark')}
            role="button"
            aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
        >
            {/* Background icons */}
            <div className="absolute inset-0 flex items-center justify-between px-2 pointer-events-none">
                <Sun className="h-4 w-4 text-amber-500" />
                <Moon className="h-4 w-4 text-slate-400" />
            </div>

            {/* Slider */}
            <div
                className={cn(
                    'absolute w-6 h-6 rounded-full bg-card shadow-sm transition-transform duration-200 ease-out',
                    'border border-border-subtle',
                    isDark ? 'translate-x-11' : 'translate-x-0'
                )}
            />
        </div>
    );
}
