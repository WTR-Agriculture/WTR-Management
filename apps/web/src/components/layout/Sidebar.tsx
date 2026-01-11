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
    ChevronLeft,
    Menu,
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
                'hidden lg:flex flex-col h-screen bg-slate-900 border-r border-slate-800 transition-all duration-300',
                collapsed ? 'w-16' : 'w-64'
            )}
        >
            {/* Logo */}
            <div className="h-16 flex items-center justify-between px-4 border-b border-slate-800">
                {!collapsed && (
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-emerald-500 rounded-lg flex items-center justify-center">
                            <span className="text-sm font-bold text-white">W</span>
                        </div>
                        <span className="font-semibold text-white">WTR Management</span>
                    </div>
                )}
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setCollapsed(!collapsed)}
                    className="text-slate-400 hover:text-white hover:bg-slate-800"
                >
                    <ChevronLeft className={cn('h-4 w-4 transition-transform', collapsed && 'rotate-180')} />
                </Button>
            </div>

            {/* Navigation */}
            <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
                {navItems.map((item) => {
                    const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                'flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors',
                                isActive
                                    ? 'bg-gradient-to-r from-blue-500/20 to-emerald-500/20 text-white border border-blue-500/30'
                                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                            )}
                        >
                            <item.icon className="h-5 w-5 flex-shrink-0" />
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
                <Button variant="ghost" size="icon" className="lg:hidden">
                    <Menu className="h-5 w-5" />
                </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-64 p-0 bg-slate-900 border-slate-800">
                {/* Logo */}
                <div className="h-16 flex items-center px-4 border-b border-slate-800">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-emerald-500 rounded-lg flex items-center justify-center">
                            <span className="text-sm font-bold text-white">W</span>
                        </div>
                        <span className="font-semibold text-white">WTR Management</span>
                    </div>
                </div>

                {/* Navigation */}
                <nav className="p-3 space-y-1">
                    {navItems.map((item) => {
                        const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={cn(
                                    'flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors',
                                    isActive
                                        ? 'bg-gradient-to-r from-blue-500/20 to-emerald-500/20 text-white border border-blue-500/30'
                                        : 'text-slate-400 hover:text-white hover:bg-slate-800'
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
