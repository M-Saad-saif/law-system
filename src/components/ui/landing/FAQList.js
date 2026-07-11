import { motion } from "framer-motion";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/landingUI/accordion";
import { fadeUp } from "./motion";

export const faqs = [
  {
    q: "Do you offer a free trial?",
    a: "Yes — 7 days free trial. No credit card required.",
  },
  {
    q: "How do I pay?",
    a: "Pay by bank transfer, EasyPaisa, Raast. After payment attach proof (screenshot)",
  },
  {
    q: "When will my account activate after payment?",
    a: "Usually within 24 hours after verification.",
  },
  {
    q: "Do you offer refunds?",
    a: "No. Paid plans are strictly non-refundable. Use the 7-day free trial to test before paying.",
  },
  {
    q: "What happens when my plan expires?",
    a: "Access is suspended until renewal payment is received and verified.",
  },
  {
    q: "Can I add my team members?",
    a: "Yes. Multi-user access is available with roles and permissions.",
  },
  {
    q: "Can I download judgments and drafts?",
    a: "Yes. Judgments and drafts can be downloaded or exported where available.",
  },
  {
    q: "Can Legal Portal read my password?",
    a: "No. Passwords are stored in hashed form — we can't read them. (Its fully secure)",
  },
  {
    q: "Is this only for Pakistan?",
    a: "Built for Pakistan legal workflow (PPC/CrPC/FIR), but it can be used internationally too.",
  },
];

export default function FAQList({ items = faqs, limit }) {
  const list = limit ? items.slice(0, limit) : items;
  return (
    <motion.div
      variants={fadeUp}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      className="max-w-3xl mx-auto"
      data-testid="faq-list"
    >
      <Accordion type="single" collapsible className="space-y-3">
        {list.map((f, i) => (
          <AccordionItem
            key={f.q}
            value={`faq-${i}`}
            className="bg-white border border-[#053433]/8 rounded-2xl px-6 shadow-sm data-[state=open]:shadow-md"
            data-testid={`faq-item-${i}`}
          >
            <AccordionTrigger className="text-left font-semibold text-[#053433] hover:no-underline py-5">
              {f.q}
            </AccordionTrigger>
            <AccordionContent className="text-[#053433]/60 pb-5">
              {f.a}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </motion.div>
  );
}
