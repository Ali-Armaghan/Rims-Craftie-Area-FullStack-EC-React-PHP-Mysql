import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowRight,
  BadgePercent,
  Crown,
  LogIn,
  ShoppingBag,
  Sparkles,
  TrendingUp,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { fetchLoyaltyStatus } from "@/services/api";
import {
  formatRs,
  getCurrentTierLabel,
  getNextTier,
  LOYALTY_TIERS,
} from "@/lib/loyalty";

const steps = [
  {
    icon: LogIn,
    title: "Sign in to your account",
    body: "Loyalty discounts apply automatically when you checkout while logged in. Guest orders do not count toward unlocking tiers on that purchase.",
  },
  {
    icon: ShoppingBag,
    title: "Shop and build history",
    body: "Every completed order adds to your lifetime purchase total. The more you shop with Ateeqo, the higher your automatic discount becomes.",
  },
  {
    icon: BadgePercent,
    title: "Unlock automatic savings",
    body: "Once you reach a tier threshold, your discount is applied instantly at checkout — no coupon code needed.",
  },
  {
    icon: Crown,
    title: "Enjoy VIP rewards",
    body: "Platinum members enjoy our highest 15% loyalty savings on every order while logged in.",
  },
];

const faqs = [
  {
    q: "When is my loyalty discount applied?",
    a: "When you are logged in and place an order, your discount is calculated from your purchase history and applied automatically at checkout.",
  },
  {
    q: "Do guest checkout orders get loyalty discounts?",
    a: "No. You must be logged in before checkout to receive your loyalty discount. Guest checkout is still available, but without loyalty savings.",
  },
  {
    q: "What counts toward purchase history?",
    a: "All non-cancelled orders on your account count toward your lifetime spend total.",
  },
  {
    q: "Can I combine loyalty discount with a referral code?",
    a: "Yes. Loyalty savings apply to your order total, and you can still enter a referral / ReSale code at checkout.",
  },
  {
    q: "What happens when I reach the next tier?",
    a: "Your discount percentage upgrades automatically on your next logged-in order once your lifetime spend crosses the new threshold.",
  },
];

const LoyaltyProgram = () => {
  const { user } = useAuth();
  const { data: loyalty, isLoading } = useQuery({
    queryKey: ["loyalty-status", user?.id],
    queryFn: () => fetchLoyaltyStatus(user!.id),
    enabled: !!user?.id,
  });

  const lifetimeSpent = loyalty?.lifetime_spent ?? 0;
  const currentPercent = loyalty?.discount_percent ?? 0;
  const nextTier = loyalty
    ? loyalty.next_tier_threshold
      ? {
          min: loyalty.next_tier_threshold,
          percent: loyalty.next_tier_percent ?? 0,
          label: LOYALTY_TIERS.find((t) => t.min === loyalty.next_tier_threshold)?.label ?? "",
        }
      : null
    : getNextTier(0);
  const progressPercent = nextTier
    ? Math.min(100, (lifetimeSpent / nextTier.min) * 100)
    : 100;

  return (
    <>
      <section className="border-b border-border bg-gradient-to-b from-muted/40 to-background py-16 md:py-20">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mx-auto max-w-3xl text-center"
          >
            <p className="text-label mb-3">Ateeqo Loyalty</p>
            <h1 className="mb-5 font-display text-4xl text-foreground md:text-5xl">
              Loyalty Points Program
            </h1>
            <p className="font-body text-base leading-relaxed text-muted-foreground md:text-lg">
              Shop more, save more. Logged-in customers unlock automatic checkout discounts
              based on lifetime purchase history.
            </p>
            {!user ? (
              <Link
                to="/login"
                className="mt-8 inline-flex items-center gap-2 bg-foreground px-8 py-4 font-nav text-xs uppercase tracking-wide text-primary-foreground hover:bg-foreground/90"
              >
                Login to view your tier
                <ArrowRight size={14} />
              </Link>
            ) : isLoading ? (
              <p className="mt-8 font-body text-sm text-muted-foreground">Loading your loyalty status...</p>
            ) : (
              <div className="mx-auto mt-8 max-w-xl rounded-2xl border border-primary/20 bg-primary/5 p-6 text-left">
                <div className="mb-4 flex items-center justify-between gap-4">
                  <div>
                    <p className="font-nav text-[10px] font-bold uppercase tracking-wide text-primary">
                      Your status
                    </p>
                    <p className="mt-1 font-display text-2xl text-foreground">
                      {loyalty?.tier_label ?? getCurrentTierLabel(lifetimeSpent)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-nav text-[10px] font-bold uppercase tracking-wide text-muted-foreground">
                      Current discount
                    </p>
                    <p className="mt-1 font-display text-2xl text-foreground">
                      {currentPercent > 0 ? `${currentPercent}% OFF` : "—"}
                    </p>
                  </div>
                </div>
                <p className="font-body text-sm text-muted-foreground">
                  Lifetime spend: <span className="font-semibold text-foreground">{formatRs(lifetimeSpent)}</span>
                </p>
                {nextTier && (
                  <div className="mt-4">
                    <div className="mb-2 flex justify-between font-body text-xs text-muted-foreground">
                      <span>Progress to {nextTier.label}</span>
                      <span>{formatRs(loyalty?.amount_to_next_tier ?? nextTier.min)} to go</span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-border">
                      <div
                        className="h-full rounded-full bg-primary transition-all duration-500"
                        style={{ width: `${progressPercent}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>
            )}
          </motion.div>
        </div>
      </section>

      <section className="container py-14 md:py-16">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mx-auto max-w-3xl"
        >
          <div className="mb-8 text-center">
            <p className="text-label mb-2">Discount tiers</p>
            <h2 className="font-display text-3xl text-foreground">Purchase history rewards</h2>
          </div>

          <div className="overflow-hidden rounded-2xl border border-border">
            <table className="w-full text-left">
              <thead className="bg-secondary/50">
                <tr>
                  <th className="px-5 py-4 font-nav text-[11px] font-bold uppercase tracking-wide text-foreground">
                    Lifetime spend
                  </th>
                  <th className="px-5 py-4 font-nav text-[11px] font-bold uppercase tracking-wide text-foreground">
                    Tier
                  </th>
                  <th className="px-5 py-4 text-right font-nav text-[11px] font-bold uppercase tracking-wide text-foreground">
                    Auto discount
                  </th>
                </tr>
              </thead>
              <tbody>
                {LOYALTY_TIERS.map((tier, index) => {
                  const isActive = user && lifetimeSpent >= tier.min;
                  return (
                    <tr
                      key={tier.min}
                      className={`border-t border-border/70 ${isActive ? "bg-primary/5" : index % 2 === 0 ? "bg-background" : "bg-secondary/15"}`}
                    >
                      <td className="px-5 py-4 font-body text-sm text-foreground">
                        {formatRs(tier.min)}+
                      </td>
                      <td className="px-5 py-4 font-display text-sm text-foreground">{tier.label}</td>
                      <td className="px-5 py-4 text-right font-body text-sm font-bold text-primary">
                        {tier.percent}% OFF
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </motion.div>
      </section>

      <section className="border-y border-border bg-muted/15 py-14 md:py-16">
        <div className="container">
          <div className="mb-10 text-center">
            <p className="text-label mb-2">How it works</p>
            <h2 className="font-display text-3xl text-foreground">Four simple steps</h2>
          </div>
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
            {steps.map((step, index) => (
              <motion.div
                key={step.title}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.08 }}
                className="rounded-2xl border border-border bg-background p-6"
              >
                <step.icon className="mb-4 text-primary" size={22} strokeWidth={1.75} />
                <h3 className="mb-2 font-display text-lg text-foreground">{step.title}</h3>
                <p className="font-body text-sm leading-relaxed text-muted-foreground">{step.body}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="container py-14 md:py-16">
        <div className="grid gap-8 lg:grid-cols-2">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="rounded-2xl border border-border bg-foreground p-8 text-primary-foreground"
          >
            <TrendingUp className="mb-4 text-primary-foreground/90" size={24} />
            <h3 className="mb-3 font-display text-2xl">Why loyalty points?</h3>
            <ul className="space-y-3 font-body text-sm leading-relaxed text-primary-foreground/85">
              <li>Automatic savings — no coupon codes to remember</li>
              <li>Rewards repeat customers who love Ateeqo bags</li>
              <li>Transparent tiers — always know your next milestone</li>
              <li>Works alongside our ReSale referral program</li>
            </ul>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="rounded-2xl border border-primary/20 bg-primary/5 p-8"
          >
            <Sparkles className="mb-4 text-primary" size={24} />
            <h3 className="mb-3 font-display text-2xl text-foreground">At checkout</h3>
            <p className="font-body text-sm leading-relaxed text-muted-foreground">
              When you are logged in, we fetch your purchase history and apply your tier discount
              before you confirm the order. You will see a{" "}
              <span className="font-semibold text-foreground">Loyalty discount</span> line in your
              order summary with the exact amount saved.
            </p>
            <Link
              to={user ? "/products" : "/login"}
              className="mt-6 inline-flex items-center gap-2 font-nav text-xs uppercase tracking-wide text-primary hover:underline"
            >
              {user ? "Start shopping" : "Login to unlock savings"}
              <ArrowRight size={12} />
            </Link>
          </motion.div>
        </div>
      </section>

      <section className="border-t border-border bg-muted/15 py-14 md:py-16">
        <div className="container max-w-3xl">
          <div className="mb-8 text-center">
            <p className="text-label mb-2">FAQ</p>
            <h2 className="font-display text-3xl text-foreground">Common questions</h2>
          </div>
          <div className="space-y-4">
            {faqs.map((item) => (
              <details
                key={item.q}
                className="group rounded-xl border border-border bg-background px-5 py-4 open:shadow-sm"
              >
                <summary className="cursor-pointer list-none font-nav text-sm font-semibold uppercase tracking-wide text-foreground [&::-webkit-details-marker]:hidden">
                  {item.q}
                </summary>
                <p className="mt-3 font-body text-sm leading-relaxed text-muted-foreground">{item.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>
    </>
  );
};

export default LoyaltyProgram;
