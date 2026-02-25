interface TrustLineProps {
  className?: string;
}

const TrustLine = ({ className = "" }: TrustLineProps) => {
  return (
    <div className={`text-center py-8 ${className}`}>
      <p className="text-lg text-muted-foreground">
        Hosted at JW Marriott Orlando Bonnet Creek • October 14–16, 2026 • <a href="/#venue-geo" className="text-primary underline">Room block available</a> • Ticket transfers allowed up to 7 days pre-event
      </p>
    </div>
  );
};

export default TrustLine;