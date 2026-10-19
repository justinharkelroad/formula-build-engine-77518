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

export const REVIEWS: Review[] = [
  {
    quote:
      "This year was better than last year's. And I can't wait for 2027. You are making a huge impact on more people than you realize. Don't stop.",
    name: "Melissa F.",
    source: "text",
  },
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
  {
    quote:
      "It was evident you put a lot of hard work into it. I heard multiple people talking about how much they enjoyed it and how much they got out of each session!",
    name: "Sean O.",
    source: "text",
  },
  {
    quote:
      "It's a gift to be connected with people in the same field who want to lift you up and push you forward. … You deserve to take up space and be heard. Your ideas are important. … Power is in the pivot.",
    name: "Emily Reshkin",
    source: "facebook",
  },
];
