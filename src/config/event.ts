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
  EVENT_NAME: "Formula Forum 2025",
  BRAND_SHORT: "F³",
  TAGLINE: "National Insurance Agency Growth Conference",
  START_DATETIME_ISO: "2025-10-15T09:00:00-04:00",
  END_DATETIME_ISO: "2025-10-17T17:00:00-04:00",
  CITY: "Orlando",
  STATE: "FL",
  VENUE_NAME: "JW Marriott Orlando Bonnet Creek",
  VENUE_STREET: "14900 Chelonia Pkwy",
  VENUE_POSTAL: "32821",
  COUNTRY: "US",
  SITE_URL: "https://f3florida.com",
  REGISTER_URL: "https://f3florida.com/register",
  CONTACT_URL: "https://f3florida.com/contact",
  PARTNERS_URL: "https://f3florida.com/partners",
  ORGANIZER_NAME: "Formula Forum",
  ORGANIZER_URL: "https://f3florida.com",
  ORGANIZER_EMAIL: "Ashleeb@f3florida.com",
  ORGANIZER_PHONE: "260-515-1349",
  CURRENCY: "USD",
  BASE_TICKET_PRICE: "1499",
  SEAT_CAP: 250,
  EARLY_BIRD_END_ISO: "2025-09-15T23:59:00-04:00",
  OG_IMAGE_1200x630: "/lovable-uploads/fbdeac05-bb42-487e-8a74-42c0558bf8ce.png",
  TW_IMAGE_1200x600: "/lovable-uploads/fbdeac05-bb42-487e-8a74-42c0558bf8ce.png",
  HOTEL_BOOK_URL: "https://hotel-booking-link.example",
  LOGO_PARTNERS: [
    { name: "Ricochet360", tier: "Platinum", logoUrl: "/lovable-uploads/29100412-4e6c-4333-b865-192e0fca781e.png", linkUrl: "https://ricochet360.com" },
    { name: "The Standard", tier: "Platinum", logoUrl: "/lovable-uploads/c24dc654-fa2e-440d-adc8-9c19054f856c.png", linkUrl: "https://standardplaybook.com" },
    { name: "MediaAlpha", tier: "Platinum", logoUrl: "/lovable-uploads/6dae2514-00d4-40b4-b301-56e531551ddd.png", linkUrl: "https://mediaalpha.com" }
  ],
  SPEAKERS: [
    { name: "Garrett J. White", title: "Founder, Warrior", company: "Warrior Empire", photo: "/assets/speakers/garrett.jpg" },
    { name: "Kory [LastName]", title: "Allstate Agent of the Year", company: "Crane Agency", photo: "/assets/speakers/kory.jpg" }
  ]
} as const;