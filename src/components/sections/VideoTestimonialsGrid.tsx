import { useState } from 'react';
import VideoThumbnailCard from './VideoThumbnailCard';
import VideoModal from './VideoModal';

const VideoTestimonialsGrid = () => {
  const [selectedVideo, setSelectedVideo] = useState<number | null>(null);

  const videoTestimonials = [
    {
      videoSrc: '/videos/testimonial-1.mp4',
      posterSrc: '/videos/testimonial-1-poster.jpg',
      name: 'John Doe',
      title: 'F³ Member, Tampa'
    },
    {
      videoSrc: '/videos/testimonial-2.mp4',
      posterSrc: '/videos/testimonial-2-poster.jpg',
      name: 'Mike Johnson',
      title: 'F³ Member, Orlando'
    },
    {
      videoSrc: '/videos/testimonial-3.mp4',
      posterSrc: '/videos/testimonial-3-poster.jpg',
      name: 'David Smith',
      title: 'F³ Member, Miami'
    },
    {
      videoSrc: '/videos/testimonial-4.mp4',
      posterSrc: '/videos/testimonial-4-poster.jpg',
      name: 'Chris Williams',
      title: 'F³ Member, Jacksonville'
    },
    {
      videoSrc: '/videos/testimonial-5.mp4',
      posterSrc: '/videos/testimonial-5-poster.jpg',
      name: 'Robert Brown',
      title: 'F³ Member, Fort Lauderdale'
    },
    {
      videoSrc: '/videos/testimonial-6.mp4',
      posterSrc: '/videos/testimonial-6-poster.jpg',
      name: 'James Davis',
      title: 'F³ Member, West Palm Beach'
    },
    {
      videoSrc: '/videos/testimonial-7.mp4',
      posterSrc: '/videos/testimonial-7-poster.jpg',
      name: 'Michael Wilson',
      title: 'F³ Member, Naples'
    },
    {
      videoSrc: '/videos/testimonial-8.mp4',
      posterSrc: '/videos/testimonial-8-poster.jpg',
      name: 'Thomas Garcia',
      title: 'F³ Member, Sarasota'
    },
    {
      videoSrc: '/videos/testimonial-9.mp4',
      posterSrc: '/videos/testimonial-9-poster.jpg',
      name: 'Daniel Martinez',
      title: 'F³ Member, Clearwater'
    }
  ];

  const handleVideoClick = (index: number) => {
    setSelectedVideo(index);
  };

  const handleCloseModal = () => {
    setSelectedVideo(null);
  };

  return (
    <section className="py-20 md:py-32 bg-black relative overflow-hidden">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-12 md:mb-16">
          <p className="text-secondary text-sm uppercase tracking-wider mb-4">
            [ TESTIMONIALS ]
          </p>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4">
            Hear from our{' '}
            <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              community
            </span>
          </h2>
        </div>

        {/* Video Grid */}
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

      {/* Video Modal */}
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
