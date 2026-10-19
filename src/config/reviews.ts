// "What the room said" — post-event reviews from social posts and messages.
// The homepage section renders nothing while this list is empty.
//
// Text messages are private: only publish a name the sender has agreed to.
// Screenshots go in public/assets/formula-2026/reviews/ with phone numbers,
// avatars of other people, and unrelated messages cropped out.

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

export const REVIEWS: Review[] = [];
