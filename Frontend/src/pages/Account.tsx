import { useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import {
  ClipboardList,
  LayoutDashboard,
  LogOut,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import {
  CustomerOrder,
  CustomerOrderDetail,
  fetchCustomerOrder,
  fetchCustomerOrders,
  fetchLoyaltyStatus,
} from "@/services/api";

type DashboardTab = "overview" | "orders";

const dashboardTabs: { id: DashboardTab; label: string; icon: typeof LayoutDashboard }[] = [
  { id: "overview", label: "Overview", icon: LayoutDashboard },
  { id: "orders", label: "Orders", icon: ClipboardList },
];

function money(value: string | number | undefined | null) {
  return `Rs. ${Number(value ?? 0).toLocaleString()}`;
}

function parseShippingAddress(value: string | CustomerOrderDetail["shipping_address"]) {
  if (!value) return null;

  try {
    return typeof value === "string" ? JSON.parse(value) : value;
  } catch {
    return null;
  }
}

const Account = () => {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<DashboardTab>("overview");
  const [selectedOrderId, setSelectedOrderId] = useState<number | null>(null);

  const userId = user?.id;

  const { data: orders = [], isLoading: ordersLoading } = useQuery({
    queryKey: ["customer-orders", userId],
    queryFn: () => fetchCustomerOrders(userId!),
    enabled: !!userId,
  });

  const { data: selectedOrder, isLoading: orderDetailLoading } = useQuery({
    queryKey: ["customer-order", selectedOrderId, userId],
    queryFn: () => fetchCustomerOrder(selectedOrderId!, userId!),
    enabled: !!selectedOrderId && !!userId,
  });

  const { data: loyalty } = useQuery({
    queryKey: ["loyalty-status", userId],
    queryFn: () => fetchLoyaltyStatus(userId!),
    enabled: !!userId,
  });

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const selectedShipping = selectedOrder
    ? parseShippingAddress(selectedOrder.shipping_address)
    : null;

  return (
    <section className="container py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid gap-8 lg:grid-cols-[260px_1fr]"
      >
        <aside className="h-fit border border-border bg-background p-5">
          <p className="font-nav text-xs tracking-wide uppercase text-primary mb-2">
            My Account
          </p>
          <h1 className="font-display text-2xl text-foreground mb-1">{user.name}</h1>
          <p className="font-body text-sm text-muted-foreground mb-6">{user.email}</p>

          <nav className="grid gap-2">
            {dashboardTabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-3 px-3 py-3 text-left font-nav text-xs tracking-normal uppercase transition-colors ${
                    activeTab === tab.id
                      ? "bg-foreground text-primary-foreground"
                      : "text-foreground/70 hover:bg-secondary"
                  }`}
                >
                  <Icon size={16} />
                  {tab.label}
                </button>
              );
            })}
          </nav>

          <button
            onClick={logout}
            className="mt-6 inline-flex w-full items-center justify-center gap-2 border border-border px-4 py-3 font-nav text-xs tracking-wide uppercase text-foreground"
          >
            <LogOut size={14} />
            Logout
          </button>
        </aside>

        <main>
          {activeTab === "overview" && (
            <div className="space-y-6">
              <div>
                <p className="font-nav text-xs tracking-wide uppercase text-primary mb-3">
                  Dashboard
                </p>
                <h2 className="font-display text-4xl text-foreground">
                  Welcome, {user.name}
                </h2>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="border border-border p-5">
                  <p className="font-nav text-xs tracking-wide uppercase text-muted-foreground">Total Orders</p>
                  <p className="font-display text-3xl text-foreground mt-2">{orders.length}</p>
                </div>
                <div className="border border-border p-5">
                  <p className="font-nav text-xs tracking-wide uppercase text-muted-foreground">Account Status</p>
                  <p className="font-body text-xl font-medium text-foreground mt-2 capitalize">{user.status ?? "Active"}</p>
                </div>
              </div>

              <div className="border border-primary/20 bg-primary/5 p-6">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <p className="font-nav text-xs tracking-wide uppercase text-primary mb-2">
                      Loyalty Points
                    </p>
                    <h3 className="font-display text-2xl text-foreground">
                      {loyalty?.tier_label ?? "Member"}
                      {loyalty && loyalty.discount_percent > 0 ? ` · ${loyalty.discount_percent}% OFF` : ""}
                    </h3>
                    <p className="mt-2 font-body text-sm text-muted-foreground">
                      Lifetime spend: {money(loyalty?.lifetime_spent ?? 0)}
                    </p>
                  </div>
                  <Link
                    to="/loyalty"
                    className="inline-flex items-center border border-foreground px-4 py-2 font-nav text-xs uppercase tracking-wide text-foreground hover:bg-foreground hover:text-primary-foreground"
                  >
                    View program
                  </Link>
                </div>
              </div>

              <div className="border border-border p-6">
                <h3 className="font-display text-2xl text-foreground mb-3">Recent Orders</h3>
                {orders.slice(0, 3).map((order) => (
                  <button
                    key={order.id}
                    onClick={() => {
                      setSelectedOrderId(order.id);
                      setActiveTab("orders");
                    }}
                    className="flex w-full items-center justify-between border-t border-border py-4 text-left"
                  >
                    <span className="font-body text-sm">{order.order_number}</span>
                    <span className="font-body text-sm capitalize text-muted-foreground">{order.status}</span>
                    <span className="font-body text-sm">{money(order.total)}</span>
                  </button>
                ))}
                {orders.length === 0 && (
                  <p className="font-body text-sm text-muted-foreground">No orders yet.</p>
                )}
              </div>
            </div>
          )}

          {activeTab === "orders" && (
            <div className="grid gap-6 xl:grid-cols-[1fr_420px]">
              <div className="border border-border">
                <div className="border-b border-border p-5">
                  <h2 className="font-display text-3xl text-foreground">My Orders</h2>
                </div>
                {ordersLoading ? (
                  <div className="p-8 text-center text-muted-foreground">Loading orders...</div>
                ) : orders.length ? (
                  orders.map((order: CustomerOrder) => (
                    <button
                      key={order.id}
                      onClick={() => setSelectedOrderId(order.id)}
                      className={`grid w-full gap-2 border-b border-border p-5 text-left transition-colors md:grid-cols-4 ${
                        selectedOrderId === order.id ? "bg-secondary" : "hover:bg-secondary/60"
                      }`}
                    >
                      <span className="font-body text-sm font-medium">{order.order_number}</span>
                      <span className="font-body text-sm capitalize text-muted-foreground">{order.status}</span>
                      <span className="font-body text-sm">{money(order.total)}</span>
                      <span className="font-body text-sm text-muted-foreground">{new Date(order.created_at).toLocaleDateString()}</span>
                    </button>
                  ))
                ) : (
                  <div className="p-8 text-center">
                    <p className="font-body text-muted-foreground mb-4">You have no orders yet.</p>
                    <Link to="/products" className="text-primary underline">Browse products</Link>
                  </div>
                )}
              </div>

              <div className="border border-border p-5">
                <h3 className="font-display text-2xl text-foreground mb-4">Order Details</h3>
                {!selectedOrderId ? (
                  <p className="font-body text-sm text-muted-foreground">Select an order to view details.</p>
                ) : orderDetailLoading ? (
                  <p className="font-body text-sm text-muted-foreground">Loading details...</p>
                ) : selectedOrder ? (
                  <div className="space-y-5">
                    <div>
                      <p className="font-nav text-xs tracking-wide uppercase text-muted-foreground">Status</p>
                      <p className="font-body text-lg capitalize">{selectedOrder.status}</p>
                    </div>
                    <div>
                      <p className="font-nav text-xs tracking-wide uppercase text-muted-foreground">Shipping</p>
                      <p className="font-body text-sm text-foreground">
                        {selectedShipping?.full_name}<br />
                        {selectedShipping?.address}<br />
                        {selectedShipping?.city}, {selectedShipping?.state}
                      </p>
                    </div>
                    <div>
                      <p className="font-nav text-xs tracking-wide uppercase text-muted-foreground mb-2">Items</p>
                      {selectedOrder.items?.map((item) => (
                        <div key={item.id} className="flex justify-between border-t border-border py-3 font-body text-sm">
                          <span className="pr-3">
                            {item.product_name ?? item.name} x {item.quantity}
                            {item.color_name ? (
                              <span className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
                                {item.color_hex ? (
                                  <span
                                    className="inline-block h-2.5 w-2.5 rounded-full border border-border"
                                    style={{ backgroundColor: item.color_hex }}
                                  />
                                ) : null}
                                Color: {item.color_name}
                              </span>
                            ) : null}
                          </span>
                          <span>{money(item.subtotal)}</span>
                        </div>
                      ))}
                    </div>
                    <div className="flex justify-between border-t border-border pt-4 font-display text-xl">
                      <span>Total</span>
                      <span>{money(selectedOrder.total)}</span>
                    </div>
                  </div>
                ) : (
                  <p className="font-body text-sm text-muted-foreground">Order not found.</p>
                )}
              </div>
            </div>
          )}
        </main>
      </motion.div>
    </section>
  );
};

export default Account;
