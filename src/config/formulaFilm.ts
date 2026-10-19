// The Formula Opener film and the five chapters the post-event homepage is
// built around: Access, Association, Accountability, Acceleration, Ascension.
//
// startSeconds are where each idea begins in the film (2:04 cut, Oct 19 2026:
// the original 2:23 cut minus its first ~18.8s). Vimeo kept the old caption
// track after the replace, so re-check these by ear on any future re-cut.

import type { Review } from "@/config/reviews";

export const FORMULA_FILM = {
  vimeoId: "1232406913",
  title: "The Formula Opener",
  subtitle: "Orlando · October 2026",
  posterSrc: "/assets/formula-2026/home/film-poster.jpg",
} as const;

export const filmPlayerUrl = (startSeconds = 0, autoplay = true) =>
  `https://player.vimeo.com/video/${FORMULA_FILM.vimeoId}?autoplay=${autoplay ? 1 : 0}&title=0&byline=0&portrait=0&texttrack=en${
    startSeconds > 0 ? `#t=${Math.floor(startSeconds)}s` : ""
  }`;

export const formatTimestamp = (seconds: number) =>
  `${Math.floor(seconds / 60)}:${String(Math.floor(seconds % 60)).padStart(2, "0")}`;

export interface ChapterPhoto {
  src: string;
  alt: string;
}

export interface FormulaChapter {
  id: string;
  number: string;
  name: string;
  /** The line from the film. */
  line: string;
  startSeconds: number;
  /** An attendee's words that back up the chapter's line. */
  quote?: Review;
  /** First photo renders large. Use 5 or 3 photos so the grid stays even. All 16:9. */
  photos: ChapterPhoto[];
}

const photo = (file: string, alt: string): ChapterPhoto => ({
  src: `/assets/formula-2026/home/${file}.jpg`,
  alt,
});

export const FORMULA_CHAPTERS: FormulaChapter[] = [
  {
    id: "access",
    number: "01",
    name: "Access",
    line: "Access to a room most agency owners and team members will never actually set foot inside of.",
    startSeconds: 1,
    quote: {
      quote: "It was evident you put a lot of hard work into it. I heard multiple people talking about how much they enjoyed it and how much they got out of each session!",
      name: "Sean O.",
      source: "text",
    },
    photos: [
      photo("dsc1380", "Formula hosts pointing at the camera under the stage lights"),
      photo("dsc1086", "The Formula check-in desk welcoming attendees"),
      photo("dsc2897", "A full general session room in black and white"),
      photo("dsc2886", "Agency owners listening at their tables during a session"),
      photo("dsc2913", "The Formula stage and hexagon lights"),
    ],
  },
  {
    id: "association",
    number: "02",
    name: "Association",
    line: "By design, we're going to put you face-to-face, eye-to-eye, with other agency owners, team members, and other partners in the space.",
    startSeconds: 18,
    quote: {
      quote: "I loved getting an audience with not only my service peers, but agency owners and LSPs as well. I appreciate everyone's vulnerability and openness and think more than anything that's what sets this event apart from others!",
      name: "Emily Reshkin",
      source: "facebook",
    },
    photos: [
      photo("dsc3031", "Owners in a breakout, light-up wristbands on"),
      photo("dsc2962", "Three attendees working through a breakout together"),
      photo("dsc3022", "Two attendees comparing notes in a breakout"),
      photo("dsc3045", "An owner listening across the table, wristband glowing"),
      photo("dsc2187", "A group of attendees at the welcome reception"),
    ],
  },
  {
    id: "accountability",
    number: "03",
    name: "Accountability",
    line: "It's not that you won't do it. It's that when you actually begin, you stop.",
    startSeconds: 39,
    quote: {
      quote: "Formula Forum is not just another insurance conference. … It is something else by far bigger and better than just sitting there taking notes. You also build and set actions and goals. Then after, you map and plan. And the last part: accountability and capability.",
      name: "Jasmine Talbert",
      source: "facebook",
    },
    photos: [
      photo("dsc2934", "An owner writing targets into the Formula workbook"),
      photo("dsc2950", "Attendees heads-down on their plans"),
      photo("dsc2943", "An attendee writing in the workbook during a session"),
    ],
  },
  {
    id: "acceleration",
    number: "04",
    name: "Acceleration",
    line: "We live in a world of AI. Slow is not an option anymore.",
    startSeconds: 65,
    quote: {
      quote: "Businesses are moving faster than ever. … As insurance agents we have to realize change is coming. Are you going to keep fighting it or learn how to change with it?",
      name: "Heather Gallo Ebersole",
      source: "facebook",
    },
    photos: [
      photo("dsc2996", "A speaker pointing out into the room on stage"),
      photo("dsc3108", "The Formula stage between sessions"),
      photo("dsc3096", "A speaker on the Formula stage in black and white"),
    ],
  },
  {
    id: "ascension",
    number: "05",
    name: "Ascension",
    line: "Once we reach that peak, we reach the possibility of discovering a new version of ourselves.",
    startSeconds: 86,
    quote: {
      quote: "This year was better than last year's. And I can't wait for 2027. You are making a huge impact on more people than you realize. Don't stop.",
      name: "Melissa F.",
      source: "text",
    },
    photos: [
      photo("dsc1366", "A Formula shirt reading I AM THAT I AM"),
      photo("dsc1862-2", "Attendees together at the welcome reception"),
      photo("dsc1347", "A speaker on stage in front of the hexagon lights"),
    ],
  },
];
