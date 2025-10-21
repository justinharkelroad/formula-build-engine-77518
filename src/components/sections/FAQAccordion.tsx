import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { trackFAQExpand } from '@/hooks/useAnalytics';

const FAQAccordion = () => {
  const faqs = [
    {
      q: "Are tickets refundable?",
      a: "No refunds. You can transfer a ticket to another person up to 7 days before the event."
    },
    {
      q: "How do I book the hotel room block?",
      a: "Use our room-block link on the Venue page or call the hotel with code F3-2025. Cut-off Sep 15, 2025."
    },
    {
      q: "What is the dress code?",
      a: "Business casual."
    },
    {
      q: "Can I transfer my ticket?",
      a: "Yes, tickets are transferable until October 1, 2025. Simply contact our team with the new attendee's information and we'll handle the transfer at no additional cost."
    },
    {
      q: "Is there a group discount?",
      a: "Yes! Teams of 5+ save 20% on registration. Email us at Gregg@f3florida.com for a custom group discount code."
    },
    {
      q: "What's included in the registration fee?",
      a: "Your registration includes access to all sessions, the printed playbook, networking events, meals during the conference, and the 90-day post-event challenge program."
    },
    {
      q: "Will sessions be recorded?",
      a: "For the privacy and engagement of our attendees, sessions are not recorded. This ensures open, honest discussions and protects the confidential strategies shared."
    },
    {
      q: "What should I bring?",
      a: "Bring a positive attitude, business cards, and be ready to take action! All materials and tools will be provided. We recommend bringing a laptop for the workshop sessions."
    }
  ];

  return (
    <section className="py-16 bg-muted/50">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12 text-foreground">
            Frequently Asked Questions
          </h2>
          
          <Accordion type="single" collapsible className="space-y-4">
            {faqs.map((faq, index) => (
              <AccordionItem 
                key={index} 
                value={`item-${index}`} 
                className="bg-white rounded-lg px-6"
              >
                <AccordionTrigger 
                  className="text-left font-semibold text-foreground hover:text-primary"
                  onClick={() => trackFAQExpand(faq.q)}
                >
                  {faq.q}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground leading-relaxed">
                  {faq.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  );
};

export default FAQAccordion;