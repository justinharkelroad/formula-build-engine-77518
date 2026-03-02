import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { trackFAQExpand } from '@/hooks/useAnalytics';

const FAQAccordion = () => {
  const faqs = [
    {
      q: "Are tickets refundable?",
      a: "No. All ticket sales for Formula Forum are final and non-refundable. However, you can transfer your ticket to another person up to 7 days before the event at no additional cost by contacting the Formula Forum team."
    },
    {
      q: "How do I book the hotel room block?",
      a: "Book the Formula Forum room block at the JW Marriott Orlando Bonnet Creek by using the room-block link on the Venue page or by calling the hotel at +1 (407) 390-5000 and mentioning code F3-2025. The group rate is $239 per night. The cut-off date is September 15, 2026."
    },
    {
      q: "What is the dress code?",
      a: "Business casual is the recommended dress code for all Formula Forum sessions and networking events. Comfortable shoes are encouraged, as the Format Framework includes active breakout sessions throughout each day."
    },
    {
      q: "Can I transfer my ticket?",
      a: "Yes, tickets are transferable until October 7, 2026. Simply contact the Formula Forum team with the new attendee's information and they will handle the transfer at no additional cost."
    },
    {
      q: "Is there a group discount?",
      a: "Yes. Teams of five or more people save 20% on registration. Email Gregg@f3florida.com for a custom group discount code. Group registrations are a popular option for agency owners bringing their full team."
    },
    {
      q: "What's included in the registration fee?",
      a: "Your Formula Forum registration includes access to all speaker sessions and general sessions, small-group breakout sessions, the printed Book of Formulas playbook with action maps from every speaker, networking events including the welcome reception and rooftop party, meals during the conference (breakfast and lunch), and an optional morning group workout."
    },
    {
      q: "Will sessions be recorded?",
      a: "No. For the privacy and engagement of all attendees, Formula Forum sessions are not recorded. This policy ensures open, honest discussions and protects the confidential strategies shared by speakers and fellow attendees during breakout sessions."
    },
    {
      q: "What should I bring?",
      a: "Bring business cards for networking and a laptop for the interactive workshop sessions. All conference materials, tools, and the printed Book of Formulas playbook will be provided. A positive attitude and readiness to take action are also encouraged."
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
                <AccordionContent className="text-muted-foreground leading-relaxed" data-speakable="true">
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
