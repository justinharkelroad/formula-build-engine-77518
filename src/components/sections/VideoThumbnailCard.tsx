import { Play } from 'lucide-react';

interface VideoThumbnailCardProps {
  posterSrc: string;
  name: string;
  title: string;
  onClick: () => void;
}

const VideoThumbnailCard = ({ posterSrc, name, title, onClick }: VideoThumbnailCardProps) => {
  return (
    <div
      onClick={onClick}
      className="relative w-full aspect-[9/16] rounded-2xl overflow-hidden border border-white/10 transition-transform duration-300 hover:scale-105 cursor-hover group"
    >
      {/* Poster Image */}
      <img
        src={posterSrc}
        alt={`${name} testimonial`}
        className="w-full h-full object-cover"
      />

      {/* Play Button Overlay - Always Visible */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-20 h-20 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center transition-transform duration-300 group-hover:scale-110">
          <Play className="w-10 h-10 text-primary ml-1" fill="currentColor" />
        </div>
      </div>

      {/* Bottom Gradient Overlay */}
      <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-black via-black/50 to-transparent pointer-events-none" />

      {/* Name and Title */}
      <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
        <p className="font-bold text-sm md:text-base mb-1">{name}</p>
        <p className="text-xs md:text-sm text-white/70">{title}</p>
      </div>
    </div>
  );
};

export default VideoThumbnailCard;
