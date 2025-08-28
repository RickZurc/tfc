import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, usePage } from '@inertiajs/react';
import { Activity, AlertTriangle, BarChart3, Calendar, DollarSign, Package, RotateCcw, ShoppingCart, TrendingUp, Trophy, Users } from 'lucide-react';

// Helper function to safely format numbers
const formatCurrency = (value: number | string): string => {
    const num = typeof value === 'string' ? parseFloat(value) : value;
    return isNaN(num) ? '0.00' : num.toFixed(2);
};

const formatNumber = (value: number | string, decimals: number = 1): string => {
    const num = typeof value === 'string' ? parseFloat(value) : value;
    return isNaN(num) ? '0' : num.toFixed(decimals);
};

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
    },
];

interface Statistics {
    todaySales: number;
    weekSales: number;
    monthSales: number;
    totalOrders: number;
    todayRefunds: number;
    weekRefunds: number;
    monthRefunds: number;
    totalRefunds: number;
    refundRate: number;
}

interface CategorySales {
    category: string;
    color: string;
    total_sales: number | string;
}

interface DailySales {
    date: string;
    total: number;
    orders: number;
}

interface TopProduct {
    name: string;
    total_sold: number;
    revenue: number;
}

interface LowStockProduct {
    id: number;
    name: string;
    stock_quantity: number;
    min_stock_level: number;
    category: {
        name: string;
        color: string;
    };
}

interface PageProps extends Record<string, unknown> {
    statistics: Statistics;
    salesByCategory: CategorySales[];
    dailySales: DailySales[];
    topProducts: TopProduct[];
    lowStockProducts: LowStockProduct[];
}

function SimpleBarChart({ data, title }: { data: DailySales[]; title: string }) {
    const maxValue = Math.max(...data.map((d) => d.total));

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Activity className="h-5 w-5" />
                    {title}
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-3">
                    {data.map((item, index) => (
                        <div key={index} className="space-y-1">
                            <div className="flex justify-between text-sm">
                                <span>{new Date(item.date).toLocaleDateString()}</span>
                                <span className="font-medium">${formatCurrency(item.total)}</span>
                            </div>
                            <Progress value={(item.total / maxValue) * 100} className="h-2" />
                            <div className="text-xs text-muted-foreground">{item.orders} orders</div>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}

function PieChart({ data, title }: { data: CategorySales[]; title: string }) {
    const total = data.reduce((sum, item) => sum + parseFloat(item.total_sales.toString()), 0);

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    {title}
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-3">
                    {data.map((item, index) => {
                        const salesValue = parseFloat(item.total_sales.toString());
                        const percentage = total > 0 ? (salesValue / total) * 100 : 0;
                        return (
                            <div key={index} className="space-y-1">
                                <div className="flex justify-between text-sm">
                                    <span className="flex items-center gap-2">
                                        <div className="h-3 w-3 rounded-full" style={{ backgroundColor: item.color }} />
                                        {item.category}
                                    </span>
                                    <span className="font-medium">${formatCurrency(salesValue)}</span>
                                </div>
                                <Progress
                                    value={percentage}
                                    className="h-2"
                                    style={{
                                        '--progress-background': item.color,
                                    } as React.CSSProperties}
                                />
                                <div className="text-xs text-muted-foreground">{formatNumber(percentage)}% of total sales</div>
                            </div>
                        );
                    })}
                </div>
            </CardContent>
        </Card>
    );
}

export default function Dashboard() {
    const { statistics, salesByCategory, dailySales, topProducts, lowStockProducts } = usePage<PageProps>().props;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard" />
            <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto rounded-xl p-4">
                {/* Statistics Cards */}
                <div className="grid auto-rows-min gap-4 md:grid-cols-2 lg:grid-cols-4">
                    {/* Today's Sales */}
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Today's Sales</CardTitle>
                            <DollarSign className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-green-600">${formatCurrency(statistics.todaySales)}</div>
                            <p className="text-xs text-muted-foreground">Revenue generated today</p>
                        </CardContent>
                    </Card>

                    {/* Weekly Sales */}
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">This Week</CardTitle>
                            <TrendingUp className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-blue-600">${formatCurrency(statistics.weekSales)}</div>
                            <p className="text-xs text-muted-foreground">Week to date sales</p>
                        </CardContent>
                    </Card>

                    {/* Monthly Sales */}
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">This Month</CardTitle>
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-purple-600">${formatCurrency(statistics.monthSales)}</div>
                            <p className="text-xs text-muted-foreground">Month to date sales</p>
                        </CardContent>
                    </Card>

                    {/* Total Orders */}
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
                            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-orange-600">{statistics.totalOrders}</div>
                            <p className="text-xs text-muted-foreground">Completed orders</p>
                        </CardContent>
                    </Card>
                </div>

                {/* Net Revenue and Refund Rate */}
                <div className="grid auto-rows-min gap-4 md:grid-cols-2">
                    {/* Net Revenue (This Month) */}
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Net Revenue (This Month)</CardTitle>
                            <TrendingUp className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-emerald-600">
                                ${formatCurrency(statistics.monthSales - statistics.monthRefunds)}
                            </div>
                            <p className="text-xs text-muted-foreground">Sales minus refunds for this month</p>
                            <div className="mt-2 flex items-center gap-2 text-xs">
                                <span className="font-medium text-green-600">${formatCurrency(statistics.monthSales)} sales</span>
                                <span className="text-gray-400">-</span>
                                <span className="font-medium text-red-500">${formatCurrency(statistics.monthRefunds)} refunds</span>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Refund Rate */}
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Refund Rate</CardTitle>
                            <RotateCcw className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-amber-600">{formatNumber(statistics.refundRate, 1)}%</div>
                            <p className="text-xs text-muted-foreground">Percentage of orders refunded</p>
                            <div className="mt-2 flex items-center gap-2 text-xs">
                                <span className="font-medium text-red-500">{statistics.totalRefunds} refunded</span>
                                <span className="text-gray-400">of</span>
                                <span className="font-medium text-blue-600">{statistics.totalOrders} total orders</span>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Refund Statistics */}
                <div className="grid auto-rows-min gap-4 md:grid-cols-2 lg:grid-cols-4">
                    {/* Today's Refunds */}
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Today's Refunds</CardTitle>
                            <RotateCcw className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-red-600">${formatCurrency(statistics.todayRefunds)}</div>
                            <p className="text-xs text-muted-foreground">Refunds processed today</p>
                        </CardContent>
                    </Card>

                    {/* Weekly Refunds */}
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Week Refunds</CardTitle>
                            <RotateCcw className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-red-500">${formatCurrency(statistics.weekRefunds)}</div>
                            <p className="text-xs text-muted-foreground">Week to date refunds</p>
                        </CardContent>
                    </Card>

                    {/* Monthly Refunds */}
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Month Refunds</CardTitle>
                            <RotateCcw className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-red-400">${formatCurrency(statistics.monthRefunds)}</div>
                            <p className="text-xs text-muted-foreground">Month to date refunds</p>
                        </CardContent>
                    </Card>

                    {/* Total Refund Orders */}
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Refunded Orders</CardTitle>
                            <RotateCcw className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-orange-500">{statistics.totalRefunds}</div>
                            <p className="text-xs text-muted-foreground">Orders with refunds</p>
                        </CardContent>
                    </Card>
                </div>

                {/* Charts and Analytics */}
                <div className="grid gap-6 md:grid-cols-2">
                    {/* Daily Sales Chart */}
                    {dailySales.length > 0 && <SimpleBarChart data={dailySales} title="Daily Sales (Last 7 Days)" />}

                    {/* Sales by Category */}
                    {salesByCategory.length > 0 && <PieChart data={salesByCategory} title="Sales by Category (Last 30 Days)" />}
                </div>

                {/* Top Products and Low Stock */}
                <div className="grid gap-6 md:grid-cols-2">
                    {/* Top Selling Products */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Trophy className="h-5 w-5" />
                                Top Selling Products (Last 30 Days)
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                {topProducts.length > 0 ? (
                                    topProducts.map((product, index) => (
                                        <div key={index} className="flex items-center justify-between rounded-lg border p-3">
                                            <div>
                                                <p className="font-medium">{product.name}</p>
                                                <p className="text-sm text-muted-foreground">{product.total_sold} units sold</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="font-bold text-green-600">${formatCurrency(product.revenue)}</p>
                                                <Badge variant="secondary">{index + 1}</Badge>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <p className="py-4 text-center text-muted-foreground">No sales data available yet</p>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Low Stock Alert */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <AlertTriangle className="h-5 w-5 text-red-500" />
                                Low Stock Alert
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                {lowStockProducts.length > 0 ? (
                                    lowStockProducts.map((product) => (
                                        <div key={product.id} className="flex items-center justify-between rounded-lg border border-red-200 p-3">
                                            <div>
                                                <p className="font-medium">{product.name}</p>
                                                <p className="text-sm text-muted-foreground">{product.category.name}</p>
                                            </div>
                                            <div className="text-right">
                                                <Badge variant="destructive">{product.stock_quantity} left</Badge>
                                                <p className="mt-1 text-xs text-muted-foreground">Min: {product.min_stock_level}</p>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <p className="py-4 text-center text-muted-foreground">All products are well stocked! 👍</p>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Quick Actions */}
                <div className="grid auto-rows-min gap-4 md:grid-cols-2 lg:grid-cols-4">
                    {/* POS System Card */}
                    <Card className="cursor-pointer transition-shadow hover:shadow-lg">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">POS System</CardTitle>
                            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-green-600">Start Selling</div>
                            <p className="text-xs text-muted-foreground">Process sales and manage transactions</p>
                            <Link href="/pos">
                                <Button className="mt-3 w-full" size="sm">
                                    Open POS
                                </Button>
                            </Link>
                        </CardContent>
                    </Card>

                    {/* Products Card */}
                    <Card className="cursor-pointer transition-shadow hover:shadow-lg">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Products</CardTitle>
                            <Package className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">Manage</div>
                            <p className="text-xs text-muted-foreground">Add, edit, and organize products</p>
                            <Link href="/products">
                                <Button variant="outline" className="mt-3 w-full" size="sm">
                                    View Products
                                </Button>
                            </Link>
                        </CardContent>
                    </Card>

                    {/* Customers Card */}
                    <Card className="cursor-pointer transition-shadow hover:shadow-lg">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Customers</CardTitle>
                            <Users className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">Coming Soon</div>
                            <p className="text-xs text-muted-foreground">Manage customer information</p>
                            <Button variant="outline" className="mt-3 w-full" size="sm" disabled>
                                View Customers
                            </Button>
                        </CardContent>
                    </Card>

                    {/* Reports Card */}
                    <Card className="cursor-pointer transition-shadow hover:shadow-lg">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Reports</CardTitle>
                            <BarChart3 className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">Analytics</div>
                            <p className="text-xs text-muted-foreground">Sales reports and insights</p>
                            <Link href="/orders">
                                <Button variant="outline" className="mt-3 w-full" size="sm">
                                    View Orders
                                </Button>
                            </Link>
                        </CardContent>
                    </Card>
                </div>

                {/* Welcome Message */}
                <Card>
                    <CardHeader>
                        <CardTitle>Welcome to Your POS System</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-muted-foreground">
                            Your Point of Sale system is ready to use! Start by accessing the POS interface to begin processing sales, or manage your
                            products and inventory from the navigation above.
                        </p>
                        <div className="mt-4 flex gap-2">
                            <Link href="/pos">
                                <Button>
                                    <ShoppingCart className="mr-2 h-4 w-4" />
                                    Start Selling
                                </Button>
                            </Link>
                            <Link href="/products">
                                <Button variant="outline">
                                    <Package className="mr-2 h-4 w-4" />
                                    Manage Products
                                </Button>
                            </Link>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
