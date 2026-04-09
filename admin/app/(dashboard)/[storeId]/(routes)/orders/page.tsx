import { format } from 'date-fns'
import prismadb from '@/lib/prismadb'
import { formatter } from '@/lib/utils'

import { OrderClient } from './components/client'
import { OrderColumn } from './components/columns'

const OrdersPage = async ({ 
    params
}: { 
    params: Promise<{ storeId: string }>
}) => {

    const { storeId } = await params;
    
    const orders = await prismadb.order.findMany({
        where: {
            storeId: storeId,
        },
        include: {
            orderItems: {
                include: {
                    product: {
                        include: {
                            color: true,
                            size: true
                        }
                    }
                }
            }
        },
        orderBy: {
            createdAt: 'desc'
        }
    })

    const formattedOrders: OrderColumn[] = orders.map(item => ({
        id: item.id,
        orderNumber: item.orderNumber,
    customerName: item.customerName || 'Guest',
    phone: item.phone || '',
    address: item.address || '',
    notes: item.notes || '-', 
    landmark: item.landmark || '-',
        email: item.email || '', // حل مشكلة الخطأ في النوع (Property email is missing)
        backupPhone: item.backupPhone || '', // حل مشكلة الخطأ في النوع (Property backupPhone is missing)
        
        // تجميع المنتجات المتشابهة وحساب الكمية الكلية (x2, x3...)
        products: item.orderItems.reduce((acc: any[], orderItem: any) => {
            const p = orderItem.product;
            const color = p.color?.name ? ` - ${p.color.name}` : '';
            const size = p.size?.value ? ` - ${p.size.value}` : '';
            const label = `${p.name}${color}${size}`;
            
            const existing = acc.find(i => i.label === label);
            if (existing) {
                existing.qty += orderItem.quantity || 1;
            } else {
                acc.push({ label, qty: orderItem.quantity || 1 });
            }
            return acc;
        }, []).map(p => `${p.label} (x${p.qty})`).join(' | '), 
        
        // حساب الإجمالي لكل الأيتمز اللي في الأوردر
        totalPrice: formatter.format(item.orderItems.reduce((total, orderItem: any) => {
            return total + (Number(orderItem.product.price) * (orderItem.quantity || 1));
        }, 0)),
        
        isPaid: item.isPaid,
        status: item.status || "PENDING",
        createdAt: format(item.createdAt, "MMMM do, yyyy"),
    }));

    return (
        <div className="flex-col">
            <div className="flex-1 p-8 pt-6 space-y-4">
                <OrderClient data={formattedOrders} />
            </div>
        </div>
    )
}

export default OrdersPage;