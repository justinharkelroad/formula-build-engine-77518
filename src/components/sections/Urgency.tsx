import { Clock } from "lucide-react";

const Urgency = () => {
  return (
    <section className="sticky top-0 z-40 py-4 bg-destructive text-white">
      <div className="container mx-auto px-4">
        <div className="max-w-5xl mx-auto">
          <div className="flex flex-col items-center text-center space-y-3">
            
            <div className="flex items-center gap-2 text-sm animate-pulse">
              <Clock size={16} />
              <span>LIMITED CAPACITY LEFT</span>
            </div>
            
            {/* Promo Text */}
            <div className="text-lg font-bold animate-pulse">
              USE F3100OFF TO SAVE $100 PER ACCESS PASS
            </div>
            
          </div>
        </div>
      </div>
    </section>
  );
};

export default Urgency;