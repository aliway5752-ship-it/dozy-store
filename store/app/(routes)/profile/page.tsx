import Container from "@/components/ui/container";
import { auth, currentUser } from "@clerk/nextjs/server";
import Link from "next/link";
import { SignOutButton } from "./components/sign-out-button";
import OrderTimeline from "@/components/order-timeline";
import UserProfile from "@/components/UserProfile/UserProfile";
import Currency from "@/components/ui/currency";

export const revalidate = 0;

const ProfilePage = async () => {
    let userId: string | null = null;
    let user: any = null;

    try {
        const authData = await auth();
        userId = authData.userId;
        user = await currentUser();
    } catch (error) {
        console.error("[PROFILE_PAGE] Error fetching user data:", error);
    }

    // If auth fails, show fallback UI instead of crashing
    if (!userId || !user) {
        return (
            <div className="luxury-emerald min-h-screen flex items-center justify-center pt-10">
                <Container>
                    <div className="text-center py-20 px-4 max-w-md mx-auto">
                        <div className="bg-white/5 backdrop-blur-xl p-8 rounded-3xl border border-white/10 shadow-2xl">
                            <h1 className="text-2xl font-bold text-white tracking-widest uppercase mb-4">Session Error</h1>
                            <p className="text-white/60 mb-8">We&apos;re having trouble accessing your profile. Please sign out and sign back in.</p>
                            <Link
                                href="/"
                                className="inline-block bg-luxury-gold text-black px-6 py-3 rounded-full font-bold hover:bg-luxury-gold/90 transition-colors"
                            >
                                Go Home
                            </Link>
                        </div>
                    </div>
                </Container>
            </div>
        );
    }

    // Fetch order history
    let orders: any[] = [];
    try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/orders?customerId=${userId}`, { cache: 'no-store' });
        if (res.ok) {
            orders = await res.json();
        } else {
            console.error("[PROFILE_PAGE] Failed to fetch orders:", res.status);
        }
    } catch (error) {
        console.error("[PROFILE_PAGE] Error fetching orders:", error);
        orders = [];
    }

    return (
        <div className="luxury-emerald min-h-screen pt-10">
            <Container>
                <div className="py-20 px-4 max-w-7xl mx-auto">
                    <div className="mb-12 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 bg-white/5 backdrop-blur-xl p-8 rounded-3xl border border-white/10 shadow-2xl">
                        <div>
                            <h1 className="text-4xl font-bold text-white tracking-widest uppercase">My Profile</h1>
                            <p className="text-luxury-gold mt-2 font-medium">
                                Welcome back, <span className="text-white">{user.firstName || user.primaryEmailAddress?.emailAddress}</span>
                            </p>
                        </div>
                        <SignOutButton />
                    </div>

                    <div className="mb-16">
                        <UserProfile />
                    </div>

                    <div className="space-y-10">
                        <h2 className="text-2xl font-bold text-white uppercase tracking-[0.3em] flex items-center gap-x-4">
                            Order History
                            <div className="h-[1px] flex-1 bg-white/10" />
                        </h2>
                        
                        {orders.length === 0 ? (
                            <div className="bg-white/5 backdrop-blur-md p-10 rounded-3xl border border-white/10 text-center">
                                <p className="text-white/60 text-lg italic tracking-wide">You haven&apos;t placed any orders yet.</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 gap-12">
                                {orders.map((order: any) => (
                                    <div key={order.id} className="luxury-card rounded-[40px] p-8 sm:p-12 relative overflow-hidden group">
                                        {/* الديكور الخلفي للهوية */}
                                        <div className="absolute top-0 right-0 w-64 h-64 bg-luxury-gold/5 blur-[100px] pointer-events-none" />
                                        
                                        <div className="flex flex-col lg:flex-row justify-between gap-12 relative z-10">
                                            <div className="space-y-6 flex-1">
                                                <div className="flex flex-wrap items-center gap-4">
                                                    <p className="text-2xl font-bold text-white tracking-tighter">Order #{order.orderNumber}</p>
                                                    <span className="px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] bg-luxury-emerald/40 text-white border border-luxury-emerald">
                                                        {order.status}
                                                    </span>
                                                </div>
                                                <p className="text-white/40 text-sm font-medium uppercase tracking-widest">
                                                    Placed on {new Date(order.createdAt).toLocaleDateString(undefined, { dateStyle: 'long' })}
                                                </p>
                                                
                                                <div className="pt-4 border-t border-white/5">
                                                    <p className="text-white/90 text-sm mb-4 font-bold uppercase tracking-widest opacity-60">Order Items</p>
                                                    <div className="flex flex-wrap gap-3">
                                                        {order.orderItems.map((item: any) => (
                                                            <div key={item.id} className="bg-white/5 border border-white/10 px-4 py-2 rounded-2xl flex items-center gap-x-3">
                                                                <span className="text-white text-sm font-medium">{item.product.name}</span>
                                                                <span className="text-luxury-gold text-xs font-bold">x1</span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="lg:w-1/3 flex flex-col justify-between items-end gap-8 pt-4 lg:pt-0">
                                                <div className="text-right space-y-2">
                                                    <p className="text-white/40 text-xs font-bold uppercase tracking-widest">Total Investment</p>
                                                    <div className="text-3xl font-bold text-luxury-gold tracking-tighter">
                                                        <Currency value={order.totalPrice + (order.shippingPrice || 0)} />
                                                    </div>
                                                    <p className="text-white/20 text-[10px] font-bold uppercase">Incl. Shipping & Taxes</p>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="mt-12 pt-8 border-t border-white/5">
                                            <OrderTimeline status={order.status} orderId={order.id} />
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

export default ProfilePage;
