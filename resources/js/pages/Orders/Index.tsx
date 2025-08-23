import React, { useState, useEffect } from 'react';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { DatePicker } from '@/components/ui/date-picker';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Receipt,
  Search,
  Filter,
  Eye,
  Calendar,
  TrendingUp,
  ShoppingCart,
  DollarSign,
  MoreVertical,
  Download,
  RefreshCw,
  ExternalLink
} from 'lucide-react';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';

// Helper function to safely format currency
const formatCurrency = (value: any): string => {
  const num = typeof value === 'string' ? parseFloat(value) : value;
  return isNaN(num) ? '0.00' : num.toFixed(2);
};

// Helper function to format date
const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

// Helper function to get status badge variant
const getStatusVariant = (status: string) => {
  switch (status) {
    case 'completed':
      return 'default';
    case 'pending':
      return 'secondary';
    case 'cancelled':
      return 'destructive';
    case 'refunded':
      return 'outline';
    default:
      return 'secondary';
  }
};

interface Order {
  id: number;
  order_number: string;
  status: string;
  total_amount: number;
  discount_amount: number;
  payment_method: string;
  created_at: string;
  completed_at: string | null;
  user: {
    id: number;
    name: string;
  };
  customer: {
    id: number;
    name: string;
  } | null;
  items: Array<{
    id: number;
    product_name: string;
    quantity: number;
    unit_price: number;
    total_price: number;
    product: {
      id: number;
      name: string;
    };
  }>;
}

interface OrdersData {
  data: Order[];
  links: any;
  meta: any;
}

interface Stats {
  total_sales: number;
  total_orders: number;
  today_sales: number;
  today_orders: number;
}

interface PageProps extends Record<string, unknown> {
  orders: OrdersData;
  stats: Stats;
  filters: {
    status?: string;
    date_from?: string;
    date_to?: string;
    search?: string;
  };
}

const breadcrumbs: BreadcrumbItem[] = [
  {
    title: 'Sales',
    href: '/orders',
  },
];

export default function OrdersIndex() {
  const { orders, stats, filters } = usePage<PageProps>().props;
  const [searchQuery, setSearchQuery] = useState(filters.search || '');
  const [statusFilter, setStatusFilter] = useState(filters.status || 'all');
  const [dateFrom, setDateFrom] = useState<Date | undefined>(
    filters.date_from ? new Date(filters.date_from) : undefined
  );
  const [dateTo, setDateTo] = useState<Date | undefined>(
    filters.date_to ? new Date(filters.date_to) : undefined
  );
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  // Sync state with URL filters when they change
  useEffect(() => {
    setSearchQuery(filters.search || '');
    setStatusFilter(filters.status || 'all');
    setDateFrom(filters.date_from ? new Date(filters.date_from) : undefined);
    setDateTo(filters.date_to ? new Date(filters.date_to) : undefined);
  }, [filters]);

  const handleSearch = () => {
    const params: Record<string, any> = {};
    
    if (searchQuery.trim()) {
      params.search = searchQuery.trim();
    }
    
    if (statusFilter !== 'all' && statusFilter) {
      params.status = statusFilter;
    }
    
    if (dateFrom) {
      params.date_from = dateFrom.toISOString().split('T')[0];
    }
    
    if (dateTo) {
      params.date_to = dateTo.toISOString().split('T')[0];
    }

    router.get('/orders', params, {
      preserveState: true,
      replace: true,
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const handleStatusChange = (value: string) => {
    setStatusFilter(value);
    // Trigger search immediately when status changes
    setTimeout(() => {
      const params: Record<string, any> = {};
      
      if (searchQuery.trim()) {
        params.search = searchQuery.trim();
      }
      
      if (value !== 'all' && value) {
        params.status = value;
      }
      
      if (dateFrom) {
        params.date_from = dateFrom.toISOString().split('T')[0];
      }
      
      if (dateTo) {
        params.date_to = dateTo.toISOString().split('T')[0];
      }

      router.get('/orders', params, {
        preserveState: true,
        replace: true,
      });
    }, 0);
  };

  const handleDateFromChange = (date: Date | undefined) => {
    setDateFrom(date);
    // Trigger search immediately when date changes
    setTimeout(() => {
      const params: Record<string, any> = {};
      
      if (searchQuery.trim()) {
        params.search = searchQuery.trim();
      }
      
      if (statusFilter !== 'all' && statusFilter) {
        params.status = statusFilter;
      }
      
      if (date) {
        params.date_from = date.toISOString().split('T')[0];
      }
      
      if (dateTo) {
        params.date_to = dateTo.toISOString().split('T')[0];
      }

      router.get('/orders', params, {
        preserveState: true,
        replace: true,
      });
    }, 0);
  };

  const handleDateToChange = (date: Date | undefined) => {
    setDateTo(date);
    // Trigger search immediately when date changes
    setTimeout(() => {
      const params: Record<string, any> = {};
      
      if (searchQuery.trim()) {
        params.search = searchQuery.trim();
      }
      
      if (statusFilter !== 'all' && statusFilter) {
        params.status = statusFilter;
      }
      
      if (dateFrom) {
        params.date_from = dateFrom.toISOString().split('T')[0];
      }
      
      if (date) {
        params.date_to = date.toISOString().split('T')[0];
      }

      router.get('/orders', params, {
        preserveState: true,
        replace: true,
      });
    }, 0);
  };

  const handleReset = () => {
    setSearchQuery('');
    setStatusFilter('all');
    setDateFrom(undefined);
    setDateTo(undefined);
    router.get('/orders', {}, {
      preserveState: true,
      replace: true,
    });
  };

  // Check if any filters are active
  const hasActiveFilters = searchQuery.trim() !== '' || 
                          statusFilter !== 'all' || 
                          dateFrom !== undefined || 
                          dateTo !== undefined;

  const printReceipt = (order: Order) => {
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Receipt - ${order.order_number}</title>
            <style>
              body { font-family: monospace; max-width: 300px; margin: 0 auto; padding: 20px; }
              .header { text-align: center; border-bottom: 2px solid #000; padding-bottom: 10px; margin-bottom: 10px; }
              .row { display: flex; justify-content: space-between; margin: 5px 0; }
              .item { margin: 5px 0; }
              .total { font-weight: bold; border-top: 1px solid #000; padding-top: 10px; margin-top: 10px; }
              .center { text-align: center; }
            </style>
          </head>
          <body>
            <div class="header">
              <h2>RECEIPT</h2>
              <p>Order #${order.order_number}</p>
              <p>${formatDate(order.created_at)}</p>
            </div>
            ${order.items.map(item => `
              <div class="item">
                <div class="row">
                  <span>${item.product_name}</span>
                  <span>${item.quantity}x $${formatCurrency(item.unit_price)}</span>
                </div>
                <div class="row">
                  <span></span>
                  <span>$${formatCurrency(item.total_price)}</span>
                </div>
              </div>
            `).join('')}
            <div class="row">
              <span>Subtotal:</span>
              <span>$${formatCurrency(order.total_amount + order.discount_amount)}</span>
            </div>
            <div class="row">
              <span>Discount:</span>
              <span>-$${formatCurrency(order.discount_amount)}</span>
            </div>
            <div class="row total">
              <span>TOTAL:</span>
              <span>$${formatCurrency(order.total_amount)}</span>
            </div>
            <div class="row">
              <span>Payment:</span>
              <span>${order.payment_method.toUpperCase()}</span>
            </div>
            <div class="center" style="margin-top: 20px;">
              <p>Thank you for your business!</p>
            </div>
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
    }
  };

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Sales Management" />

      <div className="p-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Sales</p>
                  <p className="text-2xl font-bold">${formatCurrency(stats.total_sales)}</p>
                </div>
                <DollarSign className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Orders</p>
                  <p className="text-2xl font-bold">{stats.total_orders}</p>
                </div>
                <ShoppingCart className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Today's Sales</p>
                  <p className="text-2xl font-bold">${formatCurrency(stats.today_sales)}</p>
                </div>
                <TrendingUp className="h-8 w-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Today's Orders</p>
                  <p className="text-2xl font-bold">{stats.today_orders}</p>
                </div>
                <Calendar className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filters
              {hasActiveFilters && (
                <Badge variant="secondary" className="ml-2">
                  Active
                </Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search by order number, customer, or cashier..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="pl-10"
                />
              </div>

              <Select value={statusFilter} onValueChange={handleStatusChange}>
                <SelectTrigger>
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                  <SelectItem value="refunded">Refunded</SelectItem>
                </SelectContent>
              </Select>

              <DatePicker
                date={dateFrom}
                onDateChange={handleDateFromChange}
                placeholder="From date"
              />

              <DatePicker
                date={dateTo}
                onDateChange={handleDateToChange}
                placeholder="To date"
              />

              <div className="flex gap-2">
                <Button onClick={handleSearch} className="flex-1">
                  <Search className="h-4 w-4 mr-2" />
                  Search
                </Button>
                <Button variant="outline" onClick={handleReset}>
                  <RefreshCw className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Orders List */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Sales History</span>
              {hasActiveFilters && (
                <span className="text-sm text-muted-foreground">
                  Showing filtered results
                </span>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {orders.data.length === 0 ? (
                <div className="text-center py-8">
                  <ShoppingCart className="w-12 h-12 mx-auto mb-2 text-muted-foreground" />
                  <p className="text-muted-foreground">
                    {hasActiveFilters ? 'No sales found matching your filters' : 'No sales found'}
                  </p>
                  {hasActiveFilters && (
                    <Button variant="outline" onClick={handleReset} className="mt-2">
                      Clear filters
                    </Button>
                  )}
                </div>
              ) : (
                orders.data.map((order) => (
                  <Card key={order.id} className="border-l-4 border-l-blue-500">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-4">
                            <div>
                              <h3 className="font-semibold text-lg">{order.order_number}</h3>
                              <p className="text-sm text-muted-foreground">
                                {formatDate(order.created_at)} • Cashier: {order.user.name}
                              </p>
                            </div>
                            <Badge variant={getStatusVariant(order.status)} className="capitalize">
                              {order.status}
                            </Badge>
                          </div>
                          
                          <div className="mt-3 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                            <div>
                              <span className="text-muted-foreground">Items:</span>
                              <span className="ml-2 font-medium">{order.items.reduce((sum, item) => sum + item.quantity, 0)}</span>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Total:</span>
                              <span className="ml-2 font-bold text-green-600">${formatCurrency(order.total_amount)}</span>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Payment:</span>
                              <span className="ml-2 font-medium capitalize">{order.payment_method}</span>
                            </div>
                            {order.customer && (
                              <div>
                                <span className="text-muted-foreground">Customer:</span>
                                <span className="ml-2 font-medium">{order.customer.name}</span>
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button variant="outline" size="sm" onClick={() => setSelectedOrder(order)}>
                                <Eye className="h-4 w-4 mr-2" />
                                View Details
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
                              <DialogHeader>
                                <DialogTitle>Order Details - {order.order_number}</DialogTitle>
                                <DialogDescription>
                                  Complete details for this sale transaction
                                </DialogDescription>
                              </DialogHeader>
                              
                              {selectedOrder && (
                                <div className="space-y-6">
                                  {/* Order Info */}
                                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    <div>
                                      <p className="text-sm font-medium text-muted-foreground">Status</p>
                                      <Badge variant={getStatusVariant(selectedOrder.status)} className="capitalize">
                                        {selectedOrder.status}
                                      </Badge>
                                    </div>
                                    <div>
                                      <p className="text-sm font-medium text-muted-foreground">Date</p>
                                      <p className="text-sm">{formatDate(selectedOrder.created_at)}</p>
                                    </div>
                                    <div>
                                      <p className="text-sm font-medium text-muted-foreground">Cashier</p>
                                      <p className="text-sm">{selectedOrder.user.name}</p>
                                    </div>
                                    <div>
                                      <p className="text-sm font-medium text-muted-foreground">Payment Method</p>
                                      <p className="text-sm capitalize">{selectedOrder.payment_method}</p>
                                    </div>
                                  </div>

                                  <Separator />

                                  {/* Items */}
                                  <div>
                                    <h4 className="font-semibold mb-4">Items Purchased</h4>
                                    <div className="space-y-2">
                                      {selectedOrder.items.map((item) => (
                                        <div key={item.id} className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                                          <div>
                                            <p className="font-medium">{item.product_name}</p>
                                            <p className="text-sm text-muted-foreground">
                                              {item.quantity} × ${formatCurrency(item.unit_price)}
                                            </p>
                                          </div>
                                          <p className="font-semibold">${formatCurrency(item.total_price)}</p>
                                        </div>
                                      ))}
                                    </div>
                                  </div>

                                  <Separator />

                                  {/* Totals */}
                                  <div className="bg-muted/30 p-4 rounded-lg">
                                    <div className="space-y-2">
                                      <div className="flex justify-between">
                                        <span>Subtotal:</span>
                                        <span>${formatCurrency(selectedOrder.total_amount + selectedOrder.discount_amount)}</span>
                                      </div>
                                      {selectedOrder.discount_amount > 0 && (
                                        <div className="flex justify-between text-red-600">
                                          <span>Discount:</span>
                                          <span>-${formatCurrency(selectedOrder.discount_amount)}</span>
                                        </div>
                                      )}
                                      <Separator />
                                      <div className="flex justify-between text-lg font-bold">
                                        <span>Total:</span>
                                        <span>${formatCurrency(selectedOrder.total_amount)}</span>
                                      </div>
                                    </div>
                                  </div>

                                  {/* Actions */}
                                  <div className="flex gap-2 pt-4">
                                    <Button onClick={() => printReceipt(selectedOrder)} variant="outline">
                                      <Receipt className="h-4 w-4 mr-2" />
                                      Print Receipt
                                    </Button>
                                    <Link href={`/orders/${selectedOrder.id}`}>
                                      <Button variant="outline">
                                        <Eye className="h-4 w-4 mr-2" />
                                        Full Details
                                      </Button>
                                    </Link>
                                  </div>
                                </div>
                              )}
                            </DialogContent>
                          </Dialog>

                          <Link href={`/orders/${order.id}`}>
                            <Button variant="ghost" size="sm">
                              <ExternalLink className="h-4 w-4 mr-2" />
                              Full Details
                            </Button>
                          </Link>

                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => printReceipt(order)}>
                                <Receipt className="h-4 w-4 mr-2" />
                                Print Receipt
                              </DropdownMenuItem>
                              <Link href={`/orders/${order.id}`}>
                                <DropdownMenuItem>
                                  <Eye className="h-4 w-4 mr-2" />
                                  View Full Details
                                </DropdownMenuItem>
                              </Link>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>

            {/* Pagination */}
            {orders.links && (
              <div className="mt-6 flex justify-center">
                <div className="flex gap-1">
                  {orders.links.map((link: any, index: number) => (
                    <Button
                      key={index}
                      variant={link.active ? "default" : "outline"}
                      size="sm"
                      disabled={!link.url}
                      onClick={() => link.url && router.visit(link.url)}
                      dangerouslySetInnerHTML={{ __html: link.label }}
                    />
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
