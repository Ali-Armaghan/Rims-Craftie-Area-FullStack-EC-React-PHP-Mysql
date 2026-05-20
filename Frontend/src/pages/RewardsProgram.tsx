import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowRight,
  BadgePercent,
  Gift,
  Share2,
  ShoppingBag,
  Sparkles,
  UserPlus,
  Wallet,
} from "lucide-react";

const steps = [
  {
    icon: UserPlus,
    title: "Create your free account",
    body: "Sign up on Ateeqo to get your personal ReSale code automatically. This code is your unique identity in our rewards and affiliation program.",
  },
  {
    icon: Share2,
    title: "Share your code",
    body: "Send your code to friends, family, or your audience on WhatsApp, Instagram, or anywhere you sell. When they shop, they enter your code at checkout.",
  },
  {
    icon: ShoppingBag,
    title: "They place an order",
    body: "Your referral adds your ReSale / referral code in the checkout form. The order is linked to you so rewards can be tracked correctly.",
  },
  {
    icon: Wallet,
    title: "Earn when order is delivered",
    body: "Commission is added to your earning balance once the referred order is marked as delivered. You can view every credit in your account ledger.",
  },
];

const faqs = [
  {
    q: "What is the difference between loyalty points and the affiliation program?",
    a: "On Ateeqo, your reward balance works like loyalty points you earn through referrals. The affiliation (ReSale) program is how you earn those points — by sharing your code and earning commission on successful referred orders.",
  },
  {
    q: "How much do I earn per referral?",
    a: "You earn a commission based on a percentage of the referred order total (commonly shown as 5% in your dashboard). The exact rate is set by Ateeqo and applied when the order is delivered.",
  },
  {
    q: "When is my reward balance updated?",
    a: "Your balance updates after a referred order reaches delivered status. Until then, the order may appear in referral sales but commission is credited on delivery.",
  },
  {
    q: "Where do I find my ReSale code?",
    a: "Log in and open your Account dashboard. Your code appears under Overview and in the ReSale tab. Copy it and share it with customers.",
  },
  {
    q: "Can shoppers use a code without creating an account?",
    a: "Yes. Guests can checkout without logging in. They simply enter your referral / ReSale code in the checkout field before placing the order.",
  },
  {
    q: "Can I use someone else's code when I sign up?",
    a: "Yes. During registration you can enter an optional referral code if someone invited you. That links your new account to their network where applicable.",
  },
];

const RewardsProgram = () => {
  return (
    <>
      <section className="border-b border-border bg-gradient-to-b from-muted/40 to-background py-16 md:py-20">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mx-auto max-w-3xl text-center"
          >
            <p className="text-label mb-3">Ateeqo Rewards</p>
            <h1 className="mb-5 font-display text-4xl text-foreground md:text-5xl">
              Loyalty Points &amp; Affiliation Program
            </h1>
            <p className="font-body text-base leading-relaxed text-muted-foreground md:text-lg">
              Shop, share, and earn. Join our ReSale rewards program to collect loyalty-style earnings
              every time someone buys from Ateeqo using your personal code.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <Link
                to="/signup"
                className="inline-flex items-center gap-2 bg-foreground px-8 py-3.5 font-nav text-xs uppercase tracking-wide text-primary-foreground transition-colors hover:bg-foreground/90"
              >
                Join &amp; get your code
                <ArrowRight size={14} />
              </Link>
              <Link
                to="/login"
                className="inline-flex items-center gap-2 border border-border px-8 py-3.5 font-nav text-xs uppercase tracking-wide text-foreground transition-colors hover:border-primary"
              >
                Already a member? Login
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="container py-14 md:py-16">
        <div className="grid gap-10 lg:grid-cols-2 lg:items-start">
          <motion.div
            initial={{ opacity: 0, x: -16 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-full bg-primary/10 text-primary">
              <Sparkles size={20} />
            </div>
            <h2 className="mb-4 font-display text-3xl text-foreground">Why this program exists</h2>
            <p className="mb-4 font-body text-sm leading-relaxed text-muted-foreground md:text-base">
              We built the Ateeqo Rewards &amp; Affiliation program so our community can grow with us.
              Whether you are a regular customer, a reseller, or a small business owner, you can turn
              recommendations into real earnings — without complicated setup.
            </p>
            <ul className="space-y-3 font-body text-sm text-foreground/90">
              <li className="flex gap-2">
                <span className="text-primary">✓</span>
                Earn on referred sales when orders complete successfully
              </li>
              <li className="flex gap-2">
                <span className="text-primary">✓</span>
                Track balance, commissions, and referral sales in one dashboard
              </li>
              <li className="flex gap-2">
                <span className="text-primary">✓</span>
                Transparent ledger showing every credit and debit
              </li>
              <li className="flex gap-2">
                <span className="text-primary">✓</span>
                Free to join — only requires a simple Ateeqo account
              </li>
            </ul>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 16 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="rounded-2xl border border-border bg-card/50 p-6 md:p-8"
          >
            <div className="mb-5 flex items-center gap-3">
              <Gift className="text-primary" size={22} />
              <h3 className="font-display text-2xl text-foreground">Loyalty-style earnings</h3>
            </div>
            <p className="font-body text-sm leading-relaxed text-muted-foreground">
              Think of your <strong className="font-medium text-foreground">Earning Balance</strong> as
              loyalty points with real value. Each successful referred order adds commission to your
              balance. Your <strong className="font-medium text-foreground">ReSale Code</strong> is the
              key — it connects every referral back to you.
            </p>
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              <div className="rounded-xl border border-border/70 bg-background p-4">
                <p className="font-nav text-[10px] font-bold uppercase tracking-wide text-muted-foreground">
                  You receive
                </p>
                <p className="mt-1 font-display text-xl text-foreground">Personal ReSale code</p>
              </div>
              <div className="rounded-xl border border-border/70 bg-background p-4">
                <p className="font-nav text-[10px] font-bold uppercase tracking-wide text-muted-foreground">
                  You track
                </p>
                <p className="mt-1 font-display text-xl text-foreground">Balance &amp; ledger</p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="border-y border-border bg-muted/20 py-14 md:py-16">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-10 text-center"
          >
            <p className="text-label mb-2">How it works</p>
            <h2 className="font-display text-3xl text-foreground md:text-4xl">Four simple steps</h2>
          </motion.div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {steps.map((step, index) => (
              <motion.div
                key={step.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.08 }}
                className="rounded-2xl border border-border bg-background p-5 shadow-sm"
              >
                <span className="mb-4 flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <step.icon size={18} />
                </span>
                <p className="mb-1 font-nav text-[10px] font-bold uppercase tracking-wide text-primary">
                  Step {index + 1}
                </p>
                <h3 className="mb-2 font-display text-xl text-foreground">{step.title}</h3>
                <p className="font-body text-sm leading-relaxed text-muted-foreground">{step.body}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="container py-14 md:py-16">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-10"
        >
          <p className="text-label mb-2">How to use</p>
          <h2 className="font-display text-3xl text-foreground md:text-4xl">Practical guide</h2>
        </motion.div>

        <div className="grid gap-8 lg:grid-cols-3">
          <div className="rounded-2xl border border-border p-6 lg:col-span-1">
            <BadgePercent className="mb-3 text-primary" size={22} />
            <h3 className="mb-3 font-display text-xl text-foreground">For earners (affiliates)</h3>
            <ol className="list-decimal space-y-3 pl-4 font-body text-sm leading-relaxed text-muted-foreground">
              <li>Create an account at Sign Up.</li>
              <li>Open Account → ReSale tab and copy your code.</li>
              <li>Share the code with buyers and tell them to enter it at checkout.</li>
              <li>Check Overview for balance and Ledger for each earning.</li>
            </ol>
            <Link
              to="/account"
              className="mt-5 inline-flex items-center gap-1 font-nav text-xs uppercase tracking-wide text-primary hover:underline"
            >
              Go to dashboard <ArrowRight size={12} />
            </Link>
          </div>

          <div className="rounded-2xl border border-border p-6 lg:col-span-1">
            <ShoppingBag className="mb-3 text-primary" size={22} />
            <h3 className="mb-3 font-display text-xl text-foreground">For shoppers (using a code)</h3>
            <ol className="list-decimal space-y-3 pl-4 font-body text-sm leading-relaxed text-muted-foreground">
              <li>Add products to cart and go to Checkout.</li>
              <li>Fill in name, phone, and delivery address.</li>
              <li>
                Enter the referral / ReSale code in the optional field (labeled Referral / ReSale Code).
              </li>
              <li>Place order with Cash on Delivery — no login required for guests.</li>
            </ol>
            <Link
              to="/products"
              className="mt-5 inline-flex items-center gap-1 font-nav text-xs uppercase tracking-wide text-primary hover:underline"
            >
              Shop now <ArrowRight size={12} />
            </Link>
          </div>

          <div className="rounded-2xl border border-border bg-foreground p-6 text-primary-foreground lg:col-span-1">
            <Wallet className="mb-3 text-primary-foreground/90" size={22} />
            <h3 className="mb-3 font-display text-xl">What you see in your account</h3>
            <ul className="space-y-3 font-body text-sm leading-relaxed text-primary-foreground/85">
              <li>
                <span className="font-semibold text-primary-foreground">Resale Code</span> — your shareable
                affiliation ID
              </li>
              <li>
                <span className="font-semibold text-primary-foreground">Earning Balance</span> — loyalty-style
                points / cash value earned
              </li>
              <li>
                <span className="font-semibold text-primary-foreground">Referral Sales</span> — total sales
                linked to your code
              </li>
              <li>
                <span className="font-semibold text-primary-foreground">Commission</span> — total rewards
                credited over time
              </li>
              <li>
                <span className="font-semibold text-primary-foreground">Ledger</span> — full history of credits
              </li>
            </ul>
          </div>
        </div>
      </section>

      <section className="border-t border-border bg-muted/15 py-14 md:py-16">
        <div className="container max-w-3xl">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-8 text-center"
          >
            <p className="text-label mb-2">FAQ</p>
            <h2 className="font-display text-3xl text-foreground">Common questions</h2>
          </motion.div>

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

      <section className="container py-14 pb-20">
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="rounded-2xl border border-primary/20 bg-primary/5 px-6 py-10 text-center md:px-12"
        >
          <h2 className="mb-3 font-display text-3xl text-foreground">Ready to start earning?</h2>
          <p className="mx-auto mb-6 max-w-xl font-body text-sm text-muted-foreground md:text-base">
            Join thousands of Ateeqo customers who share style they love and earn rewards on every
            successful referral.
          </p>
          <Link
            to="/signup"
            className="inline-flex items-center gap-2 bg-foreground px-10 py-4 font-nav text-xs uppercase tracking-wide text-primary-foreground hover:bg-foreground/90"
          >
            Get started free
            <ArrowRight size={14} />
          </Link>
        </motion.div>
      </section>
    </>
  );
};

export default RewardsProgram;
