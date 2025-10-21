import { Quote, Star } from 'lucide-react';

interface TextTestimonialCardProps {
  quote: string;
  name: string;
  location: string;
  rating?: number;
}

const TextTestimonialCard = ({ quote, name, location, rating = 5 }: TextTestimonialCardProps) => {
  return (
    <div className="w-[280px] md:w-[320px] h-[500px] rounded-3xl border border-white/10 bg-white/5 backdrop-blur-md hover:bg-white/10 transition-all duration-300 p-8 flex flex-col justify-between cursor-hover">
      {/* Quote Icon */}
      <div>
        <Quote className="w-12 h-12 mb-6 text-primary" fill="currentColor" />
        
        {/* Quote Text */}
        <blockquote className="text-white text-lg leading-relaxed mb-6">
          "{quote}"
        </blockquote>
      </div>

      {/* Bottom Section */}
      <div>
        {/* Star Rating */}
        <div className="flex gap-1 mb-4">
          {[...Array(rating)].map((_, i) => (
            <Star key={i} className="w-5 h-5 text-primary" fill="currentColor" />
          ))}
        </div>

        {/* Name and Location */}
        <div>
          <p className="font-bold text-white text-lg mb-1">{name}</p>
          <p className="text-white/70 text-sm">{location}</p>
        </div>
      </div>
    </div>
  );
};

export default TextTestimonialCard;
