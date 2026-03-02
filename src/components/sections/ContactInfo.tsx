import { MapPin, Mail, Phone } from "lucide-react";
import { Link } from "react-router-dom";

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
                href="mailto:info@f3florida.com" 
                className="text-primary hover:underline"
              >
                info@f3florida.com
              </a>
            </div>
            
            <div className="text-center">
              <Phone className="text-primary mx-auto mb-4" size={48} />
              <h3 className="text-xl font-semibold mb-2 text-foreground">Phone</h3>
              <a 
                href="tel:+12605151349" 
                className="text-primary hover:underline"
              >
                (260) 515-1349
              </a>
            </div>
          </div>

          <div className="text-center mt-8 pt-8 border-t">
            <Link to="/privacy" className="text-sm text-muted-foreground hover:text-foreground underline underline-offset-4">
              Privacy Policy
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ContactInfo;