'use client';

import { useAuthStore } from '@/lib/auth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Users,
    ShoppingCart,
    Package,
    TrendingUp,
    DollarSign,
    Activity,
} from 'lucide-react';

const stats = [
    {
        title: 'Total Users',
        value: '12',
        change: '+2 this month',
        icon: Users,
        color: 'from-blue-500 to-blue-600',
    },
    {
        title: 'Sales Today',
        value: '฿45,250',
        change: '+12% from yesterday',
        icon: ShoppingCart,
        color: 'from-emerald-500 to-emerald-600',
    },
    {
        title: 'Products',
        value: '1,234',
        change: '45 low stock',
        icon: Package,
        color: 'from-amber-500 to-amber-600',
    },
    {
        title: 'This Month',
        value: '฿1.2M',
        change: '+8% from last month',
        icon: TrendingUp,
        color: 'from-purple-500 to-purple-600',
    },
];

export default function DashboardPage() {
    const { user } = useAuthStore();

    return (
        <div className="space-y-6">
            {/* Welcome Section */}
            <div className="bg-gradient-to-r from-blue-500/10 via-emerald-500/10 to-purple-500/10 rounded-2xl p-6 border border-slate-800">
                <h2 className="text-2xl font-bold text-white">
                    Welcome back, {user?.name?.split(' ')[0]} 👋
                </h2>
                <p className="text-slate-400 mt-1">
                    Here&apos;s what&apos;s happening with your business today.
                </p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {stats.map((stat) => (
                    <Card
                        key={stat.title}
                        className="bg-slate-800/50 border-slate-700 hover:border-slate-600 transition-colors"
                    >
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium text-slate-400">
                                {stat.title}
                            </CardTitle>
                            <div
                                className={`p-2 rounded-lg bg-gradient-to-br ${stat.color}`}
                            >
                                <stat.icon className="h-4 w-4 text-white" />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-white">{stat.value}</div>
                            <p className="text-xs text-slate-500 mt-1">{stat.change}</p>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="bg-slate-800/50 border-slate-700">
                    <CardHeader>
                        <CardTitle className="text-white flex items-center gap-2">
                            <Activity className="h-5 w-5 text-blue-400" />
                            Recent Activity
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {[
                                { action: 'New sale', detail: 'Invoice #INV-001234', time: '2 min ago' },
                                { action: 'User login', detail: 'admin@wtr.local', time: '5 min ago' },
                                { action: 'Stock updated', detail: 'Product SKU-0045', time: '10 min ago' },
                                { action: 'New customer', detail: 'บริษัท ABC จำกัด', time: '1 hour ago' },
                            ].map((item, i) => (
                                <div
                                    key={i}
                                    className="flex items-center justify-between py-2 border-b border-slate-700 last:border-0"
                                >
                                    <div>
                                        <p className="text-sm font-medium text-white">{item.action}</p>
                                        <p className="text-xs text-slate-500">{item.detail}</p>
                                    </div>
                                    <span className="text-xs text-slate-500">{item.time}</span>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-slate-800/50 border-slate-700">
                    <CardHeader>
                        <CardTitle className="text-white flex items-center gap-2">
                            <DollarSign className="h-5 w-5 text-emerald-400" />
                            Quick Stats
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {[
                                { label: 'Pending Orders', value: '23', color: 'text-amber-400' },
                                { label: 'Products Sold Today', value: '156', color: 'text-blue-400' },
                                { label: 'Revenue This Week', value: '฿328,450', color: 'text-emerald-400' },
                                { label: 'Active Customers', value: '89', color: 'text-purple-400' },
                            ].map((item, i) => (
                                <div
                                    key={i}
                                    className="flex items-center justify-between py-2 border-b border-slate-700 last:border-0"
                                >
                                    <span className="text-sm text-slate-400">{item.label}</span>
                                    <span className={`text-sm font-semibold ${item.color}`}>
                                        {item.value}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
