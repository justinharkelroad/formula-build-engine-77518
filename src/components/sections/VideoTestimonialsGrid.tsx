import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { TESTIMONIAL_STORIES } from '@/config/testimonialStories';
import VideoThumbnailCard from './VideoThumbnailCard';
import VideoModal from './VideoModal';

const videoTestimonials = TESTIMONIAL_STORIES.map((story) => ({
  videoSrc: `https://www.youtube.com/embed/${story.videoId}`,
  posterSrc: `https://img.youtube.com/vi/${story.videoId}/hqdefault.jpg`,
  name: story.name,
  title: story.location,
  slug: story.slug,
  storyPath: `/stories/${story.slug}`,
}));

const VideoTestimonialsGrid = () => {
  const [selectedVideo, setSelectedVideo] = useState<number | null>(null);
  const sectionRef = useRef<HTMLElement>(null);
  const navigate = useNavigate();

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
    const storyPath = videoTestimonials[index].storyPath;
    if (storyPath) {
      navigate(storyPath);
      return;
    }

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
