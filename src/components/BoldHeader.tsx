import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Menu, X, ArrowUpRight } from "lucide-react";
import f3Logo from "@/assets/f3-logo.png";
import { usePassDialog } from "@/contexts/PassDialogContext";

const navItems = [
  { label: "about", sectionId: "about", path: "/" },
  { label: "schedule", sectionId: "schedule", path: "/" },
  { label: "venue", sectionId: "venue", path: "/" },
  { label: "partners", sectionId: null, path: "/partners" },
  { label: "photos", sectionId: null, path: "/gallery" }
];

const BoldHeader = () => {
  const [isMenuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { open: openPassDialog } = usePassDialog();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 30);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleNav = (item: typeof navItems[number]) => {
    setMenuOpen(false);
    if (item.sectionId && location.pathname === "/") {
      document.getElementById(item.sectionId)?.scrollIntoView({ behavior: "smooth" });
      return;
    }
    if (item.sectionId) {
      navigate("/", { state: { scrollTo: item.sectionId } });
      return;
    }
    navigate(item.path);
  };

  return (
    <>
      {/* CENTER FLOATING NAV PILL */}
      <header
        className={`fixed top-4 left-1/2 -translate-x-1/2 z-40 transition-all duration-300
          ${scrolled ? "scale-95" : "scale-100"}`}
      >
        <nav className="flex items-center gap-1 bg-black/85 backdrop-blur-md border border-white/10 rounded-full pl-2 pr-2 py-2">
          {/* Logo */}
          <button
            onClick={() => navigate("/")}
            className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-white/5 transition-colors"
            aria-label="Formula Forum home"
          >
            <img src={f3Logo} alt="Formula" className="h-7 w-7 object-contain" />
          </button>

          {/* Inline nav (desktop) */}
          <div className="hidden md:flex items-center gap-1 px-2 text-sm text-white/80">
            {navItems.map((item, i) => (
              <div key={item.label} className="flex items-center gap-1">
                {i > 0 && <span className="text-white/15">|</span>}
                <button
                  onClick={() => handleNav(item)}
                  className="px-3 py-1.5 rounded-full hover:bg-white/10 hover:text-white transition-colors"
                >
                  {item.label}
                </button>
              </div>
            ))}
          </div>

          {/* Hamburger (always visible — replicates reference behavior) */}
          <button
            onClick={() => setMenuOpen(!isMenuOpen)}
            className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
            aria-label="Open menu"
          >
            {isMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
        </nav>
      </header>

      {/* TOP-RIGHT FLOATING BUY TICKET PILL */}
      <button
        onClick={() => openPassDialog("earlyBird")}
        className="fixed top-6 right-6 z-40 inline-flex items-center gap-2
          bg-white text-black px-5 py-2.5 rounded-full text-sm font-semibold
          hover:bg-[hsl(var(--secondary))] hover:text-white transition-colors
          shadow-lg shadow-black/40"
      >
        BUY TICKET
        <ArrowUpRight className="w-4 h-4" />
      </button>

      {/* MOBILE / FULL-SCREEN MENU OVERLAY */}
      {isMenuOpen && (
        <div className="fixed inset-0 z-30">
          <div
            className="absolute inset-0 bg-black/90 backdrop-blur-sm"
            onClick={() => setMenuOpen(false)}
          />
          <div className="absolute inset-x-0 top-24 mx-auto w-[92%] max-w-md
            bg-black border border-white/15 rounded-3xl p-6">
            <div className="eyebrow mb-4">MENU</div>
            <div className="flex flex-col">
              {navItems.map((item) => (
                <button
                  key={item.label}
                  onClick={() => handleNav(item)}
                  className="text-left py-3 text-lg font-medium text-white/80 hover:text-white border-b border-white/10 last:border-b-0 capitalize"
                >
                  {item.label}
                </button>
              ))}
              <button
                onClick={() => {
                  setMenuOpen(false);
                  openPassDialog("earlyBird");
                }}
                className="mt-6 inline-flex items-center justify-center gap-2 bg-white text-black px-5 py-3 rounded-full font-semibold hover:bg-[hsl(var(--secondary))] hover:text-white transition-colors"
              >
                BUY TICKET
                <ArrowUpRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default BoldHeader;
