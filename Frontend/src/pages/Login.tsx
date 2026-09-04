import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { loginCustomer } from "@/services/api";
import { useAuth } from "@/context/AuthContext";

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsSubmitting(true);

    try {
      const user = await loginCustomer(formData);
      login(user);
      toast.success(`Welcome back, ${user.name}`);
      navigate("/");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Login failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="container flex min-h-[70vh] items-center justify-center py-16">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md border border-border bg-background p-8 shadow-sm"
      >
        <p className="font-nav text-xs tracking-wide uppercase text-primary mb-3">
          Customer Account
        </p>
        <h1 className="font-display text-3xl text-foreground mb-2">Login</h1>
        <p className="font-body text-sm text-muted-foreground mb-8">
          Sign in to continue shopping and manage your orders.
        </p>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="font-nav text-xs tracking-wide uppercase text-foreground">
              Email
            </label>
            <input
              type="email"
              required
              value={formData.email}
              onChange={(event) =>
                setFormData((current) => ({
                  ...current,
                  email: event.target.value,
                }))
              }
              className="mt-2 w-full border border-border bg-transparent px-4 py-3 font-body text-sm focus:border-primary focus:outline-none"
              placeholder="name@example.com"
            />
          </div>

          <div>
            <label className="font-nav text-xs tracking-wide uppercase text-foreground">
              Password
            </label>
            <input
              type="password"
              required
              value={formData.password}
              onChange={(event) =>
                setFormData((current) => ({
                  ...current,
                  password: event.target.value,
                }))
              }
              className="mt-2 w-full border border-border bg-transparent px-4 py-3 font-body text-sm focus:border-primary focus:outline-none"
              placeholder="********"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-foreground py-4 font-nav text-xs tracking-wide uppercase text-primary-foreground transition-colors hover:bg-foreground/90 disabled:opacity-60"
          >
            {isSubmitting ? "Signing In..." : "Login"}
          </button>
        </form>

        <p className="mt-6 text-center font-body text-sm text-muted-foreground">
          New here?{" "}
          <Link to="/signup" className="text-primary underline underline-offset-4">
            Create an account
          </Link>
        </p>
      </motion.div>
    </section>
  );
};

export default Login;
