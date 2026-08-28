import { useState } from "react";
import { ExternalLink, Phone, Play } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export interface PartnerPodcastDetails {
  company: string;
  guestName: string;
  headshotUrl: string;
  headshotWidth: number;
  headshotHeight: number;
  vimeoId: string;
  contactLabel: string;
  contactUrl: string;
  contactDisplay: string;
  contactDescription: string;
}

interface PartnerPodcastModalProps {
  podcast: PartnerPodcastDetails;
}

const PartnerPodcastModal = ({ podcast }: PartnerPodcastModalProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const isPhoneContact = podcast.contactUrl.startsWith("tel:");
  const isExternalContact = podcast.contactUrl.startsWith("http");
  const ContactIcon = isPhoneContact ? Phone : ExternalLink;

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <button
          type="button"
          className="absolute bottom-4 left-1/2 z-20 inline-flex -translate-x-1/2 items-center gap-2 whitespace-nowrap rounded-full bg-black px-4 py-2.5 text-xs font-bold uppercase tracking-[0.14em] text-white shadow-[0_10px_30px_-12px_rgba(0,0,0,0.8)] transition-transform duration-200 hover:scale-[1.03] active:scale-[0.98] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[hsl(var(--secondary))] focus-visible:ring-offset-2"
          aria-label={`Watch the ${podcast.company} partner podcast with ${podcast.guestName}`}
        >
          <Play className="h-3.5 w-3.5 fill-current" aria-hidden="true" />
          Podcast
        </button>
      </DialogTrigger>

      <DialogContent className="max-h-[calc(100dvh-2rem)] w-[calc(100vw-2rem)] max-w-6xl gap-0 overflow-y-auto rounded-2xl border-white/15 bg-[hsl(0,0%,5%)] p-0 text-white shadow-[0_32px_100px_-28px_rgba(0,0,0,0.9)] [&>button:last-child]:z-20 [&>button:last-child]:rounded-full [&>button:last-child]:bg-white/10 [&>button:last-child]:p-3 [&>button:last-child]:text-white [&>button:last-child]:opacity-100 [&>button:last-child]:ring-offset-black [&>button:last-child]:hover:bg-white/20">
        <DialogTitle className="sr-only">
          {podcast.company} partner podcast with {podcast.guestName}
        </DialogTitle>
        <DialogDescription className="sr-only">
          Watch the partner podcast and find the contact information shared by {podcast.guestName}.
        </DialogDescription>

        <div className="grid lg:grid-cols-[minmax(0,1.7fr)_minmax(18rem,0.75fr)]">
          <div className="relative aspect-video w-full self-center overflow-hidden bg-black">
            {isOpen && (
              <iframe
                className="absolute inset-0 h-full w-full"
                src={`https://player.vimeo.com/video/${podcast.vimeoId}?autoplay=1&title=0&byline=0&portrait=0`}
                title={`${podcast.company} partner podcast with ${podcast.guestName}`}
                loading="lazy"
                allow="autoplay; fullscreen; picture-in-picture"
                allowFullScreen
              />
            )}
          </div>

          <aside className="flex flex-col justify-between gap-8 border-t border-white/10 p-6 sm:p-8 lg:min-h-full lg:border-l lg:border-t-0 lg:p-10">
            <div>
              <div className="mb-6 text-xs font-semibold uppercase tracking-[0.16em] text-white/50">
                Partner podcast
              </div>
              <img
                src={podcast.headshotUrl}
                alt={`${podcast.guestName}, ${podcast.company}`}
                width={podcast.headshotWidth}
                height={podcast.headshotHeight}
                className="mb-6 h-24 w-24 rounded-2xl object-cover sm:h-28 sm:w-28"
              />
              <h2 className="text-3xl font-black tracking-[-0.035em] text-white sm:text-4xl">
                {podcast.guestName}
              </h2>
              <p className="mt-2 text-base font-semibold text-white/65">{podcast.company}</p>
              <p className="mt-6 max-w-sm text-sm leading-relaxed text-white/65 sm:text-base">
                {podcast.contactDescription}
              </p>
            </div>

            <div>
              <div className="mb-3 text-sm text-white/50">{podcast.contactDisplay}</div>
              <a
                href={podcast.contactUrl}
                target={isExternalContact ? "_blank" : undefined}
                rel={isExternalContact ? "sponsored noopener noreferrer" : undefined}
                className="inline-flex w-full items-center justify-center gap-2 whitespace-nowrap rounded-full bg-[hsl(var(--secondary))] px-5 py-3.5 text-sm font-bold text-white transition-transform duration-200 hover:scale-[1.02] active:scale-[0.98] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-white/70 focus-visible:ring-offset-2 focus-visible:ring-offset-black"
              >
                {podcast.contactLabel}
                <ContactIcon className="h-4 w-4" aria-hidden="true" />
              </a>
            </div>
          </aside>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PartnerPodcastModal;
