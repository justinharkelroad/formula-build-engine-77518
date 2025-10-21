const Footer = () => {
  return (
    <footer className="border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-muted-foreground">
            Formula Forum is an insurance agency event. Not affiliated with any Florida policy forum.
          </p>
          <div className="flex flex-wrap gap-4 text-sm justify-center md:justify-end">
            <a href="/agenda" className="text-muted-foreground hover:text-foreground underline underline-offset-4">
              Agenda
            </a>
            <a href="/speakers" className="text-muted-foreground hover:text-foreground underline underline-offset-4">
              Speakers
            </a>
            <a href="/pricing" className="text-muted-foreground hover:text-foreground underline underline-offset-4">
              Pricing
            </a>
            <a href="/venue" className="text-muted-foreground hover:text-foreground underline underline-offset-4">
              Venue
            </a>
            <a href="/partners" className="text-muted-foreground hover:text-foreground underline underline-offset-4">
              Partners
            </a>
            <a href="/faq" className="text-muted-foreground hover:text-foreground underline underline-offset-4">
              FAQ
            </a>
            <a href="/contact" className="text-muted-foreground hover:text-foreground underline underline-offset-4">
              Contact
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;