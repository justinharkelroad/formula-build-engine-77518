import { useState } from 'react';
import VideoThumbnailCard from './VideoThumbnailCard';
import VideoModal from './VideoModal';

const VideoTestimonialsGrid = () => {
  const [selectedVideo, setSelectedVideo] = useState<number | null>(null);

  const videoTestimonials = [
    {
      videoSrc: 'https://www.youtube.com/embed/BbpXNx7Jixo',
      posterSrc: 'https://img.youtube.com/vi/BbpXNx7Jixo/hqdefault.jpg',
      name: 'Melissa',
      title: 'Tennessee'
    },
    {
      videoSrc: 'https://www.youtube.com/embed/qnjwHng6MZ0',
      posterSrc: 'https://img.youtube.com/vi/qnjwHng6MZ0/hqdefault.jpg',
      name: 'Kelly',
      title: 'Pennsylvania'
    },
    {
      videoSrc: 'https://www.youtube.com/embed/nxEutmCrBm0',
      posterSrc: 'https://img.youtube.com/vi/nxEutmCrBm0/hqdefault.jpg',
      name: 'Anthony',
      title: 'Virginia'
    },
    {
      videoSrc: 'https://www.youtube.com/embed/wvutVhMg-zM',
      posterSrc: 'https://img.youtube.com/vi/wvutVhMg-zM/hqdefault.jpg',
      name: 'Jay',
      title: 'Florida'
    },
    {
      videoSrc: 'https://www.youtube.com/embed/RRBQd4dQJo0',
      posterSrc: 'https://img.youtube.com/vi/RRBQd4dQJo0/hqdefault.jpg',
      name: 'Cody',
      title: 'Texas'
    },
    {
      videoSrc: 'https://www.youtube.com/embed/SR_9T5S6BeI',
      posterSrc: 'https://img.youtube.com/vi/SR_9T5S6BeI/hqdefault.jpg',
      name: 'Romilee',
      title: 'Louisiana'
    },
    {
      videoSrc: 'https://www.youtube.com/embed/-58mxGklI8k',
      posterSrc: 'https://img.youtube.com/vi/-58mxGklI8k/hqdefault.jpg',
      name: 'John',
      title: 'Florida'
    },
    {
      videoSrc: 'https://www.youtube.com/embed/g0lNoUA6V04',
      posterSrc: 'https://img.youtube.com/vi/g0lNoUA6V04/hqdefault.jpg',
      name: 'Kim',
      title: 'Florida'
    },
    {
      videoSrc: 'https://www.youtube.com/embed/Z43PeAOFQyw',
      posterSrc: 'https://img.youtube.com/vi/Z43PeAOFQyw/hqdefault.jpg',
      name: 'Mike',
      title: 'Florida'
    },
    {
      videoSrc: 'https://www.youtube.com/embed/N-FFSaNgkXw',
      posterSrc: 'https://img.youtube.com/vi/N-FFSaNgkXw/hqdefault.jpg',
      name: 'Steve',
      title: 'Maine'
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
