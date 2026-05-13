import { Link, Navigate } from "react-router-dom";
import { motion } from "framer-motion";
import { LogOut } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

const Account = () => {
  const { user, logout } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <section className="container py-16">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mx-auto max-w-3xl"
      >
        <p className="font-nav text-[10px] tracking-[0.4em] uppercase text-primary mb-3">
          Dashboard
        </p>
        <h1 className="font-display text-4xl text-foreground mb-8">
          Welcome, {user.name}
        </h1>

        <div className="grid gap-4 border border-border bg-background p-8">
          <div>
            <p className="font-nav text-[10px] tracking-[0.2em] uppercase text-muted-foreground">
              Email
            </p>
            <p className="font-body text-lg text-foreground">{user.email}</p>
          </div>

          {user.resale_code && (
            <div>
              <p className="font-nav text-[10px] tracking-[0.2em] uppercase text-muted-foreground">
                Resale Code
              </p>
              <p className="font-body text-lg text-foreground">{user.resale_code}</p>
            </div>
          )}

          <div className="flex flex-wrap gap-3 pt-4">
            <Link
              to="/products"
              className="bg-foreground px-6 py-3 font-nav text-xs tracking-[0.2em] uppercase text-primary-foreground"
            >
              Continue Shopping
            </Link>
            <button
              onClick={logout}
              className="inline-flex items-center gap-2 border border-border px-6 py-3 font-nav text-xs tracking-[0.2em] uppercase text-foreground"
            >
              <LogOut size={14} />
              Logout
            </button>
          </div>
        </div>
      </motion.div>
    </section>
  );
};

export default Account;
