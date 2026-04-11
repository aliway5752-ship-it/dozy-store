"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@clerk/nextjs";
import Container from "@/components/ui/container";
import OrderStatusStepper from "@/components/order-status-stepper";
import { Skeleton } from "@/components/ui/skeleton";
import { API_URL } from "@/lib/config";
import Link from "next/link";

interface Order {
  id: string;
  orderCode: string;
  orderNumber: number;
  status: string;
  createdAt: string;
  totalAmount: number;
  shippingPrice: number;
  orderItems: {
    id: string;
    product: {
      id: string;
      name: string;
      price: number;
    };
    quantity: number;
  }[];
}

// Helper function to aggregate items by product
const aggregateOrderItems = (items: Order['orderItems']) => {
  const aggregated = new Map<string, {
    product: Order['orderItems'][0]['product'];
    quantity: number;
    subtotal: number;
  }>();

  items.forEach((item) => {
    const productId = item.product.id;
    if (aggregated.has(productId)) {
      const existing = aggregated.get(productId)!;
      existing.quantity += item.quantity;
      existing.subtotal = existing.quantity * Number(item.product.price);
    } else {
      aggregated.set(productId, {
        product: item.product,
        quantity: item.quantity,
        subtotal: item.quantity * Number(item.product.price),
      });
    }
  });

  return Array.from(aggregated.values());
};

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
        <div className="flex items-center justify-center min-h-[calc(100vh-200px)]">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-white mb-8 uppercase tracking-wider">
              My Orders
            </h1>

            {orders.length === 0 ? (
              <div className="bg-luxury-emerald/30 backdrop-blur-3xl rounded-3xl p-8 shadow-2xl border border-luxury-gold/10">
                <p className="text-white text-center mb-6">No orders yet</p>
                <Link
                  href="/"
                  className="inline-block bg-luxury-gold text-black px-6 py-3 rounded-full font-medium hover:bg-luxury-gold/90 transition-colors"
                >
                  Continue Shopping
                </Link>
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
                        <div className="flex items-center gap-3">
                          <h2 className="text-3xl font-black text-luxury-gold tracking-tight">
                            {order.orderCode}
                          </h2>
                          <span className="px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-luxury-gold/20 text-luxury-gold border border-luxury-gold/30">
                            {order.status}
                          </span>
                        </div>
                        <p className="text-white/60 text-sm mt-1">
                          {new Date(order.createdAt).toLocaleDateString('en-GB', {
                            timeZone: 'Africa/Cairo',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </p>
                      </div>
                      <OrderStatusStepper status={order.status} />
                    </div>

                    <div className="border-t border-luxury-gold/20 pt-4 mt-4">
                      <h3 className="text-lg font-bold text-white mb-3">Items</h3>
                      <div className="space-y-3">
                        {aggregateOrderItems(order.orderItems).map((item, index) => (
                          <div key={index} className="flex justify-between items-center text-white py-2 border-b border-white/5 last:border-0">
                            <div className="flex items-center gap-3">
                              <span className="font-medium">{item.product.name}</span>
                              <span className="text-luxury-gold font-black text-sm px-2 py-0.5 bg-luxury-gold/10 rounded-full">
                                x{item.quantity}
                              </span>
                            </div>
                            <span className="font-bold text-luxury-gold">
                              ${item.subtotal.toFixed(2)}
                            </span>
                          </div>
                        ))}
                      </div>

                      {/* Order Total */}
                      <div className="mt-4 pt-4 border-t border-luxury-gold/30">
                        <div className="flex justify-between items-center">
                          <span className="text-white/60">Shipping</span>
                          <span className="text-white font-medium">
                            ${(order.shippingPrice || 0).toFixed(2)}
                          </span>
                        </div>
                        <div className="flex justify-between items-center mt-2 pt-2 border-t border-white/10">
                          <span className="text-xl font-bold text-white">Order Total</span>
                          <span className="text-2xl font-black text-luxury-gold">
                            ${((order.totalAmount || 0) + (order.shippingPrice || 0)).toFixed(2)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </Container>
    </div>
  );
};

export default MyOrdersPage;
