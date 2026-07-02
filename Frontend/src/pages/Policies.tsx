import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { CONTACT } from "@/lib/contact";

const faqSections = [
  {
    title: "Shipping & Delivery",
    items: [
      {
        q: "How long will it take to receive my order?",
        a: "Orders are typically processed within 24–48 hours. Depending on your location within Pakistan, delivery usually takes 3–5 business days.",
      },
      {
        q: "Can I track my order?",
        a: "Yes! Once your order is dispatched, you will receive a tracking number via email or SMS, which you can use to monitor your package's progress.",
      },
    ],
  },
  {
    title: "Products & Quality",
    items: [
      {
        q: "What materials are used in Ateeqo handbags?",
        a: "We prioritize durability and aesthetics. Each product description contains specific details about the materials (e.g., premium synthetic leather, heavy-duty hardware) to ensure you know exactly what you are purchasing.",
      },
      {
        q: "How do I clean and maintain my bag?",
        a: "To keep your Ateeqo bag looking new, we recommend wiping it down with a soft, damp cloth. Avoid harsh chemicals or prolonged exposure to direct sunlight. For specific material care, please refer to the care card included with your purchase.",
      },
    ],
  },
  {
    title: "Returns & Exchanges",
    items: [
      {
        q: "What is your exchange policy?",
        a: "We want you to be completely happy with your purchase. If you would like to exchange your item for a different color or model, you may do so within 7 days of receipt. Please ensure the item is in its original, unused condition with all tags attached.",
      },
      {
        q: "Do you offer refunds?",
        a: "We offer exchanges only. We do not provide cash refunds for returned items. We are committed to ensuring you receive a product you love, and we are happy to assist you in selecting an alternative item from our collection.",
      },
      {
        q: "What if I receive a damaged item?",
        a: "We take great care in inspecting our products before they reach you. In the unlikely event that you receive a damaged or incorrect item, please notify us within 24 hours of delivery. We will facilitate an exchange for the same item in perfect condition immediately.",
      },
      {
        q: "Who covers the shipping cost for exchanges?",
        a: "For standard exchanges (change of mind/preference), the customer is responsible for the return shipping costs. If the exchange is due to a mistake on our end or a damaged product, Ateeqo will cover the shipping expenses.",
      },
    ],
  },
  {
    title: "Payments",
    items: [
      {
        q: "What payment methods do you accept?",
        a: "We make payments easy and secure. We accept direct bank transfers, mobile wallets, and cash on delivery (COD).",
      },
    ],
  },
  {
    title: "General",
    items: [
      {
        q: "How can I contact Ateeqo customer support?",
        a: `We are here to help! You can reach us at ${CONTACT.email.address} or message us on WhatsApp at ${CONTACT.whatsapp.display}. We strive to respond to all inquiries within 24 hours.`,
      },
    ],
  },
];

const policySections = [
  {
    id: "shipping",
    title: "Shipping Policy",
    points: [
      "Processing Time: All orders are processed within 24–48 hours (excluding Sundays).",
      "Delivery Time: Estimated delivery within Pakistan is 3–5 business days.",
      "Shipping Charges: Shipping charges vary based on the destination, package weight, and chosen courier service. The final shipping cost will be calculated and displayed during the checkout process before you finalize your payment.",
      "Tracking: You will receive a tracking link via SMS or email as soon as your order is dispatched.",
    ],
  },
  {
    id: "exchange",
    title: "Exchange Policy",
    points: [
      "Eligibility: We want you to be satisfied with your purchase. If you would like to exchange your item for a different color or model, you may do so within 7 days of receipt.",
      "Condition: Items must be in their original, unused condition with all tags attached and in the original packaging.",
      "Exchange-Only: We offer exchanges only. We do not provide cash refunds.",
      "Damaged/Incorrect Items: If you receive a damaged or incorrect product, please notify us within 24 hours of delivery. We will facilitate an exchange for the same item at no additional cost to you.",
      "Standard Exchanges: For exchanges based on personal preference (e.g., color or model change), the customer is responsible for return shipping costs.",
    ],
  },
  {
    id: "privacy",
    title: "Privacy Policy",
    points: [
      "At Ateeqo, your privacy is our priority. This policy outlines how we collect, use, and protect your information.",
      "Information We Collect: We collect information you provide directly, such as your name, shipping/billing address, email address, and phone number when you place an order. We also collect technical data (like IP addresses) to improve your website experience.",
      "How We Use Your Information: We use your data to process and fulfill your orders, communicate with you regarding your order status, and improve our store's performance.",
      "Data Sharing: We do not sell your personal information. We only share data with necessary third parties, such as shipping carriers to deliver your products and payment gateways to process your transactions securely.",
      "Security: We take reasonable steps to protect your data.",
      `Your Rights: You have the right to request access to or deletion of the personal information we hold about you. Contact us at ${CONTACT.email.address} to make such a request.`,
      "Policy Updates: We may update this policy periodically. The revised version will be posted on our website.",
    ],
  },
];

const Policies = () => {
  return (
    <>
      <section className="border-b border-border bg-gradient-to-b from-muted/40 to-background py-16 md:py-20">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mx-auto max-w-3xl text-center"
          >
            <p className="text-label mb-3">Customer information</p>
            <h1 className="mb-5 font-display text-4xl text-foreground md:text-5xl">
              Policies &amp; FAQ
            </h1>
            <p className="font-body text-base leading-relaxed text-muted-foreground md:text-lg">
              Everything you need to know about shipping, exchanges, payments, and how we
              protect your privacy at Ateeqo.
            </p>
          </motion.div>
        </div>
      </section>

      <section className="container py-14 md:py-16">
        <div className="mx-auto max-w-3xl">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-10 flex flex-wrap justify-center gap-2"
          >
            {[
              { label: "FAQ", href: "#faq" },
              { label: "Shipping", href: "#shipping" },
              { label: "Exchange", href: "#exchange" },
              { label: "Privacy", href: "#privacy" },
            ].map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="rounded-full border border-border px-4 py-1.5 font-nav text-[10px] uppercase tracking-wide text-foreground/80 transition-colors hover:border-primary hover:text-primary"
              >
                {item.label}
              </a>
            ))}
          </motion.div>

          <div id="faq" className="scroll-mt-28">
            <h2 className="mb-8 font-display text-3xl text-foreground">Ateeqo FAQ</h2>
            <div className="space-y-10">
              {faqSections.map((section) => (
                <div key={section.title}>
                  <h3 className="mb-4 font-nav text-sm font-bold uppercase tracking-wide text-primary">
                    {section.title}
                  </h3>
                  <div className="space-y-3">
                    {section.items.map((item) => (
                      <details
                        key={item.q}
                        className="group rounded-xl border border-border bg-background px-5 py-4 open:shadow-sm"
                      >
                        <summary className="cursor-pointer list-none font-body text-sm font-semibold text-foreground [&::-webkit-details-marker]:hidden">
                          {item.q}
                        </summary>
                        <p className="mt-3 font-body text-sm leading-relaxed text-muted-foreground">
                          {item.a}
                        </p>
                      </details>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="border-t border-border bg-muted/15 py-14 md:py-16">
        <div className="container">
          <div className="mx-auto max-w-3xl space-y-12">
            {policySections.map((section, index) => (
              <motion.div
                key={section.id}
                id={section.id}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.05 }}
                className="scroll-mt-28 rounded-2xl border border-border bg-background p-6 md:p-8"
              >
                <h2 className="mb-5 font-display text-2xl text-foreground">{section.title}</h2>
                <ul className="space-y-3">
                  {section.points.map((point) => (
                    <li
                      key={point}
                      className="font-body text-sm leading-relaxed text-muted-foreground before:mr-2 before:text-primary before:content-['•']"
                    >
                      {point}
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="container pb-16 pt-4">
        <div className="mx-auto max-w-3xl rounded-2xl border border-primary/20 bg-primary/5 px-6 py-8 text-center md:px-10">
          <p className="font-body text-sm text-muted-foreground md:text-base">
            Still have questions? Our team is happy to help.
          </p>
          <div className="mt-4 flex flex-wrap items-center justify-center gap-4">
            <Link
              to="/contact"
              className="font-nav text-xs uppercase tracking-wide text-primary hover:underline"
            >
              Contact us
            </Link>
            <a
              href={CONTACT.whatsapp.url}
              target="_blank"
              rel="noopener noreferrer"
              className="font-nav text-xs uppercase tracking-wide text-primary hover:underline"
            >
              WhatsApp support
            </a>
          </div>
        </div>
      </section>
    </>
  );
};

export default Policies;
