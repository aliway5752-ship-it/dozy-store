"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@clerk/nextjs";
import Container from "@/components/ui/container";
import OrderStatusStepper from "@/components/order-status-stepper";
import { Skeleton } from "@/components/ui/skeleton";
import { API_URL } from "@/lib/config";

interface Order {
  id: string;
  orderCode: string;
  orderNumber: number;
  status: string;
  createdAt: string;
  totalAmount: number;
  orderItems: {
    product: {
      name: string;
      price: number;
    };
    quantity: number;
  }[];
}

const MyOrdersPage = () => {
  const { userId } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) return;

    const fetchOrders = async () => {
      try {
        const res = await fetch(`${API_URL}/orders?customerId=${userId}`, {
          cache: 'no-store',
          headers: {
            'Content-Type': 'application/json',
          }
        });
        const data = await res.json();
        setOrders(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error('Error fetching orders:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [userId]);

  if (!userId) {
    return (
      <div className="flex items-center justify-center min-h-screen luxury-emerald">
        <div className="text-white text-2xl font-bold">Please log in to view your orders</div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex flex-col luxury-emerald min-h-screen">
        <Container>
          <div className="py-12 space-y-6">
            <Skeleton className="h-12 w-48" />
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-48 w-full rounded-3xl" />
            ))}
          </div>
        </Container>
      </div>
    );
  }

  return (
    <div className="flex flex-col luxury-emerald min-h-screen">
      <Container>
        <div className="py-12">
          <h1 className="text-4xl font-bold text-white mb-8 uppercase tracking-wider">
            My Orders
          </h1>

          {orders.length === 0 ? (
            <div className="bg-luxury-emerald/30 backdrop-blur-3xl rounded-3xl p-8 shadow-2xl border border-luxury-gold/10">
              <p className="text-white text-center">No orders yet</p>
            </div>
          ) : (
            <div className="space-y-6">
              {orders.map((order) => (
                <div
                  key={order.id}
                  className="bg-luxury-emerald/30 backdrop-blur-3xl rounded-3xl p-6 shadow-2xl border border-luxury-gold/10"
                >
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4">
                    <div>
                      <h2 className="text-2xl font-bold text-white">{order.orderCode}</h2>
                      <p className="text-luxury-gold text-sm">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <OrderStatusStepper status={order.status} />
                  </div>

                  <div className="border-t border-luxury-gold/20 pt-4 mt-4">
                    <h3 className="text-lg font-bold text-white mb-3">Items</h3>
                    <div className="space-y-2">
                      {order.orderItems.map((item, index) => (
                        <div key={index} className="flex justify-between text-white">
                          <span>{item.product.name} x {item.quantity}</span>
                          <span>${(Number(item.product.price) * item.quantity).toFixed(2)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </Container>
    </div>
  );
};

export default MyOrdersPage;
