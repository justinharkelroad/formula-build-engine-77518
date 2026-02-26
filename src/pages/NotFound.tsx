import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { Helmet } from "react-helmet-async";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <Helmet>
        <title>Page Not Found — Formula Forum 2026</title>
        <meta name="description" content="The page you are looking for does not exist. Navigate to the Formula Forum homepage, agenda, pricing, or FAQ." />
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>
      <div className="text-center max-w-lg px-4">
        <h1 className="text-6xl font-bold text-primary mb-4">404</h1>
        <p className="text-xl text-muted-foreground mb-8">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="flex flex-wrap gap-3 justify-center">
          <Link to="/" className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:opacity-90 transition-opacity">
            Homepage
          </Link>
          <Link to="/agenda" className="px-4 py-2 bg-muted text-foreground rounded-md hover:bg-muted/80 transition-colors">
            Agenda
          </Link>
          <Link to="/pricing" className="px-4 py-2 bg-muted text-foreground rounded-md hover:bg-muted/80 transition-colors">
            Pricing
          </Link>
          <Link to="/faq" className="px-4 py-2 bg-muted text-foreground rounded-md hover:bg-muted/80 transition-colors">
            FAQ
          </Link>
          <Link to="/contact" className="px-4 py-2 bg-muted text-foreground rounded-md hover:bg-muted/80 transition-colors">
            Contact
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
