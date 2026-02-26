import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-muted-foreground">
            Formula Forum is an insurance agency event. Not affiliated with any Florida policy forum.
          </p>
          <div className="flex flex-wrap gap-4 text-sm justify-center md:justify-end">
            <Link to="/agenda" className="text-muted-foreground hover:text-foreground underline underline-offset-4">
              Agenda
            </Link>
            <Link to="/speakers" className="text-muted-foreground hover:text-foreground underline underline-offset-4">
              Speakers
            </Link>
            <Link to="/pricing" className="text-muted-foreground hover:text-foreground underline underline-offset-4">
              Pricing
            </Link>
            <Link to="/venue" className="text-muted-foreground hover:text-foreground underline underline-offset-4">
              Venue
            </Link>
            <Link to="/partners" className="text-muted-foreground hover:text-foreground underline underline-offset-4">
              Partners
            </Link>
            <Link to="/faq" className="text-muted-foreground hover:text-foreground underline underline-offset-4">
              FAQ
            </Link>
            <Link to="/contact" className="text-muted-foreground hover:text-foreground underline underline-offset-4">
              Contact
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
