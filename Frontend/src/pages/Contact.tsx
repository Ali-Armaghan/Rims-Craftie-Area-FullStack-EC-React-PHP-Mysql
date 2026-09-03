import { useState } from "react";
import { motion } from "framer-motion";
import { ExternalLink, Mail, MapPin, MessageCircle, Send } from "lucide-react";
import SocialLinks from "@/components/SocialLinks";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";
import { CONTACT } from "@/lib/contact";
import { validatePhoneNumber } from "@/lib/phone-validation";
import { trackContact, trackLead } from "@/lib/meta-pixel";
import { trackGALead } from "@/lib/google-analytics";

const contactInfo = [
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

type ContactFormData = {
  name: string;
  phone: string;
  message: string;
};

const initialFormData: ContactFormData = {
  name: "",
  phone: "",
  message: "",
};

const Contact = () => {
  const [formData, setFormData] = useState<ContactFormData>(initialFormData);
  const [phoneTouched, setPhoneTouched] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const phoneValidation = validatePhoneNumber(formData.phone);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    if (name === "phone") {
      setPhoneTouched(true);
    }
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setPhoneTouched(true);

    if (!formData.name.trim() || !formData.phone.trim() || !formData.message.trim()) {
      toast({
        title: "Please fill all fields",
        description: "Name, phone, and message are required.",
        variant: "destructive",
      });
      return;
    }

    const check = validatePhoneNumber(formData.phone);
    if (!check.isValid) {
      toast({
        title: "Invalid phone number",
        description: check.message || "Please enter a valid phone number (e.g. 0300 1234567).",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // TODO: connect SMTP / contact API endpoint
      await new Promise((resolve) => setTimeout(resolve, 600));

      trackContact();
      trackLead();
      trackGALead("contact_form");

      toast({
        title: "Message sent",
        description: "Thank you for reaching out. Our team will get back to you soon.",
      });
      setFormData(initialFormData);
    } catch {
      toast({
        title: "Something went wrong",
        description: "Please try again or contact us on WhatsApp.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

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
        <div className="grid items-start gap-10 lg:grid-cols-[1fr_1.1fr] lg:gap-14">
          {/* Left — Contact info */}
          <motion.div
            initial={{ opacity: 0, x: -16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.05 }}
          >
            {/* <p className="text-label mb-3">Reach us directly</p>
            <h2 className="mb-3 font-display text-3xl text-foreground md:text-4xl">
              Contact Information
            </h2>
            <p className="mb-8 font-body text-sm leading-relaxed text-muted-foreground md:text-base">
              Prefer a quick reply? Use WhatsApp or email. You can also send us a message through
              the form — we&apos;ll respond as soon as possible.
            </p> */}

            <div className="space-y-4">
              {contactInfo.map((item, index) => (
                <motion.div
                  key={item.title}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 + index * 0.06 }}
                  className="rounded-2xl border border-border bg-background p-5 md:p-6"
                >
                  <item.icon className="mb-3 text-primary" size={22} strokeWidth={1.75} />
                  <h3 className="mb-1.5 font-display text-xl text-foreground">{item.title}</h3>
                  <p className="mb-4 font-body text-sm leading-relaxed text-muted-foreground">
                    {item.description}
                  </p>
                  <a
                    href={item.action.href}
                    target={item.action.external ? "_blank" : undefined}
                    rel={item.action.external ? "noopener noreferrer" : undefined}
                    className="inline-flex items-center gap-1.5 font-nav text-xs uppercase tracking-wide text-primary transition-colors hover:text-primary/80"
                  >
                    {item.action.label}
                    {item.action.external && <ExternalLink size={12} />}
                  </a>
                </motion.div>
              ))}
            </div>

            <div className="mt-8 rounded-2xl border border-border bg-muted/20 p-5 md:p-6">
              <p className="text-label mb-3">Follow us</p>
              <p className="mb-4 font-body text-sm text-muted-foreground">
                New arrivals, offers, and style inspiration on our social channels.
              </p>
              <SocialLinks
                iconClassName="flex h-10 w-10 items-center justify-center rounded-full border border-border bg-background text-foreground/70 transition-colors hover:border-primary hover:text-primary"
              />
            </div>
          </motion.div>

          {/* Right — Contact form */}
          <motion.div
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="rounded-2xl border border-border bg-background p-6 md:p-8 lg:sticky lg:top-24"
          >
            <p className="text-label mb-3">Send a message</p>
            <h2 className="mb-2 font-display text-3xl text-foreground">Write to us</h2>
            <p className="mb-8 font-body text-sm text-muted-foreground md:text-base">
              Fill in your details and we&apos;ll get back to you shortly.
            </p>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="name" className="font-nav text-xs uppercase tracking-wide">
                  Your Name
                </Label>
                <Input
                  id="name"
                  name="name"
                  type="text"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Enter your full name"
                  autoComplete="name"
                  required
                  className="h-11 rounded-lg border-border font-body"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone" className="font-nav text-xs uppercase tracking-wide">
                  Phone Number
                </Label>
                <Input
                  id="phone"
                  name="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={handleChange}
                  onBlur={() => setPhoneTouched(true)}
                  placeholder="e.g. 03XX XXXXXXX"
                  autoComplete="tel"
                  required
                  className={`h-11 rounded-lg font-body ${
                    phoneTouched && !phoneValidation.isValid && formData.phone.trim()
                      ? "border-destructive focus-visible:ring-destructive"
                      : "border-border"
                  }`}
                />
                {phoneTouched && !phoneValidation.isValid && formData.phone.trim() && (
                  <p className="font-body text-xs text-destructive">
                    {phoneValidation.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="message" className="font-nav text-xs uppercase tracking-wide">
                  Message
                </Label>
                <Textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  placeholder="How can we help you?"
                  rows={6}
                  required
                  className="min-h-[140px] resize-y rounded-lg border-border font-body"
                />
              </div>

              <Button
                type="submit"
                disabled={isSubmitting}
                className="h-11 w-full rounded-lg font-nav text-xs uppercase tracking-widest"
              >
                {isSubmitting ? "Sending..." : "Send Message"}
                {!isSubmitting && <Send size={16} />}
              </Button>
            </form>
          </motion.div>
        </div>
      </section>
    </>
  );
};

export default Contact;
