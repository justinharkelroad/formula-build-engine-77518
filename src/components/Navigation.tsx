import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";
import { useState } from "react";
import PassTypeDialog from "@/components/PassTypeDialog";

const Navigation = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  const navItems = [
    { href: "/", label: "Home" },
    { href: "/agenda", label: "Agenda" },
    { href: "/pricing", label: "Pricing" },
    { href: "/speakers", label: "Speakers" },
    { href: "/venue", label: "Venue" },
    { href: "/partners", label: "Partners" },
    { href: "/gallery", label: "Photos" },
    { href: "/faq", label: "FAQ" },
    { href: "/contact", label: "Contact" },
  ];

  return (
    <nav className="sticky top-0 z-50 bg-white shadow-sm border-b">
      <div className="container mx-auto px-4 relative">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center">
            <img src="/lovable-uploads/98ddc4b5-a053-48ca-989b-0e1cfae3d8dd.png" alt="F³ Formula Forum 2026 logo" className="h-8" width="120" height="32" fetchPriority="high" />
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => (
              <Link
                key={item.href}
                to={item.href}
                className={`text-foreground hover:text-primary transition-colors ${
                  location.pathname === item.href ? 'text-primary font-medium' : ''
                }`}
              >
                {item.label}
              </Link>
            ))}
            <PassTypeDialog />
            <Link
              to="/admin/auth"
              className="text-sm text-muted-foreground hover:text-primary transition-colors"
            >
              Admin
            </Link>
          </div>

          {/* Mobile menu button */}
          <button
            type="button"
            className="md:hidden p-2 text-foreground hover:text-primary transition-colors z-50"
            onClick={() => setIsOpen(!isOpen)}
            aria-label="Toggle menu"
            aria-expanded={isOpen}
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden absolute top-full left-0 right-0 z-40 bg-white border-t shadow-lg max-h-[calc(100vh-4rem)] overflow-y-auto">
              <div className="flex flex-col space-y-4 px-4 py-6">
                {navItems.map((item) => (
                  <Link
                    key={item.href}
                    to={item.href}
                    className={`text-foreground hover:text-primary transition-colors py-2 ${
                      location.pathname === item.href ? 'text-primary font-medium' : ''
                    }`}
                    onClick={() => setIsOpen(false)}
                  >
                    {item.label}
                  </Link>
                ))}
                <div className="pt-4 border-t">
                  <PassTypeDialog />
                </div>
                <Link
                  to="/admin/auth"
                  className="text-sm text-muted-foreground hover:text-primary transition-colors py-2"
                  onClick={() => setIsOpen(false)}
                >
                  Admin
                </Link>
              </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navigation;