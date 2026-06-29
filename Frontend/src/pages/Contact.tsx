import { motion } from "framer-motion";
import { ExternalLink, Mail, MapPin, MessageCircle } from "lucide-react";
import SocialLinks from "@/components/SocialLinks";
import { CONTACT } from "@/lib/contact";

const contactCards = [
  {
    icon: MapPin,
    title: "Our Location",
    description: "Visit us in store or get directions on Google Maps.",
    action: {
      label: CONTACT.location.label,
      href: CONTACT.location.url,
      external: true,
    },
  },
  {
    icon: MessageCircle,
    title: "WhatsApp",
    description: "Message us for orders, product questions, or support.",
    action: {
      label: CONTACT.whatsapp.display,
      href: CONTACT.whatsapp.url,
      external: true,
    },
  },
  {
    icon: Mail,
    title: "Email",
    description: "Reach our team for business inquiries and customer care.",
    action: {
      label: CONTACT.email.address,
      href: CONTACT.email.mailto,
      external: false,
    },
  },
];

const Contact = () => {
  return (
    <>
      <section className="border-b border-border bg-gradient-to-b from-muted/40 to-background py-16 md:py-20">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mx-auto max-w-3xl text-center"
          >
            <p className="text-label mb-3">Get in touch</p>
            <h1 className="mb-5 font-display text-4xl text-foreground md:text-5xl">Contact Us</h1>
            <p className="font-body text-base leading-relaxed text-muted-foreground md:text-lg">
              We&apos;re here to help with orders, styling advice, and anything about Ateeqo bags
              &amp; accessories.
            </p>
          </motion.div>
        </div>
      </section>

      <section className="container py-14 md:py-16">
        <div className="grid gap-6 md:grid-cols-3">
          {contactCards.map((card, index) => (
            <motion.div
              key={card.title}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.08 }}
              className="rounded-2xl border border-border bg-background p-6 md:p-8"
            >
              <card.icon className="mb-4 text-primary" size={24} strokeWidth={1.75} />
              <h2 className="mb-2 font-display text-xl text-foreground">{card.title}</h2>
              <p className="mb-5 font-body text-sm leading-relaxed text-muted-foreground">
                {card.description}
              </p>
              <a
                href={card.action.href}
                target={card.action.external ? "_blank" : undefined}
                rel={card.action.external ? "noopener noreferrer" : undefined}
                className="inline-flex items-center gap-1.5 font-nav text-xs uppercase tracking-wide text-primary transition-colors hover:text-primary/80"
              >
                {card.action.label}
                {card.action.external && <ExternalLink size={12} />}
              </a>
            </motion.div>
          ))}
        </div>
      </section>

      <section className="border-t border-border bg-muted/15 py-14 md:py-16">
        <div className="container max-w-2xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <p className="text-label mb-2">Follow us</p>
            <h2 className="mb-3 font-display text-3xl text-foreground">Stay connected</h2>
            <p className="mb-8 font-body text-sm text-muted-foreground md:text-base">
              New arrivals, offers, and style inspiration on our social channels.
            </p>
            <div className="flex justify-center">
              <SocialLinks
                iconClassName="flex h-11 w-11 items-center justify-center rounded-full border border-border bg-background text-foreground/70 transition-colors hover:border-primary hover:text-primary"
              />
            </div>
          </motion.div>
        </div>
      </section>
    </>
  );
};

export default Contact;
