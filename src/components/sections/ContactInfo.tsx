import { MapPin, Mail, Phone } from "lucide-react";

const ContactInfo = () => {
  return (
    <section className="py-16 bg-background">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12 text-foreground">
            Get In Touch
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            <div className="text-center">
              <MapPin className="text-primary mx-auto mb-4" size={48} />
              <h3 className="text-xl font-semibold mb-2 text-foreground">Address</h3>
              <p className="text-muted-foreground">
                14900 Chelonia Pkwy<br />
                Orlando, FL 32821
              </p>
            </div>
            
            <div className="text-center">
              <Mail className="text-primary mx-auto mb-4" size={48} />
              <h3 className="text-xl font-semibold mb-2 text-foreground">Email</h3>
              <a 
                href="mailto:Ashleeb@f3florida.com" 
                className="text-primary hover:underline"
              >
                Ashleeb@f3florida.com
              </a>
            </div>
            
            <div className="text-center">
              <Phone className="text-primary mx-auto mb-4" size={48} />
              <h3 className="text-xl font-semibold mb-2 text-foreground">Phone</h3>
              <a 
                href="tel:+15619062000" 
                className="text-primary hover:underline"
              >
                (561) 906-2000
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ContactInfo;