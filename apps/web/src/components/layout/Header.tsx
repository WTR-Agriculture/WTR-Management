'use client';

import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/auth';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { MobileSidebar } from './Sidebar';
import { ThemeToggle } from '@/components/theme-toggle';
import { LogOut, User, Settings, Search, Bell, Calendar } from 'lucide-react';

export function Header() {
    const router = useRouter();
    const { user, logout } = useAuthStore();

    const handleLogout = async () => {
        await logout();
        router.push('/login');
    };

    const getInitials = (name: string) => {
        return name
            .split(' ')
            .map((n) => n[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);
    };

    // Get current date
    const today = new Date();
    const dateStr = today.toLocaleDateString('en-US', {
        weekday: 'short',
        day: 'numeric',
        month: 'short',
    });

    return (
        <header className="h-16 bg-background flex items-center justify-between px-4 lg:px-6 border-b border-border">
            <div className="flex items-center gap-4">
                <MobileSidebar />

                {/* Search */}
                <div className="hidden md:flex relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Start searching here..."
                        className="w-[280px] pl-9 rounded-full bg-muted/50 border-0 focus-visible:ring-1 focus-visible:ring-primary"
                    />
                </div>
            </div>

            <div className="flex items-center gap-3">
                {/* Notifications */}
                <Button variant="ghost" size="icon" className="rounded-full h-9 w-9 relative">
                    <Bell className="h-4 w-4" />
                    <span className="absolute -top-0.5 -right-0.5 h-4 w-4 bg-red-500 text-[10px] font-bold text-white rounded-full flex items-center justify-center">
                        3
                    </span>
                </Button>

                {/* Date Badge */}
                <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-muted/50 rounded-full">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">{dateStr}</span>
                    <span className="h-5 w-5 rounded-full bg-primary text-[10px] text-primary-foreground flex items-center justify-center font-bold">
                        {today.getDate()}
                    </span>
                </div>

                <ThemeToggle />

                {/* User Menu */}
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="relative h-9 w-9 rounded-full p-0">
                            <Avatar className="h-9 w-9 border-2 border-primary/20">
                                <AvatarImage src="/avatar.jpg" />
                                <AvatarFallback className="bg-gradient-to-br from-violet-500 to-purple-600 text-white text-sm font-medium">
                                    {user ? getInitials(user.name) : 'U'}
                                </AvatarFallback>
                            </Avatar>
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56">
                        <DropdownMenuLabel>
                            <div className="flex flex-col space-y-1">
                                <p className="text-sm font-medium">{user?.name}</p>
                                <p className="text-xs text-muted-foreground">{user?.email}</p>
                                <span className="text-xs text-primary capitalize font-medium">{user?.role}</span>
                            </div>
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="cursor-pointer">
                            <User className="mr-2 h-4 w-4" />
                            Profile
                        </DropdownMenuItem>
                        <DropdownMenuItem className="cursor-pointer">
                            <Settings className="mr-2 h-4 w-4" />
                            Settings
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                            onClick={handleLogout}
                            className="text-destructive focus:text-destructive cursor-pointer"
                        >
                            <LogOut className="mr-2 h-4 w-4" />
                            Logout
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </header>
    );
}
