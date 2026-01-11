'use client';

import { useAuthStore } from '@/lib/auth';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/theme-toggle';
import {
    Users,
    ShoppingCart,
    Package,
    TrendingUp,
    ArrowUpRight,
    ArrowDownRight,
    Filter,
    MoreVertical,
    ChevronDown,
    Sparkles,
} from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    LineChart,
    Line,
    PieChart,
    Pie,
    Cell,
    AreaChart,
    Area,
} from 'recharts';

// Chart data
const barChartData = [
    { name: 'Mon', value: 400 },
    { name: 'Tue', value: 650 },
    { name: 'Wed', value: 890 },
    { name: 'Thu', value: 550 },
    { name: 'Fri', value: 700 },
    { name: 'Sat', value: 450 },
    { name: 'Sun', value: 600 },
];

const lineChartData = [
    { name: 'Jan', received: 4000, ordered: 2400 },
    { name: 'Feb', received: 3000, ordered: 1398 },
    { name: 'Mar', received: 2000, ordered: 9800 },
    { name: 'Apr', received: 2780, ordered: 3908 },
    { name: 'May', received: 1890, ordered: 4800 },
    { name: 'Jun', received: 2390, ordered: 3800 },
];

const donutData = [
    { name: 'Growth', value: 73.1 },
    { name: 'Remaining', value: 26.9 },
];

// Theme-aware colors for donut chart
const DONUT_COLORS = {
    primary: '#8B5CF6',
    muted: 'rgba(113, 113, 122, 0.2)', // Works in both light/dark
};

// Custom minimal tooltip
const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-popover/95 backdrop-blur-sm px-3 py-2 rounded-lg shadow-lg border border-border/50">
                <p className="text-sm font-medium text-foreground">
                    ${payload[0].value.toLocaleString()}
                </p>
            </div>
        );
    }
    return null;
};

// Recent Sales Item
function SaleItem({
    name,
    date,
    amount,
    status,
    avatar,
}: {
    name: string;
    date: string;
    amount: string;
    status: 'new' | 'completed' | 'cancelled';
    avatar: string;
}) {
    const statusColors = {
        new: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400',
        completed: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400',
        cancelled: 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400',
    };

    return (
        <div className="flex items-center justify-between py-3">
            <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10">
                    <AvatarFallback className="bg-gradient-to-br from-violet-500 to-purple-600 text-white text-sm">
                        {avatar}
                    </AvatarFallback>
                </Avatar>
                <div>
                    <p className="text-sm font-medium text-foreground">{name}</p>
                    <p className="text-xs text-muted-foreground">{date}</p>
                </div>
            </div>
            <div className="flex items-center gap-3">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[status]}`}>
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                </span>
                <span className="text-sm font-semibold text-foreground">{amount}</span>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                    <MoreVertical className="h-4 w-4" />
                </Button>
            </div>
        </div>
    );
}

// Top Product Item
function TopProduct({
    name,
    category,
    sales,
    change,
    changeType,
    percentage,
}: {
    name: string;
    category: string;
    sales: string;
    change: string;
    changeType: 'up' | 'down';
    percentage: number;
}) {
    return (
        <div className="flex items-center justify-between py-2">
            <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-foreground truncate">{name}</p>
                <p className="text-xs text-muted-foreground">{category}</p>
            </div>
            <div className="flex items-center gap-3 ml-4">
                <div className="w-20 h-2 bg-muted rounded-full overflow-hidden">
                    <div
                        className="h-full bg-gradient-to-r from-violet-500 to-purple-600 rounded-full transition-all"
                        style={{ width: `${percentage}%` }}
                    />
                </div>
                <span className="text-sm font-medium text-foreground w-16 text-right">{sales}</span>
                <span
                    className={`text-xs font-medium w-12 text-right ${changeType === 'up' ? 'text-emerald-500' : 'text-red-500'
                        }`}
                >
                    {changeType === 'up' ? '↑' : '↓'} {change}
                </span>
            </div>
        </div>
    );
}

export default function DashboardPage() {
    const { user } = useAuthStore();

    return (
        <div className="space-y-6 pb-8">
            {/* Header Section */}
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-lg shadow-violet-500/25">
                        <ShoppingCart className="h-6 w-6 text-white" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-foreground">Your Sales Analysis</h1>
                        <p className="text-sm text-muted-foreground">
                            Welcome back, {user?.name?.split(' ')[0]}! Check your sales performance.
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <Button className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-full px-6">
                        + Add Widget
                    </Button>
                    <ThemeToggle />
                    <Button variant="outline" size="icon" className="rounded-full">
                        <Filter className="h-4 w-4" />
                    </Button>
                </div>
            </div>

            {/* Bento Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* AI Assistant Card - Large */}
                <Card className="md:col-span-1 lg:row-span-2 bg-gradient-to-br from-slate-900 to-slate-800 dark:from-slate-800 dark:to-slate-900 border-0 overflow-hidden relative">
                    <CardContent className="p-6 h-full flex flex-col justify-between min-h-[280px]">
                        {/* Abstract background */}
                        <div className="absolute inset-0 opacity-30">
                            <div className="absolute top-10 right-10 w-32 h-32 bg-violet-500 rounded-full blur-3xl" />
                            <div className="absolute bottom-10 left-10 w-24 h-24 bg-blue-500 rounded-full blur-2xl" />
                        </div>
                        <div className="relative z-10">
                            <div className="flex items-center gap-2 mb-3">
                                <Sparkles className="h-5 w-5 text-violet-400" />
                                <h3 className="text-lg font-semibold text-white">AI Assistant</h3>
                            </div>
                            <p className="text-sm text-slate-300">
                                Analyze product sales over last year. Compare revenue, quality, sales and brand.
                            </p>
                        </div>
                        <Button className="relative z-10 w-full bg-white/10 hover:bg-white/20 text-white border-0 backdrop-blur-sm rounded-full mt-4">
                            Analyze product sales
                            <ArrowUpRight className="ml-2 h-4 w-4" />
                        </Button>
                    </CardContent>
                </Card>

                {/* Bar Chart - Total Sales (Restyled) */}
                <Card className="md:col-span-1 bg-card border-0 shadow-sm">
                    <CardContent className="p-5">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-2">
                                <div className="h-8 w-8 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                                    <ShoppingCart className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                                </div>
                                <span className="font-semibold text-foreground">Total Sales</span>
                            </div>
                            <Button variant="ghost" size="sm" className="text-xs">
                                Week <ChevronDown className="ml-1 h-3 w-3" />
                            </Button>
                        </div>
                        <div className="h-36">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart
                                    data={barChartData}
                                    margin={{ top: 8, right: 0, left: 0, bottom: 0 }}
                                    barCategoryGap="20%"
                                >
                                    <Bar
                                        dataKey="value"
                                        fill="#10B981"
                                        radius={[6, 6, 0, 0]}
                                        maxBarSize={32}
                                        className="transition-opacity hover:opacity-80"
                                    />
                                    <XAxis
                                        dataKey="name"
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{
                                            fontSize: 11,
                                            fill: 'var(--muted-foreground)',
                                            fontWeight: 500,
                                        }}
                                        dy={8}
                                    />
                                    <Tooltip
                                        content={<CustomTooltip />}
                                        cursor={{ fill: 'transparent' }}
                                    />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                        <p className="text-2xl font-bold text-foreground mt-3">$890.5</p>
                    </CardContent>
                </Card>

                {/* Line Chart - Sales Revenue */}
                <Card className="md:col-span-2 bg-card border-0 shadow-sm">
                    <CardContent className="p-5">
                        <div className="flex items-center gap-2 mb-4">
                            <div className="h-8 w-8 rounded-lg bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center">
                                <TrendingUp className="h-4 w-4 text-violet-600 dark:text-violet-400" />
                            </div>
                            <span className="font-semibold text-foreground">Sales Revenue</span>
                        </div>
                        <div className="grid grid-cols-2 gap-6 mb-4">
                            <div>
                                <div className="flex items-center gap-2 mb-1">
                                    <ArrowUpRight className="h-3 w-3 text-emerald-500" />
                                    <span className="text-xs text-emerald-500">24% for 1 day</span>
                                </div>
                                <p className="text-2xl font-bold text-foreground">$1,609.18</p>
                                <p className="text-xs text-muted-foreground mt-1">● Received Amount</p>
                            </div>
                            <div>
                                <div className="flex items-center gap-2 mb-1">
                                    <ArrowUpRight className="h-3 w-3 text-blue-500" />
                                    <span className="text-xs text-blue-500">8%</span>
                                </div>
                                <p className="text-2xl font-bold text-foreground">$2,189.21</p>
                                <p className="text-xs text-muted-foreground mt-1">● Ordered Amount</p>
                            </div>
                        </div>
                        <div className="h-20">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={lineChartData}>
                                    <defs>
                                        <linearGradient id="colorReceived" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#10B981" stopOpacity={0.3} />
                                            <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <Area
                                        type="monotone"
                                        dataKey="received"
                                        stroke="#10B981"
                                        strokeWidth={2}
                                        fill="url(#colorReceived)"
                                    />
                                    <Tooltip
                                        contentStyle={{
                                            backgroundColor: 'var(--card)',
                                            border: '1px solid var(--border)',
                                            borderRadius: '8px',
                                        }}
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>

                {/* Recent Sales */}
                <Card className="md:col-span-2 bg-card border-0 shadow-sm">
                    <CardContent className="p-5">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-2">
                                <div className="h-8 w-8 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                                    <Users className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                                </div>
                                <span className="font-semibold text-foreground">Recent Sales</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                    <Filter className="h-4 w-4" />
                                </Button>
                                <Button variant="ghost" size="sm" className="text-xs">
                                    Week <ChevronDown className="ml-1 h-3 w-3" />
                                </Button>
                            </div>
                        </div>
                        <div className="divide-y divide-border">
                            <SaleItem name="Timothy Williams" date="Today" amount="+$324.99" status="new" avatar="TW" />
                            <SaleItem name="Glen Wood" date="2 Day Ago" amount="+$200.00" status="new" avatar="GW" />
                            <SaleItem name="Raymond Johnson" date="1 Day Ago" amount="-$150.00" status="cancelled" avatar="RJ" />
                            <SaleItem name="Kenneth Henderson" date="2 Days Ago" amount="+$840.99" status="completed" avatar="KH" />
                        </div>
                    </CardContent>
                </Card>

                {/* Donut Chart - Growth (Restyled) */}
                <Card className="bg-card border-0 shadow-sm">
                    <CardContent className="p-5">
                        <div className="flex items-center gap-2 mb-2">
                            <div className="h-8 w-8 rounded-lg bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center">
                                <TrendingUp className="h-4 w-4 text-violet-600 dark:text-violet-400" />
                            </div>
                            <span className="font-semibold text-foreground">Growth</span>
                        </div>
                        <div className="flex items-center justify-center py-4">
                            <div className="relative w-32 h-32">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={donutData}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={42}
                                            outerRadius={58}
                                            paddingAngle={0}
                                            dataKey="value"
                                            startAngle={90}
                                            endAngle={-270}
                                            stroke="none"
                                            cornerRadius={4}
                                        >
                                            <Cell fill={DONUT_COLORS.primary} />
                                            <Cell fill={DONUT_COLORS.muted} />
                                        </Pie>
                                    </PieChart>
                                </ResponsiveContainer>
                                <div className="absolute inset-0 flex flex-col items-center justify-center">
                                    <span className="text-2xl font-bold text-foreground tracking-tight">+73.1%</span>
                                    <span className="text-xs text-muted-foreground mt-0.5">Growth rate</span>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Top Products */}
                <Card className="md:col-span-1 lg:col-span-1 bg-card border-0 shadow-sm">
                    <CardContent className="p-5">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-2">
                                <div className="h-8 w-8 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                                    <Package className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                                </div>
                                <span className="font-semibold text-foreground">Top Items</span>
                            </div>
                            <Button variant="link" className="text-xs text-primary p-0">
                                View All →
                            </Button>
                        </div>
                        <div className="space-y-2">
                            <TopProduct name="DualSense" category="Technique" sales="$320.24" change="12%" changeType="up" percentage={80} />
                            <TopProduct name="Gamepad" category="Accessories" sales="$180.9" change="23%" changeType="down" percentage={55} />
                            <TopProduct name="VR2" category="Accessories" sales="$124.0" change="42%" changeType="up" percentage={40} />
                            <TopProduct name="Steam codes" category="Subscription" sales="$100.4" change="29%" changeType="up" percentage={32} />
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
