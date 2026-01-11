'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
    LayoutDashboard,
    Users,
    Shield,
    Package,
    ShoppingCart,
    Receipt,
    TrendingUp,
    Settings,
    LogOut,
    ChevronLeft,
    Menu,
    Sparkles,
} from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';

interface NavItem {
    title: string;
    href: string;
    icon: React.ElementType;
    permission?: string;
}

const navItems: NavItem[] = [
    { title: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { title: 'Users', href: '/dashboard/users', icon: Users, permission: 'users.view' },
    { title: 'Roles', href: '/dashboard/roles', icon: Shield, permission: 'roles.view' },
    { title: 'Products', href: '/dashboard/products', icon: Package, permission: 'inventory.view' },
    { title: 'Sales', href: '/dashboard/sales', icon: ShoppingCart, permission: 'sales.view' },
    { title: 'Expenses', href: '/dashboard/expenses', icon: Receipt, permission: 'expense.view' },
    { title: 'Investment', href: '/dashboard/investment', icon: TrendingUp, permission: 'investment.view' },
    { title: 'Settings', href: '/dashboard/settings', icon: Settings, permission: 'settings.view' },
];

export function Sidebar() {
    const pathname = usePathname();
    const [collapsed, setCollapsed] = useState(false);

    return (
        <aside
            className={cn(
                'hidden lg:flex flex-col h-screen bg-card border-r border-border transition-all duration-300',
                collapsed ? 'w-[70px]' : 'w-[240px]'
            )}
        >
            {/* Logo + Collapse Button */}
            <div className="h-16 flex items-center justify-between px-4 border-b border-border">
                {!collapsed && (
                    <div className="flex items-center gap-2">
                        <div className="w-9 h-9 bg-gradient-to-br from-violet-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-violet-500/25">
                            <Sparkles className="h-5 w-5 text-white" />
                        </div>
                        <span className="font-bold text-lg text-foreground">WTR</span>
                    </div>
                )}
                {collapsed && (
                    <div className="w-9 h-9 mx-auto bg-gradient-to-br from-violet-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-violet-500/25">
                        <Sparkles className="h-5 w-5 text-white" />
                    </div>
                )}
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setCollapsed(!collapsed)}
                    className="h-8 w-8 text-muted-foreground hover:text-foreground"
                >
                    <ChevronLeft className={cn('h-4 w-4 transition-transform', collapsed && 'rotate-180')} />
                </Button>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
                {navItems.map((item) => {
                    const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                'flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200',
                                collapsed && 'justify-center px-2',
                                isActive
                                    ? 'bg-gradient-to-r from-violet-500 to-purple-600 text-white shadow-lg shadow-violet-500/25'
                                    : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                            )}
                        >
                            <item.icon className={cn('h-5 w-5 flex-shrink-0')} />
                            {!collapsed && <span className="text-sm font-medium">{item.title}</span>}
                        </Link>
                    );
                })}
            </nav>
        </aside>
    );
}

export function MobileSidebar() {
    const pathname = usePathname();

    return (
        <Sheet>
            <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="lg:hidden h-9 w-9 rounded-xl">
                    <Menu className="h-5 w-5" />
                </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[240px] p-0 border-border">
                {/* Logo */}
                <div className="h-16 flex items-center px-4 border-b border-border">
                    <div className="flex items-center gap-2">
                        <div className="w-9 h-9 bg-gradient-to-br from-violet-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-violet-500/25">
                            <Sparkles className="h-5 w-5 text-white" />
                        </div>
                        <span className="font-bold text-lg text-foreground">WTR Management</span>
                    </div>
                </div>

                {/* Navigation */}
                <nav className="px-3 py-4 space-y-1">
                    {navItems.map((item) => {
                        const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={cn(
                                    'flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200',
                                    isActive
                                        ? 'bg-gradient-to-r from-violet-500 to-purple-600 text-white shadow-lg shadow-violet-500/25'
                                        : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                                )}
                            >
                                <item.icon className="h-5 w-5" />
                                <span className="text-sm font-medium">{item.title}</span>
                            </Link>
                        );
                    })}
                </nav>
            </SheetContent>
        </Sheet>
    );
}
