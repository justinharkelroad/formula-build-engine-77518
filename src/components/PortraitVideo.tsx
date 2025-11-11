import { useEffect, useRef } from 'react';

interface PortraitVideoProps {
  mediaId: string;
}

const PortraitVideo = ({ mediaId }: PortraitVideoProps) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Load Wistia player script
    const script1 = document.createElement('script');
    script1.src = 'https://fast.wistia.com/player.js';
    script1.async = true;
    document.head.appendChild(script1);

    // Load Wistia embed script
    const script2 = document.createElement('script');
    script2.src = `https://fast.wistia.com/embed/${mediaId}.js`;
    script2.async = true;
    script2.type = 'module';
    document.head.appendChild(script2);

    return () => {
      if (document.head.contains(script1)) document.head.removeChild(script1);
      if (document.head.contains(script2)) document.head.removeChild(script2);
    };
  }, [mediaId]);

  useEffect(() => {
    if (containerRef.current) {
      const player = document.createElement('wistia-player');
      player.setAttribute('media-id', mediaId);
      player.setAttribute('aspect', '0.5625');
      player.className = 'rounded-lg shadow-elegant overflow-hidden';
      containerRef.current.appendChild(player);

      return () => {
        if (containerRef.current?.contains(player)) {
          containerRef.current.removeChild(player);
        }
      };
    }
  }, [mediaId]);

  return (
    <div className="relative w-full max-w-md mx-auto lg:mx-0 h-full flex items-center">
      <style>{`
        wistia-player[media-id='${mediaId}']:not(:defined) { 
          background: center / contain no-repeat url('https://fast.wistia.com/embed/medias/${mediaId}/swatch'); 
          display: block; 
          filter: blur(5px); 
          padding-top: 177.78%; 
        }
      `}</style>
      <div ref={containerRef} className="w-full" />
    </div>
  );
};

export default PortraitVideo;
