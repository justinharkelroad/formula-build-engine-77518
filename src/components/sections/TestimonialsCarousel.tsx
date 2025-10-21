import { Carousel, CarouselContent, CarouselItem } from '@/components/ui/carousel';
import VideoTestimonialCard from './VideoTestimonialCard';
import TextTestimonialCard from './TextTestimonialCard';

const TestimonialsCarousel = () => {
  const testimonials = [
    {
      type: 'video',
      videoSrc: '/videos/testimonial-1.mp4',
      posterSrc: '/videos/testimonial-1-poster.jpg',
      name: 'John Doe',
      title: 'F³ Member, Tampa'
    },
    {
      type: 'text',
      quote: 'F³ gave me a step-by-step plan to 2× my book in six months. The accountability and tactical strategies were game-changing.',
      name: 'Kory H.',
      location: '$16M Agency Owner'
    },
    {
      type: 'video',
      videoSrc: '/videos/testimonial-2.mp4',
      posterSrc: '/videos/testimonial-2-poster.jpg',
      name: 'Sarah Mitchell',
      title: 'Agency Owner, Orlando'
    },
    {
      type: 'text',
      quote: 'Best networking ROI of any conference I\'ve attended. The connections I made here have directly resulted in new partnerships and revenue.',
      name: 'Lisa P.',
      location: 'Allstate Agency, Tampa'
    },
    {
      type: 'video',
      videoSrc: '/videos/testimonial-3.mp4',
      posterSrc: '/videos/testimonial-3-poster.jpg',
      name: 'Michael Chen',
      title: 'Independent Agent, Miami'
    },
    {
      type: 'text',
      quote: 'The workshop format is incredible. No fluff, just actionable strategies I could implement immediately. My agency grew 35% in the following quarter.',
      name: 'David Rodriguez',
      location: 'State Farm Agent, Jacksonville'
    }
  ];

  return (
    <section className="py-24 bg-black relative overflow-hidden">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-16">
          <p className="text-secondary text-sm uppercase tracking-wider mb-4">[ TESTIMONIALS ]</p>
          <h2 className="text-5xl md:text-6xl font-bold text-white">
            Hear from our{' '}
            <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              community
            </span>
          </h2>
        </div>

        {/* Carousel Container with Fade Gradients */}
        <div className="relative">
          {/* Left Fade Gradient */}
          <div className="absolute left-0 top-0 bottom-0 w-16 bg-gradient-to-r from-black to-transparent z-10 pointer-events-none" />
          
          {/* Right Fade Gradient */}
          <div className="absolute right-0 top-0 bottom-0 w-16 bg-gradient-to-l from-black to-transparent z-10 pointer-events-none" />

          {/* Carousel */}
          <Carousel
            opts={{
              align: 'start',
              dragFree: true,
              containScroll: 'trimSnaps',
            }}
            className="w-full"
          >
            <CarouselContent className="scrollbar-hide -ml-4">
              {testimonials.map((testimonial, index) => (
                <CarouselItem key={index} className="pl-4 basis-auto">
                  {testimonial.type === 'video' ? (
                    <VideoTestimonialCard
                      videoSrc={testimonial.videoSrc!}
                      posterSrc={testimonial.posterSrc}
                      name={testimonial.name}
                      title={testimonial.title!}
                    />
                  ) : (
                    <TextTestimonialCard
                      quote={testimonial.quote!}
                      name={testimonial.name}
                      location={testimonial.location!}
                      rating={5}
                    />
                  )}
                </CarouselItem>
              ))}
            </CarouselContent>
          </Carousel>
        </div>

        {/* Mobile Swipe Hint */}
        <div className="text-center mt-8 md:hidden">
          <p className="text-white/50 text-sm animate-pulse">
            ← Swipe to see more →
          </p>
        </div>
      </div>
    </section>
  );
};

export default TestimonialsCarousel;
