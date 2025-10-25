import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import f3Logo from '@/assets/f3-logo.png';

const UndefinedNavigation = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (sectionId: string) => {
    if (location.pathname === '/') {
      const element = document.getElementById(sectionId);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
        return;
      }
    }
    navigate('/', { state: { scrollTo: sectionId } });
  };

  return (
    <header
      className={`fixed top-4 left-1/2 -translate-x-1/2 z-50 transition-all duration-300 ${
        isScrolled ? 'scale-90' : 'scale-100'
      }`}
    >
      <nav className="bg-white/10 backdrop-blur-md rounded-full px-6 py-3 flex items-center gap-8 border border-white/20">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <img src={f3Logo} alt="Formula Forum" className="h-10 w-10 object-contain" />
        </div>

        {/* Navigation Links */}
        <div className="hidden md:flex items-center gap-6 text-white/90 text-sm font-medium">
          <button onClick={() => scrollToSection('about')} className="hover:text-white transition cursor-hover">
            about
          </button>
          <span className="text-white/30">|</span>
          <button onClick={() => scrollToSection('event')} className="hover:text-white transition cursor-hover">
            event
          </button>
          <span className="text-white/30">|</span>
          <button onClick={() => scrollToSection('location')} className="hover:text-white transition cursor-hover">
            location
          </button>
        </div>

        {/* CTA Buttons */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/contact')}
            className="bg-[#FF8C42] hover:bg-[#FF7A2E] text-white px-6 py-2 rounded-full text-sm font-semibold transition cursor-hover"
          >
            contact us
          </button>
          <button className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition cursor-hover">
            <ArrowRight className="w-5 h-5 text-white" />
          </button>
        </div>
      </nav>
    </header>
  );
};

export default UndefinedNavigation;
