// "What the room said" — post-event reviews from social posts and messages.
// The homepage section renders nothing while this list is empty.
//
// Quotes are trimmed with "…" and obvious typos fixed; never reworded.
// Text messages are private: they show first name + last initial until the
// sender agrees to their full name. Public posts (tagged Formula) use full names.
// The homepage uses quote cards, not screenshots: no phone UI or other
// people's names on the page.

export type ReviewSource = "instagram" | "facebook" | "linkedin" | "text";

export interface Review {
  quote: string;
  name: string;
  /** Agency or role, e.g. "Agency owner, Tampa". */
  detail?: string;
  source: ReviewSource;
  /** Optional original screenshot, opened when the card is clicked. */
  screenshotSrc?: string;
}

export const REVIEW_SOURCE_LABEL: Record<ReviewSource, string> = {
  instagram: "Instagram",
  facebook: "Facebook",
  linkedin: "LinkedIn",
  text: "Text message",
};

// Nobody appears twice on the homepage: anyone quoted in a chapter
// (src/config/formulaFilm.ts) stays off this wall.
export const REVIEWS: Review[] = [
  {
    quote:
      "Didn't think you could top last year, but you guys crushed it! … We had a blast and met some great people.",
    name: "Scott G.",
    source: "text",
  },
  {
    quote:
      "The creativity, thought, and effort that went into making this happen was truly impressive. You guys really knocked it out of the park!",
    name: "Nick",
    source: "text",
  },
];
