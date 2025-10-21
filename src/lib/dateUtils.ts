/**
 * Formats the event dates from CONFIG into display format
 * @param startDate ISO date string
 * @param endDate ISO date string
 * @returns Formatted date range like "October 15-17, 2025"
 */
export const formatEventDates = (startDate: string, endDate: string): string => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  
  const startMonth = start.toLocaleDateString('en-US', { month: 'long' });
  const startDay = start.getDate();
  const endDay = end.getDate();
  const year = start.getFullYear();
  
  return `${startMonth} ${startDay}-${endDay}, ${year}`;
};

/**
 * Formats venue address for display
 */
export const formatVenueAddress = (venueName: string, street: string, city: string, state: string, postal: string): string => {
  return `${venueName}\n${street}, ${city}, ${state} ${postal}`;
};