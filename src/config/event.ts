// Countdown management functions
const COUNTDOWN_STORAGE_KEY = 'f3_countdown_data';
const COUNTDOWN_RESET_DAYS = 7;

interface CountdownData {
  currentDeadline: string;
  resetCount: number;
  originalDeadline: string;
}

export const getCountdownDeadline = (): { deadline: string; resetCount: number; isOriginal: boolean } => {
  const now = new Date();
  const initialDeadline = new Date(now.getTime() + (COUNTDOWN_RESET_DAYS * 24 * 60 * 60 * 1000)).toISOString();
  
  try {
    const stored = localStorage.getItem(COUNTDOWN_STORAGE_KEY);
    let countdownData: CountdownData;
    
    if (stored) {
      countdownData = JSON.parse(stored);
    } else {
      countdownData = {
        currentDeadline: initialDeadline,
        resetCount: 0,
        originalDeadline: initialDeadline
      };
    }
    
    const now = new Date();
    const currentTarget = new Date(countdownData.currentDeadline);
    
    // If deadline has passed, calculate next reset
    if (now >= currentTarget) {
      const nextDeadline = new Date(now.getTime() + (COUNTDOWN_RESET_DAYS * 24 * 60 * 60 * 1000));
      countdownData = {
        ...countdownData,
        currentDeadline: nextDeadline.toISOString(),
        resetCount: countdownData.resetCount + 1
      };
      
      localStorage.setItem(COUNTDOWN_STORAGE_KEY, JSON.stringify(countdownData));
      
      // Track reset event for analytics
      if (typeof window !== 'undefined' && window.gtag) {
        window.gtag('event', 'countdown_reset', {
          reset_count: countdownData.resetCount,
          new_deadline: countdownData.currentDeadline
        });
      }
    }
    
    return {
      deadline: countdownData.currentDeadline,
      resetCount: countdownData.resetCount,
      isOriginal: countdownData.resetCount === 0
    };
  } catch (error) {
    console.error('Error managing countdown:', error);
    const fallbackDeadline = new Date(new Date().getTime() + (COUNTDOWN_RESET_DAYS * 24 * 60 * 60 * 1000)).toISOString();
    return {
      deadline: fallbackDeadline,
      resetCount: 0,
      isOriginal: true
    };
  }
};

export const CONFIG = {
  EVENT_NAME: "Formula Forum 2026",
  BRAND_SHORT: "Formula",
  TAGLINE: "National Insurance Agency Growth Conference",
  START_DATETIME_ISO: "2026-10-14T09:00:00-04:00",
  END_DATETIME_ISO: "2026-10-16T17:00:00-04:00",
  CITY: "Orlando",
  STATE: "FL",
  VENUE_NAME: "JW Marriott Orlando Bonnet Creek",
  VENUE_STREET: "14900 Chelonia Pkwy",
  VENUE_POSTAL: "32821",
  COUNTRY: "US",
  SITE_URL: "https://theformulaforum.com",
  REGISTER_URL: "https://theformulaforum.com/pricing",
  CONTACT_URL: "https://theformulaforum.com/contact",
  PARTNERS_URL: "https://theformulaforum.com/partners",
  ORGANIZER_NAME: "Formula Forum",
  ORGANIZER_URL: "https://theformulaforum.com",
  ORGANIZER_EMAIL: "info@f3florida.com",
  ORGANIZER_PHONE: "260-515-1349",
  CURRENCY: "USD",
  BASE_TICKET_PRICE: "347",
  SEAT_CAP: 250,
  EARLY_BIRD_END_ISO: "2026-09-15T23:59:00-04:00",
  OG_IMAGE_1200x630: "https://koubtooblwjcwubcuhml.supabase.co/storage/v1/object/public/images/SEO%20IMAGE.jpg",
  TW_IMAGE_1200x600: "https://koubtooblwjcwubcuhml.supabase.co/storage/v1/object/public/images/SEO%20IMAGE.jpg",
  HOTEL_BOOK_URL: "https://book.passkey.com/event/51189838/owner/49980248/home",
  LOGO_PARTNERS: [
    { name: "The Standard", tier: "Platinum", logoUrl: "/lovable-uploads/c24dc654-fa2e-440d-adc8-9c19054f856c.png", linkUrl: "https://standardplaybook.com" },
    { name: "MediaAlpha", tier: "Platinum", logoUrl: "/lovable-uploads/6dae2514-00d4-40b4-b301-56e531551ddd.png", linkUrl: "https://mediaalpha.com" },
    { name: "AgencyToolChest", tier: "Platinum", logoUrl: "/lovable-uploads/Agencytool%20chest%20logo.png", linkUrl: "https://agencytoolchest.com" }
  ],
  SPEAKERS: [
    { name: "Garrett J. White", title: "Founder, Warrior", company: "Warrior Empire", photo: "/assets/speakers/garrett.jpg" },
    { name: "Kory [LastName]", title: "Allstate Agent of the Year", company: "Crane Agency", photo: "/assets/speakers/kory.jpg" }
  ]
} as const;