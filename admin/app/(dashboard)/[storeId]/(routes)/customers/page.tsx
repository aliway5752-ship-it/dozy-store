import prismadb from '@/lib/prismadb'

import { CustomerClient } from './components/client'
import { CustomerColumn } from './components/columns'

const CustomersPage = async ({ 
    params
}: { 
    params: Promise<{ storeId: string }>
}) => {

    const { storeId } = await params;
    
    // Get users who have placed orders for this store
    const orders = await prismadb.order.findMany({
        where: {
            storeId: storeId,
            customerId: {
                not: null
            }
        },
        select: {
            customerId: true
        },
        distinct: ['customerId']
    });

    const customerIds = orders.map(order => order.customerId).filter((id): id is string => id !== null);

    // Get user details
    const users = await prismadb.user.findMany({
        where: {
            id: {
                in: customerIds
            }
        },
        orderBy: {
            createdAt: 'desc'
        }
    });

    const formattedCustomers: CustomerColumn[] = users.map(item => ({
        id: item.id,
        userId: item.id,
        name: item.firstName && item.lastName 
            ? `${item.firstName} ${item.lastName}`
            : item.email || 'Unknown',
        email: item.email || 'Unknown',
        phone: item.phone || 'Not provided',
        isBlocked: item.isBlocked || false,
        createdAt: item.createdAt.toISOString(),
    }));

    return (
        <div className="flex-col">
            <div className="flex-1 p-8 pt-6 space-y-4">
                <CustomerClient data={formattedCustomers} />
            </div>
        </div>
    )
}

export default CustomersPage;
