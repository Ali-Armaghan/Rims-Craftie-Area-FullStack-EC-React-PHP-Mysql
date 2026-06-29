import { Facebook, Instagram } from "lucide-react";
import { CONTACT } from "@/lib/contact";

const TikTokIcon = ({ size = 16 }: { size?: number }) => (
  <svg
    viewBox="0 0 24 24"
    aria-hidden
    width={size}
    height={size}
    fill="currentColor"
  >
    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.27 6.27 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.69a8.18 8.18 0 0 0 4.77 1.52V6.76a4.85 4.85 0 0 1-1-.07z" />
  </svg>
);

export const socialLinkItems = [
  { label: "Facebook", href: CONTACT.social.facebook, icon: Facebook },
  { label: "Instagram", href: CONTACT.social.instagram, icon: Instagram },
  { label: "TikTok", href: CONTACT.social.tiktok, icon: TikTokIcon },
] as const;

type SocialLinksProps = {
  className?: string;
  iconClassName?: string;
};

const SocialLinks = ({ className = "", iconClassName = "" }: SocialLinksProps) => (
  <div className={`flex items-center gap-3 ${className}`}>
    {socialLinkItems.map(({ label, href, icon: Icon }) => (
      <a
        key={label}
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={label}
        className={
          iconClassName ||
          "flex h-9 w-9 items-center justify-center rounded-full border border-primary-foreground/25 text-primary-foreground/70 transition-colors hover:border-primary-foreground/50 hover:bg-primary-foreground/10 hover:text-primary-foreground"
        }
      >
        <Icon size={16} strokeWidth={1.75} />
      </a>
    ))}
  </div>
);

export default SocialLinks;
