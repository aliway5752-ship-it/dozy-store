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
    try {
        const { storeId } = await params;
        
        if (!storeId) {
            console.error("[ADMIN_ORDERS] Store ID is missing");
            return (
                <div className="flex-col">
                    <div className="flex-1 p-8 pt-6">
                        <div className="bg-red-50 border border-red-200 p-4 rounded-lg">
                            <p className="text-red-600">Error: Store ID is required</p>
                        </div>
                    </div>
                </div>
            );
        }
        
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
                },
                addressRef: true,
            },
            orderBy: {
                createdAt: 'desc'
            }
        });

        // Defensive: Ensure orders is an array
        if (!Array.isArray(orders)) {
            console.error("[ADMIN_ORDERS] Orders is not an array:", orders);
            return (
                <div className="flex-col">
                    <div className="flex-1 p-8 pt-6">
                        <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
                            <p className="text-yellow-600">Unable to load orders. Invalid data format.</p>
                        </div>
                    </div>
                </div>
            );
        }

        let formattedOrders: OrderColumn[] = [];
        try {
            formattedOrders = orders.map(item => {
                // Defensive null checks for each field - orderNumber MUST be a number
                const safeOrderNumber = item?.orderNumber ? Number(item.orderNumber) : 0;
                const safeOrderCode = item?.orderCode ?? `#DZ-${safeOrderNumber || 'N/A'}`;
                const safeCustomerName = item?.customerName ?? 'Guest';
                const safePhone = item?.phone ?? "";
                const safeAddress = item?.address ?? "";
                const safeNotes = item?.notes ?? '-';
                const safeLandmark = item?.landmark ?? '-';
                const safeEmail = item?.email ?? '';
                const safeBackupPhone = item?.backupPhone ?? '';
                const safeStatus = item?.status ?? 'PENDING';
                const safeIsPaid = item?.isPaid ?? false;
                
                // Safe date formatting - only format if createdAt exists
                let safeCreatedAt = 'Unknown Date';
                try {
                    if (item?.createdAt && item.createdAt !== null) {
                        safeCreatedAt = format(new Date(item.createdAt), "MMMM do, yyyy");
                    }
                } catch (e) {
                    console.error("[ADMIN_ORDERS] Date formatting error:", e);
                    safeCreatedAt = 'Invalid Date';
                }

                // Safe order items processing
                const safeOrderItems = Array.isArray(item?.orderItems) ? item.orderItems : [];
                
                // Defensive product aggregation
                let safeProducts = '';
                try {
                    safeProducts = safeOrderItems.reduce((acc: any[], orderItem: any) => {
                        if (!orderItem?.product) return acc;
                        
                        const p = orderItem.product;
                        const color = p?.color?.name ? ` - ${p.color.name}` : '';
                        const size = p?.size?.value ? ` - ${p.size.value}` : '';
                        const productName = p?.name ?? 'Unknown Product';
                        const label = `${productName}${color}${size}`;
                        
                        const existing = acc.find((i: any) => i.label === label);
                        const qty = orderItem?.quantity ?? 1;
                        
                        if (existing) {
                            existing.qty += qty;
                        } else {
                            acc.push({ label, qty });
                        }
                        return acc;
                    }, []).map((p: any) => `${p.label} (x${p.qty})`).join(' | ');
                } catch (e) {
                    console.error("[ADMIN_ORDERS] Product aggregation error:", e);
                    safeProducts = 'Error loading products';
                }

                // Safe total price calculation
                let safeTotalPrice = '$0.00';
                try {
                    const total = safeOrderItems.reduce((sum: number, orderItem: any) => {
                        const price = Number(orderItem?.product?.price) || 0;
                        const qty = orderItem?.quantity ?? 1;
                        return sum + (price * qty);
                    }, 0);
                    safeTotalPrice = formatter.format(total);
                } catch (e) {
                    console.error("[ADMIN_ORDERS] Price calculation error:", e);
                    safeTotalPrice = '$0.00';
                }

                return {
                    id: item?.id ?? 'unknown',
                    orderNumber: safeOrderNumber,
                    orderCode: safeOrderCode,
                    customerName: safeCustomerName,
                    phone: safePhone,
                    address: safeAddress,
                    notes: safeNotes,
                    landmark: safeLandmark,
                    email: safeEmail,
                    backupPhone: safeBackupPhone,
                    products: safeProducts,
                    totalPrice: safeTotalPrice,
                    isPaid: safeIsPaid,
                    status: safeStatus,
                    createdAt: safeCreatedAt,
                };
            });
        } catch (e) {
            console.error("[ADMIN_ORDERS] Critical error formatting orders:", e);
            formattedOrders = [];
        }

        return (
            <div className="flex-col">
                <div className="flex-1 p-8 pt-6 space-y-4">
                    <OrderClient data={formattedOrders} />
                </div>
            </div>
        );
    } catch (error) {
        console.error("[ADMIN_ORDERS] Critical error loading orders:", error);
        return (
            <div className="flex-col">
                <div className="flex-1 p-8 pt-6">
                    <div className="bg-red-50 border border-red-200 p-4 rounded-lg">
                        <p className="text-red-600 font-bold">Error loading orders</p>
                        <p className="text-red-500 text-sm mt-1">Please refresh the page or contact support.</p>
                    </div>
                </div>
            </div>
        );
    }
}

export default OrdersPage;