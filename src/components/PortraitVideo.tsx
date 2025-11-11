interface PortraitVideoProps {
  mediaId: string;
}

const PortraitVideo = ({ mediaId }: PortraitVideoProps) => {
  return (
    <div className="relative w-full max-w-md mx-auto lg:mx-0">
      {/* 9:16 aspect ratio wrapper */}
      <div className="relative w-full" style={{ paddingTop: '177.78%' }}>
        <iframe
          src={`https://fast.wistia.com/embed/iframe/${mediaId}`}
          className="absolute top-0 left-0 w-full h-full rounded-lg shadow-elegant"
          allow="autoplay; fullscreen"
          allowFullScreen
          title="Portrait video"
        />
      </div>
    </div>
  );
};

export default PortraitVideo;
