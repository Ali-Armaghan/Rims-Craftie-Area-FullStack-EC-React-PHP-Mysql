import { CONTACT } from "@/lib/contact";

type WhatsAppOrderDetails = {
  productName: string;
  price: number;
  quantity: number;
  selectedOption?: string;
  productUrl?: string;
  category?: string;
};

export function buildWhatsAppOrderUrl(details: WhatsAppOrderDetails): string {
  const total = details.price * details.quantity;
  const lines = [
    "Hello Craftie._.Area! I would like to order:",
    "",
    `Product: ${details.productName}`,
    ...(details.category ? [`Category: ${details.category}`] : []),
    `Price: Rs. ${details.price.toLocaleString()}`,
    `Quantity: ${details.quantity}`,
    ...(details.selectedOption && details.selectedOption !== "Default"
      ? [`Color: ${details.selectedOption}`]
      : []),
    `Total: Rs. ${total.toLocaleString()}`,
    ...(details.productUrl ? [`Link: ${details.productUrl}`] : []),
  ];

  return `${CONTACT.whatsapp.url}?text=${encodeURIComponent(lines.join("\n"))}`;
}
