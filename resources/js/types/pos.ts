// POS System Types
export interface CartItem {
    id: number
    name: string
    price: number
    quantity: number
    total: number
    sku: string
    stock_quantity: number
    category: {
        id: number
        name: string
        color: string
    }
}

export interface Customer {
    id?: number
    name: string
    email?: string
    phone?: string
}

export interface Product {
    id: number
    name: string
    price: number
    category_id?: number
    category?: Category
    stock_quantity: number
    track_stock?: boolean
    sku?: string
}

export interface Category {
    id: number
    name: string
    icon?: string
    color?: string
}

export interface Order {
    id?: number
    customer_id?: number
    customer?: Customer
    total_amount: number
    payment_method: PaymentMethod
    items: OrderItem[]
    created_at?: string
    status?: string
}

export interface OrderItem {
    id?: number
    order_id?: number
    product_id: number
    product?: Product
    quantity: number
    price: number
}

export type PaymentMethod = 'cash' | 'card' | 'digital'

export interface POSProps {
    products: Product[]
    categories: Category[]
    customers?: Customer[]
}

export interface CartDisplayProps {
    cartItems: CartItem[]
    onUpdateQuantity: (id: number, quantity: number) => void
    onRemoveItem: (id: number) => void
    onClearCart: () => void
    total: number
}

export interface CheckoutSectionProps {
    cartItems: CartItem[]
    customers: Customer[]
    onCheckout: (customer: Customer, paymentMethod: PaymentMethod) => void
    total: number
}

export interface ProductGridProps {
    products: Product[]
    onAddToCart: (product: Product) => void
}

export interface CategoryFilterProps {
    categories: Category[]
    selectedCategory: number | null
    onCategoryChange: (categoryId: number | null) => void
}

export interface PaymentSectionProps {
    total: number
    onPaymentMethodChange: (method: PaymentMethod) => void
    selectedPaymentMethod: PaymentMethod
}

export interface SaleCompletionModalProps {
    isOpen: boolean
    onClose: () => void
    order: Order
    onPrintReceipt?: () => void
}
