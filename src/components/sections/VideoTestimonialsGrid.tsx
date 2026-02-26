import { useState, useEffect, useRef } from 'react';
import VideoThumbnailCard from './VideoThumbnailCard';
import VideoModal from './VideoModal';

const VideoTestimonialsGrid = () => {
  const [selectedVideo, setSelectedVideo] = useState<number | null>(null);
  const sectionRef = useRef<HTMLElement>(null);

  const videoTestimonials = [
    { videoSrc: 'https://www.youtube.com/embed/BbpXNx7Jixo', posterSrc: 'https://img.youtube.com/vi/BbpXNx7Jixo/hqdefault.jpg', name: 'Melissa', title: 'Tennessee', slug: 'melissa' },
    { videoSrc: 'https://www.youtube.com/embed/qnjwHng6MZ0', posterSrc: 'https://img.youtube.com/vi/qnjwHng6MZ0/hqdefault.jpg', name: 'Kelly', title: 'Pennsylvania', slug: 'kelly' },
    { videoSrc: 'https://www.youtube.com/embed/nxEutmCrBm0', posterSrc: 'https://img.youtube.com/vi/nxEutmCrBm0/hqdefault.jpg', name: 'Anthony', title: 'Virginia', slug: 'anthony' },
    { videoSrc: 'https://www.youtube.com/embed/wvutVhMg-zM', posterSrc: 'https://img.youtube.com/vi/wvutVhMg-zM/hqdefault.jpg', name: 'Jay', title: 'Florida', slug: 'jay' },
    { videoSrc: 'https://www.youtube.com/embed/RRBQd4dQJo0', posterSrc: 'https://img.youtube.com/vi/RRBQd4dQJo0/hqdefault.jpg', name: 'Cody', title: 'Texas', slug: 'cody' },
    { videoSrc: 'https://www.youtube.com/embed/SR_9T5S6BeI', posterSrc: 'https://img.youtube.com/vi/SR_9T5S6BeI/hqdefault.jpg', name: 'Romilee', title: 'Louisiana', slug: 'romilee' },
    { videoSrc: 'https://www.youtube.com/embed/-58mxGklI8k', posterSrc: 'https://img.youtube.com/vi/-58mxGklI8k/hqdefault.jpg', name: 'John', title: 'Florida', slug: 'john' },
    { videoSrc: 'https://www.youtube.com/embed/g0lNoUA6V04', posterSrc: 'https://img.youtube.com/vi/g0lNoUA6V04/hqdefault.jpg', name: 'Kim', title: 'Florida', slug: 'kim' },
    { videoSrc: 'https://www.youtube.com/embed/Z43PeAOFQyw', posterSrc: 'https://img.youtube.com/vi/Z43PeAOFQyw/hqdefault.jpg', name: 'Mike', title: 'Florida', slug: 'mike' },
    { videoSrc: 'https://www.youtube.com/embed/N-FFSaNgkXw', posterSrc: 'https://img.youtube.com/vi/N-FFSaNgkXw/hqdefault.jpg', name: 'Steve', title: 'Maine', slug: 'steve' },
    { videoSrc: 'https://www.youtube.com/embed/KieUmx_iC-c', posterSrc: 'https://img.youtube.com/vi/KieUmx_iC-c/hqdefault.jpg', name: 'Ladd', title: 'Florida', slug: 'ladd' },
    { videoSrc: 'https://www.youtube.com/embed/Y_l0ivxt8zg', posterSrc: 'https://img.youtube.com/vi/Y_l0ivxt8zg/hqdefault.jpg', name: 'Lisa', title: 'Florida', slug: 'lisa' },
    { videoSrc: 'https://www.youtube.com/embed/5Em3NPtlTUs', posterSrc: 'https://img.youtube.com/vi/5Em3NPtlTUs/hqdefault.jpg', name: 'Sean', title: 'Florida', slug: 'sean' },
    { videoSrc: 'https://www.youtube.com/embed/NOLMVH50QYM', posterSrc: 'https://img.youtube.com/vi/NOLMVH50QYM/hqdefault.jpg', name: 'Jeff', title: 'Florida', slug: 'jeff' },
    { videoSrc: 'https://www.youtube.com/embed/jazyZ8OoX8w', posterSrc: 'https://img.youtube.com/vi/jazyZ8OoX8w/hqdefault.jpg', name: 'Craig', title: 'Florida', slug: 'craig' },
  ];

  // Read hash on mount to deep-link to a video
  useEffect(() => {
    const hash = window.location.hash;
    const match = hash.match(/^#video=(.+)$/);
    if (match) {
      const slug = match[1].toLowerCase();
      const index = videoTestimonials.findIndex(v => v.slug === slug);
      if (index !== -1) {
        setTimeout(() => {
          sectionRef.current?.scrollIntoView({ behavior: 'smooth' });
          setSelectedVideo(index);
        }, 300);
      }
    }
  }, []);

  const handleVideoClick = (index: number) => {
    setSelectedVideo(index);
    window.location.hash = `video=${videoTestimonials[index].slug}`;
  };

  const handleCloseModal = () => {
    setSelectedVideo(null);
    history.replaceState(null, '', window.location.pathname);
  };

  return (
    <section ref={sectionRef} className="py-20 md:py-32 bg-black relative overflow-hidden">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12 md:mb-16">
          <p className="text-secondary text-sm uppercase tracking-wider mb-4">
            [ TESTIMONIALS ]
          </p>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4">
            This Conference Feels Like{' '}
            <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Home
            </span>
          </h2>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6 max-w-6xl mx-auto">
          {videoTestimonials.map((video, index) => (
            <VideoThumbnailCard
              key={index}
              posterSrc={video.posterSrc}
              name={video.name}
              title={video.title}
              onClick={() => handleVideoClick(index)}
            />
          ))}
        </div>
      </div>

      {selectedVideo !== null && (
        <VideoModal
          isOpen={selectedVideo !== null}
          onClose={handleCloseModal}
          videoSrc={videoTestimonials[selectedVideo].videoSrc}
          posterSrc={videoTestimonials[selectedVideo].posterSrc}
          name={videoTestimonials[selectedVideo].name}
          title={videoTestimonials[selectedVideo].title}
        />
      )}
    </section>
  );
};

export default VideoTestimonialsGrid;
