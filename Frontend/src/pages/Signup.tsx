import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { signupCustomer } from "@/services/api";

const Signup = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    referred_by_code: "",
  });

  const updateField = (field: keyof typeof formData, value: string) => {
    setFormData((current) => ({ ...current, [field]: value }));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    setIsSubmitting(true);

    try {
      await signupCustomer({
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        password: formData.password,
        referred_by_code: formData.referred_by_code || undefined,
      });
      toast.success("Account created. Please login.");
      navigate("/login");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Unable to create account"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="container flex min-h-[70vh] items-center justify-center py-16">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-xl border border-border bg-background p-8 shadow-sm"
      >
        <p className="font-nav text-xs tracking-wide uppercase text-primary mb-3">
          Join Ateeqo
        </p>
        <h1 className="font-display text-3xl text-foreground mb-2">
          Create Account
        </h1>
        <p className="font-body text-sm text-muted-foreground mb-8">
          Register to shop faster and receive your resale referral code.
        </p>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="font-nav text-xs tracking-wide uppercase text-foreground">
              Full Name
            </label>
            <input
              required
              value={formData.name}
              onChange={(event) => updateField("name", event.target.value)}
              className="mt-2 w-full border border-border bg-transparent px-4 py-3 font-body text-sm focus:border-primary focus:outline-none"
              placeholder="Your name"
            />
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            <div>
              <label className="font-nav text-xs tracking-wide uppercase text-foreground">
                Email
              </label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(event) => updateField("email", event.target.value)}
                className="mt-2 w-full border border-border bg-transparent px-4 py-3 font-body text-sm focus:border-primary focus:outline-none"
                placeholder="name@example.com"
              />
            </div>
            <div>
              <label className="font-nav text-xs tracking-wide uppercase text-foreground">
                Phone
              </label>
              <input
                value={formData.phone}
                onChange={(event) => updateField("phone", event.target.value)}
                className="mt-2 w-full border border-border bg-transparent px-4 py-3 font-body text-sm focus:border-primary focus:outline-none"
                placeholder="+92..."
              />
            </div>
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            <div>
              <label className="font-nav text-xs tracking-wide uppercase text-foreground">
                Password
              </label>
              <input
                type="password"
                required
                minLength={7}
                value={formData.password}
                onChange={(event) => updateField("password", event.target.value)}
                className="mt-2 w-full border border-border bg-transparent px-4 py-3 font-body text-sm focus:border-primary focus:outline-none"
                placeholder="********"
              />
            </div>
            <div>
              <label className="font-nav text-xs tracking-wide uppercase text-foreground">
                Confirm Password
              </label>
              <input
                type="password"
                required
                minLength={7}
                value={formData.confirmPassword}
                onChange={(event) =>
                  updateField("confirmPassword", event.target.value)
                }
                className="mt-2 w-full border border-border bg-transparent px-4 py-3 font-body text-sm focus:border-primary focus:outline-none"
                placeholder="********"
              />
            </div>
          </div>

          <div>
            <label className="font-nav text-xs tracking-wide uppercase text-foreground">
              Referral Code
            </label>
            <input
              value={formData.referred_by_code}
              onChange={(event) =>
                updateField("referred_by_code", event.target.value)
              }
              className="mt-2 w-full border border-border bg-transparent px-4 py-3 font-body text-sm focus:border-primary focus:outline-none"
              placeholder="Optional"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-foreground py-4 font-nav text-xs tracking-wide uppercase text-primary-foreground transition-colors hover:bg-foreground/90 disabled:opacity-60"
          >
            {isSubmitting ? "Creating..." : "Create Account"}
          </button>
        </form>

        <p className="mt-6 text-center font-body text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link to="/login" className="text-primary underline underline-offset-4">
            Login
          </Link>
        </p>
      </motion.div>
    </section>
  );
};

export default Signup;
