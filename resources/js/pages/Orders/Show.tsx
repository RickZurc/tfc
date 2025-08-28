import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, usePage } from '@inertiajs/react';
import { ArrowLeft, Calendar, CreditCard, Package, Receipt, User } from 'lucide-react';

// Helper function to safely format currency
const formatCurrency = (value: string | number | null | undefined): string => {
    const num = typeof value === 'string' ? parseFloat(value) : value;
    return isNaN(num as number) || num === null || num === undefined ? '0.00' : (num as number).toFixed(2);
};

// Helper function to format date
const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
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
    subtotal: number;
    tax_amount: number;
    discount_amount: number;
    total_amount: number;
    payment_method: string;
    amount_paid: number;
    change_amount: number;
    notes: string | null;
    created_at: string;
    completed_at: string | null;
    user: {
        id: number;
        name: string;
        email: string;
    };
    customer: {
        id: number;
        name: string;
        email: string;
        phone: string;
    } | null;
    items: Array<{
        id: number;
        product_name: string;
        product_sku: string;
        quantity: number;
        unit_price: number;
        total_price: number;
        tax_rate: number;
        tax_amount: number;
        product: {
            id: number;
            name: string;
            category: {
                id: number;
                name: string;
                color: string;
            };
        };
    }>;
}

interface PageProps extends Record<string, unknown> {
    order: Order;
}

export default function OrderShow() {
    const { order } = usePage<PageProps>().props;

    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'Sales',
            href: '/orders',
        },
        {
            title: order.order_number,
            href: `/orders/${order.id}`,
        },
    ];

    const printReceipt = () => {
        const printWindow = window.open('', '_blank');
        if (printWindow) {
            printWindow.document.write(`
        <html>
          <head>
            <title>Receipt - ${order.order_number}</title>
            <style>
              body { font-family: monospace; max-width: 400px; margin: 0 auto; padding: 20px; }
              .header { text-align: center; border-bottom: 2px solid #000; padding-bottom: 10px; margin-bottom: 15px; }
              .row { display: flex; justify-content: space-between; margin: 5px 0; }
              .item { margin: 8px 0; }
              .item-name { font-weight: bold; }
              .total { font-weight: bold; border-top: 1px solid #000; padding-top: 10px; margin-top: 15px; }
              .center { text-align: center; }
              .section { margin: 15px 0; }
            </style>
          </head>
          <body>
            <div class="header">
              <h2>SALES RECEIPT</h2>
              <p>Order #${order.order_number}</p>
              <p>${formatDate(order.created_at)}</p>
              <p>Cashier: ${order.user.name}</p>
            </div>
            
            <div class="section">
              <h3>Items:</h3>
              ${order.items
                  .map(
                      (item) => `
                <div class="item">
                  <div class="item-name">${item.product_name}</div>
                  <div class="row">
                    <span>SKU: ${item.product_sku}</span>
                    <span>${item.quantity}x $${formatCurrency(item.unit_price)}</span>
                  </div>
                  <div class="row">
                    <span></span>
                    <span>$${formatCurrency(item.total_price)}</span>
                  </div>
                </div>
              `,
                  )
                  .join('')}
            </div>
            
            <div class="section">
              <div class="row">
                <span>Subtotal:</span>
                <span>$${formatCurrency(order.subtotal)}</span>
              </div>
              ${
                  order.tax_amount > 0
                      ? `
              <div class="row">
                <span>Tax:</span>
                <span>$${formatCurrency(order.tax_amount)}</span>
              </div>
              `
                      : ''
              }
              ${
                  order.discount_amount > 0
                      ? `
              <div class="row">
                <span>Discount:</span>
                <span>-$${formatCurrency(order.discount_amount)}</span>
              </div>
              `
                      : ''
              }
              <div class="row total">
                <span>TOTAL:</span>
                <span>$${formatCurrency(order.total_amount)}</span>
              </div>
              <div class="row">
                <span>Amount Paid:</span>
                <span>$${formatCurrency(order.amount_paid)}</span>
              </div>
              ${
                  order.change_amount > 0
                      ? `
              <div class="row">
                <span>Change:</span>
                <span>$${formatCurrency(order.change_amount)}</span>
              </div>
              `
                      : ''
              }
              <div class="row">
                <span>Payment Method:</span>
                <span>${order.payment_method.toUpperCase()}</span>
              </div>
            </div>
            
            ${
                order.customer
                    ? `
            <div class="section">
              <h3>Customer:</h3>
              <p>${order.customer.name}</p>
              ${order.customer.email ? `<p>${order.customer.email}</p>` : ''}
              ${order.customer.phone ? `<p>${order.customer.phone}</p>` : ''}
            </div>
            `
                    : ''
            }
            
            <div class="center" style="margin-top: 30px;">
              <p>Thank you for your business!</p>
              <p>Come again soon!</p>
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
            <Head title={`Order ${order.order_number}`} />

            <div className="p-6">
                {/* Header */}
                <div className="mb-6 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link href="/orders">
                            <Button variant="outline" size="sm">
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                Back to Sales
                            </Button>
                        </Link>
                        <div>
                            <h1 className="text-3xl font-bold">Order {order.order_number}</h1>
                            <p className="text-muted-foreground">Created on {formatDate(order.created_at)}</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <Badge variant={getStatusVariant(order.status)} className="px-3 py-1 text-sm capitalize">
                            {order.status}
                        </Badge>
                        <Button onClick={printReceipt} variant="outline">
                            <Receipt className="mr-2 h-4 w-4" />
                            Print Receipt
                        </Button>
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                    {/* Order Details */}
                    <div className="space-y-6 lg:col-span-2">
                        {/* Items */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Package className="h-5 w-5" />
                                    Items Purchased ({order.items.length})
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {order.items.map((item) => (
                                        <div key={item.id} className="flex items-center justify-between rounded-lg border p-4">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-3">
                                                    <div className="h-3 w-3 rounded-full" style={{ backgroundColor: item.product.category.color }} />
                                                    <div>
                                                        <h4 className="font-semibold">{item.product_name}</h4>
                                                        <p className="text-sm text-muted-foreground">
                                                            SKU: {item.product_sku} • Category: {item.product.category.name}
                                                        </p>
                                                        <p className="text-sm text-muted-foreground">
                                                            ${formatCurrency(item.unit_price)} each
                                                            {item.tax_rate > 0 && ` • Tax: ${item.tax_rate}%`}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-sm text-muted-foreground">Qty: {item.quantity}</p>
                                                <p className="text-lg font-semibold">${formatCurrency(item.total_price)}</p>
                                                {item.tax_amount > 0 && (
                                                    <p className="text-xs text-muted-foreground">Tax: ${formatCurrency(item.tax_amount)}</p>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Order Notes */}
                        {order.notes && (
                            <Card>
                                <CardHeader>
                                    <CardTitle>Order Notes</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-sm">{order.notes}</p>
                                </CardContent>
                            </Card>
                        )}
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* Order Summary */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Order Summary</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <div className="flex justify-between">
                                        <span>Subtotal:</span>
                                        <span>${formatCurrency(order.subtotal)}</span>
                                    </div>
                                    {order.tax_amount > 0 && (
                                        <div className="flex justify-between">
                                            <span>Tax:</span>
                                            <span>${formatCurrency(order.tax_amount)}</span>
                                        </div>
                                    )}
                                    {order.discount_amount > 0 && (
                                        <div className="flex justify-between text-red-600">
                                            <span>Discount:</span>
                                            <span>-${formatCurrency(order.discount_amount)}</span>
                                        </div>
                                    )}
                                    <Separator />
                                    <div className="flex justify-between text-lg font-bold">
                                        <span>Total:</span>
                                        <span>${formatCurrency(order.total_amount)}</span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Payment Information */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <CreditCard className="h-5 w-5" />
                                    Payment Details
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div className="flex justify-between">
                                    <span>Method:</span>
                                    <span className="font-medium capitalize">{order.payment_method}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Amount Paid:</span>
                                    <span className="font-medium">${formatCurrency(order.amount_paid)}</span>
                                </div>
                                {order.change_amount > 0 && (
                                    <div className="flex justify-between text-green-600">
                                        <span>Change Given:</span>
                                        <span className="font-medium">${formatCurrency(order.change_amount)}</span>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Staff Information */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <User className="h-5 w-5" />
                                    Staff Information
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div>
                                    <p className="text-sm font-medium">Cashier</p>
                                    <p className="text-sm text-muted-foreground">{order.user.name}</p>
                                    <p className="text-sm text-muted-foreground">{order.user.email}</p>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Customer Information */}
                        {order.customer && (
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <User className="h-5 w-5" />
                                        Customer Information
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    <div>
                                        <p className="text-sm font-medium">{order.customer.name}</p>
                                        {order.customer.email && <p className="text-sm text-muted-foreground">{order.customer.email}</p>}
                                        {order.customer.phone && <p className="text-sm text-muted-foreground">{order.customer.phone}</p>}
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {/* Timeline */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Calendar className="h-5 w-5" />
                                    Timeline
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div className="flex items-center gap-3">
                                    <div className="h-2 w-2 rounded-full bg-blue-500" />
                                    <div>
                                        <p className="text-sm font-medium">Order Created</p>
                                        <p className="text-xs text-muted-foreground">{formatDate(order.created_at)}</p>
                                    </div>
                                </div>
                                {order.completed_at && (
                                    <div className="flex items-center gap-3">
                                        <div className="h-2 w-2 rounded-full bg-green-500" />
                                        <div>
                                            <p className="text-sm font-medium">Order Completed</p>
                                            <p className="text-xs text-muted-foreground">{formatDate(order.completed_at)}</p>
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
