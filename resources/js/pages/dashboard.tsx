import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, usePage } from '@inertiajs/react';
import { 
    ShoppingCart, 
    Package, 
    Users, 
    BarChart3, 
    DollarSign, 
    TrendingUp, 
    Calendar,
    AlertTriangle,
    Trophy,
    Activity
} from 'lucide-react';

// Helper function to safely format numbers
const formatCurrency = (value: any): string => {
    const num = typeof value === 'string' ? parseFloat(value) : value;
    return isNaN(num) ? '0.00' : num.toFixed(2);
};

const formatNumber = (value: any, decimals: number = 1): string => {
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
}

interface CategorySales {
    category: string;
    color: string;
    total_sales: number;
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

function SimpleBarChart({ data, title }: { data: DailySales[], title: string }) {
    const maxValue = Math.max(...data.map(d => d.total));
    
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
                            <Progress 
                                value={(item.total / maxValue) * 100} 
                                className="h-2"
                            />
                            <div className="text-xs text-muted-foreground">
                                {item.orders} orders
                            </div>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}

function PieChart({ data, title }: { data: CategorySales[], title: string }) {
    const total = data.reduce((sum, item) => sum + item.total_sales, 0);
    
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
                        const percentage = ((item.total_sales / total) * 100);
                        return (
                            <div key={index} className="space-y-1">
                                <div className="flex justify-between text-sm">
                                    <span className="flex items-center gap-2">
                                        <div 
                                            className="w-3 h-3 rounded-full" 
                                            style={{ backgroundColor: item.color }}
                                        />
                                        {item.category}
                                    </span>
                                    <span className="font-medium">${formatCurrency(item.total_sales)}</span>
                                </div>
                                <Progress 
                                    value={percentage} 
                                    className="h-2"
                                    style={{ 
                                        ['--progress-background' as any]: item.color 
                                    }}
                                />
                                <div className="text-xs text-muted-foreground">
                                    {formatNumber(percentage)}% of total sales
                                </div>
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
            <div className="flex h-full flex-1 flex-col gap-6 rounded-xl p-4 overflow-x-auto">
                {/* Statistics Cards */}
                <div className="grid auto-rows-min gap-4 md:grid-cols-2 lg:grid-cols-4">
                    {/* Today's Sales */}
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Today's Sales</CardTitle>
                            <DollarSign className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-green-600">
                                ${formatCurrency(statistics.todaySales)}
                            </div>
                            <p className="text-xs text-muted-foreground">
                                Revenue generated today
                            </p>
                        </CardContent>
                    </Card>

                    {/* Weekly Sales */}
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">This Week</CardTitle>
                            <TrendingUp className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-blue-600">
                                ${formatCurrency(statistics.weekSales)}
                            </div>
                            <p className="text-xs text-muted-foreground">
                                Week to date sales
                            </p>
                        </CardContent>
                    </Card>

                    {/* Monthly Sales */}
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">This Month</CardTitle>
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-purple-600">
                                ${formatCurrency(statistics.monthSales)}
                            </div>
                            <p className="text-xs text-muted-foreground">
                                Month to date sales
                            </p>
                        </CardContent>
                    </Card>

                    {/* Total Orders */}
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
                            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-orange-600">
                                {statistics.totalOrders}
                            </div>
                            <p className="text-xs text-muted-foreground">
                                Completed orders
                            </p>
                        </CardContent>
                    </Card>
                </div>

                {/* Charts and Analytics */}
                <div className="grid gap-6 md:grid-cols-2">
                    {/* Daily Sales Chart */}
                    {dailySales.length > 0 && (
                        <SimpleBarChart 
                            data={dailySales} 
                            title="Daily Sales (Last 7 Days)" 
                        />
                    )}

                    {/* Sales by Category */}
                    {salesByCategory.length > 0 && (
                        <PieChart 
                            data={salesByCategory} 
                            title="Sales by Category (Last 30 Days)" 
                        />
                    )}
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
                                {topProducts.length > 0 ? topProducts.map((product, index) => (
                                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                                        <div>
                                            <p className="font-medium">{product.name}</p>
                                            <p className="text-sm text-muted-foreground">
                                                {product.total_sold} units sold
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-bold text-green-600">
                                                ${formatCurrency(product.revenue)}
                                            </p>
                                            <Badge variant="secondary">{index + 1}</Badge>
                                        </div>
                                    </div>
                                )) : (
                                    <p className="text-muted-foreground text-center py-4">
                                        No sales data available yet
                                    </p>
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
                                {lowStockProducts.length > 0 ? lowStockProducts.map((product) => (
                                    <div key={product.id} className="flex items-center justify-between p-3 border rounded-lg border-red-200">
                                        <div>
                                            <p className="font-medium">{product.name}</p>
                                            <p className="text-sm text-muted-foreground">
                                                {product.category.name}
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <Badge variant="destructive">
                                                {product.stock_quantity} left
                                            </Badge>
                                            <p className="text-xs text-muted-foreground mt-1">
                                                Min: {product.min_stock_level}
                                            </p>
                                        </div>
                                    </div>
                                )) : (
                                    <p className="text-muted-foreground text-center py-4">
                                        All products are well stocked! 👍
                                    </p>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Quick Actions */}
                <div className="grid auto-rows-min gap-4 md:grid-cols-2 lg:grid-cols-4">
                    {/* POS System Card */}
                    <Card className="cursor-pointer hover:shadow-lg transition-shadow">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">POS System</CardTitle>
                            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-green-600">Start Selling</div>
                            <p className="text-xs text-muted-foreground">
                                Process sales and manage transactions
                            </p>
                            <Link href="/pos">
                                <Button className="w-full mt-3" size="sm">
                                    Open POS
                                </Button>
                            </Link>
                        </CardContent>
                    </Card>

                    {/* Products Card */}
                    <Card className="cursor-pointer hover:shadow-lg transition-shadow">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Products</CardTitle>
                            <Package className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">Manage</div>
                            <p className="text-xs text-muted-foreground">
                                Add, edit, and organize products
                            </p>
                            <Link href="/products">
                                <Button variant="outline" className="w-full mt-3" size="sm">
                                    View Products
                                </Button>
                            </Link>
                        </CardContent>
                    </Card>

                    {/* Customers Card */}
                    <Card className="cursor-pointer hover:shadow-lg transition-shadow">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Customers</CardTitle>
                            <Users className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">Coming Soon</div>
                            <p className="text-xs text-muted-foreground">
                                Manage customer information
                            </p>
                            <Button variant="outline" className="w-full mt-3" size="sm" disabled>
                                View Customers
                            </Button>
                        </CardContent>
                    </Card>

                    {/* Reports Card */}
                    <Card className="cursor-pointer hover:shadow-lg transition-shadow">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Reports</CardTitle>
                            <BarChart3 className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">Analytics</div>
                            <p className="text-xs text-muted-foreground">
                                Sales reports and insights
                            </p>
                            <Link href="/orders">
                                <Button variant="outline" className="w-full mt-3" size="sm">
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
                            Your Point of Sale system is ready to use! Start by accessing the POS interface to begin processing sales, 
                            or manage your products and inventory from the navigation above.
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
