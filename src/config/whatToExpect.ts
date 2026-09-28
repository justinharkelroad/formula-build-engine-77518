/**
 * /what-to-expect — the attendee and partner explainers (Justin's "Formula2
 * Framework" PDFs, 2026-09), corrected against the shipped app on 2026-09-28.
 *
 * Every sentence here must be true when someone opens the app on Oct 14.
 * Corrections made against the PDFs, and why:
 * - No owner-publishes / team-reads agency plan. It is not built; every plan is
 *   private to its owner. The team share path is the Business export (Justin,
 *   2026-09-28: "pull publishing").
 * - No session numbers. Agenda rule (2026-09-04): never publish sequence. The
 *   sessions are grouped Business / Personal, never numbered.
 * - "Main priority", not "Main Domino" — that is the label in the app and Flow.
 * - Sign-in needs the password created in the app, not just the email.
 * - Offline check-ins queue on the web only; the phone app asks you to retry.
 * - Plans must finish by April 1, 2027, so a 90-day runway starts by early January.
 * - Partner page: up to two handouts; social links and category are not shown.
 * - An accountability partner does see the commitment text and action labels.
 */

export const ACCESS_ENDS = "April 1, 2027";

export const SESSIONS = {
  business: [
    "The Sales Sequence",
    "Growth Through Service",
    "The Operating System",
    "Commitment to Training",
    "Making It Rain",
  ],
  personal: ["The Body Session", "The Balance Session", "The Being Session"],
} as const;

export type Block = { eyebrow: string; body: string };

export const ATTENDEE = {
  heroTitle: "WHAT YOU'LL EXPERIENCE, AND WHAT HAPPENS AFTER",
  heroLead:
    "Three days in Orlando, eight working sessions, one 2027 Map, and ninety days of follow-through after you fly home. Here is the whole arc before you land.",

  beforeYouLand: {
    eyebrow: "Before you land in Orlando",
    body: `Your ticket comes with a seat in the Formula app, tied to the email on your registration. Download the app and create your account with that email and a password. The same email and password sign you in at flow.theformulaforum.com. Everything you build at Formula lives in that one account: your workbook sessions, your plans, your 2027 Map, and later your Progress. Your access runs through ${ACCESS_ENDS}.`,
  },

  inTheRoom: {
    title: "IN THE ROOM: OCTOBER 14 TO 16",
    lead: "Formula is eight working sessions. Five are about your agency. Three are about you. Each one ends with something written in your own hand, not a slide you photographed.",
    howItWorks:
      "Every session works the same way. You fill in the workbook pages during the session. At the end, you scan the session's code, photograph your three pages, and the app turns your handwriting into a structured plan for that session: your scores, your Domino, and the build behind it — who owns it, how you will measure it, and how often you will check it.",
    yours:
      "It's yours within minutes, on your phone and on the web. Personal sessions stay private to you.",
    domino:
      "You walk out of each session with one Domino — the single decision that, once it falls, knocks over everything behind it. Eight sessions, eight Dominos.",
  },

  team: {
    title: "IF YOU BRING YOUR TEAM: THE OWNER SEAT AND THE TEAM SEAT",
    lead: "Formula gives every person in the room the same eight sessions, the same Map, and the same Progress afterward. What differs is who sets the direction.",
    owner: {
      eyebrow: "Agency owner seat",
      title: "YOU SET THE DIRECTION",
      body: "Your business sessions become the plan your agency runs: the Sales Sequence, Growth Through Service, the Operating System, Commitment to Training, Making It Rain. When you are ready to hand it to the team, the Business export gives them the agency version — your Business Dominos and the moves behind them — with nothing from your personal sessions in it.",
    },
    member: {
      eyebrow: "Team member seat",
      title: "THEY DO THE THINKING TOO",
      body: "Your producers and service staff sit in the same sessions and fill in the same workbook pages, so they've done the thinking themselves instead of hearing about it later. Each of them gets their own plan from their own pages. On the three personal sessions, nothing is shared with anyone. What they decide about their body, their balance and their being is theirs.",
    },
    whyItMatters:
      "Most owners come home from a conference with a plan the team never saw built. At Formula the team was in the room when it was built, their own handwriting is in the same app, and the plan you hand them on Monday is one they watched you commit to. That's the difference between telling your team about a change and having your team already inside it.",
    progress:
      "Every seat gets its own Progress plan. A team member can share their Business Dominos with you as their accountability partner. You see their status, milestones and weekly actions on the agency Dominos you were both in the room for, week by week, without touching their personal ones. An owner with five team members sharing is running five follow-through plans, and can see who's on track before the Monday meeting.",
  },

  map: {
    title: "DAY THREE: YOUR 2027 MAP",
    body: "The last session assembles the eight Dominos into one page: My 2027 Map. You choose the first commitment you will put into motion, the first action you will take, the date it will happen by, and a witness who signs it with you.",
    kicker: "That page is the contract you take home. The Map is what everything after Formula is built from.",
  },

  progress: {
    title: "AFTER FORMULA: PROGRESS",
    lead: "Most conferences end when the room empties. Formula doesn't. When the event unlocks it, a new section opens in your app and on the web: My Progress. It turns your 2027 Map into a follow-through plan you'll actually run.",
    runway: {
      eyebrow: "Pick your runway: 30, 60 or 90 days",
      body: "You choose the length of the push and the start date. Progress lays out your plan week by week, with milestone reviews at day 30, 60 and 90. Your eight Dominos come across from the Map, and you can name one as your Main priority — the one the others serve.",
      note: `Every plan finishes by ${ACCESS_ENDS}, so a full 90-day push needs to start by early January.`,
    },
    blocks: [
      {
        eyebrow: "Weekly check-ins",
        body: "Once a week, for each Domino, you answer one question: on track, behind, or blocked. Add your actual number and a private note if you want. It takes a few minutes, and it keeps you honest with the version of you that sat in the room in Orlando.",
      },
      {
        eyebrow: "Actions, not intentions",
        body: "Under each Domino you keep a running list of actions. Add them as they come up, check them off as they land. At each check-in, Progress records what you actually completed that week, so your history is a record of work done, not work planned.",
      },
      {
        eyebrow: "Milestone reviews at 30, 60 and 90 days",
        body: "At each milestone you review every Domino: did it fall, is it standing, do you push on or change the play. Those reviews are where the plan gets real.",
      },
    ] satisfies Block[],
    offline:
      "Checking in on the web and the connection drops? The check-in saves in your browser and syncs when you're back.",
    pullQuote: "A 30-day review with two Dominos behind is not failure. It's information the old you never had.",
    more: [
      {
        eyebrow: "An accountability partner who can see your agency Dominos",
        body: "Choose any Formula attendee with the app and share the Business Dominos you pick. They see those Dominos: the commitment, status, milestones, and that week's actions. They never see your Personal Dominos, your private notes, or anything you didn't share. Reduce or revoke the share at any time.",
      },
      {
        eyebrow: "A weekly nudge, if you want one",
        body: "Turn on a weekly reminder for the day and time you choose. It respects quiet hours. It says one thing: your check-in is due. No content from your plan ever goes into a notification.",
      },
      {
        eyebrow: "Private history and your export",
        body: "Every check-in, action and review is kept in a private history you can read back at any time. Export the whole plan as a document for your own files, or a business-only version to hand your team. Nothing is shared unless you share it. Your notes are yours.",
      },
    ] satisfies Block[],
  },

  closer: {
    eyebrow: "What this adds up to",
    title: "AT FORMULA YOU DECIDE. AFTER FORMULA YOU EXECUTE.",
    body: `In the open, with a partner watching the Dominos that matter to your agency, until ${ACCESS_ENDS}. Ninety days of check-ins turns eight decisions into an operating rhythm. That's the difference between attending a conference and installing one.`,
  },
} as const;

export const PARTNER = {
  heroTitle: "FOR PARTNERS: YOU ARE IN THE ROOM AS A PARTICIPANT, NOT A SPONSOR",
  heroLead:
    "Your people sit in the same sessions, fill in the same workbook, and leave with the same Map and Progress as every agency in the room. The difference is what your pages ask you.",

  workingRoom: {
    title: "FORMULA IS A WORKING ROOM",
    lead: "Three days, October 14 to 16 in Orlando. Agency owners and their teams build their 2027 plan in their own handwriting through eight working sessions.",
    body: [
      "Every session ends with workbook pages photographed into the Formula app, which turns the handwriting into a structured plan within minutes. Day three assembles the eight decisions — we call them Dominos — into My 2027 Map: a first commitment, a first action, a date, a witness, a signature.",
      `After the event the app opens My Progress: a 30, 60 or 90-day runway with weekly check-ins on every Domino, milestone reviews, and an accountability partner who can see the shared Dominos. Access runs through ${ACCESS_ENDS}.`,
    ],
  },

  yourPeople: {
    title: "YOUR PEOPLE DO ALL OF IT TOO",
    body: "Every person you bring, owner and staff alike, gets the entire attendee experience in the same app once they are on your organization in the Partner Hub: all eight sessions, the same workbook, their own 2027 Map, their own Progress. Not a vendor lounge with a livestream. The same room, the same pages, the same 90 days after.",
    callout: "The difference is what your pages ask you.",
  },

  track: {
    title: "THE PARTNER TRACK INSIDE EVERY BUSINESS SESSION",
    lead: "In each of the five agency sessions, the workbook gives your people a partner version of the page. Same frame the agencies are working through, pointed at your company instead of at an agency. Three parts:",
    parts: [
      { title: "Field Notes", body: "What you see across the agencies you serve on this topic. Which ones structure it well, which ones struggle, and what separates them." },
      { title: "Reflection", body: "Where agencies repeatedly break down here, and where your company helps them, and where you might be adding friction." },
      { title: "One Company Domino", body: "Based on what the frame exposed about the agencies you serve, the one change inside your own company that creates the greatest downstream impact for those agencies." },
    ],
    after:
      "The app captures those pages the same way it captures an agency's and builds the plan for that session, with your Company Domino as the decision. Five business sessions, five Company Dominos, each one written by someone who just sat through the same argument the agencies did.",
    personal: "The three personal sessions are personal for your people exactly as they are for attendees.",
  },

  mapAndProgress: {
    title: "YOUR PEOPLE'S 2027 MAPS AND 90 DAYS OF FOLLOW-THROUGH",
    body: "Day three, your people assemble their Dominos into a 2027 Map like everyone else in the room. After the event, Progress opens for them too: pick the runway, check in weekly, review at 30, 60 and 90 days, share selected Business Dominos with an accountability partner inside your organization or outside it.",
    pullQuote:
      "A partner team of three that leaves Orlando with three Maps and three Progress plans has a company-level follow-through plan built on what agency owners said in the room, not on a post-event survey.",
  },

  directory: {
    title: "WHERE YOUR COMPANY SHOWS UP TO ATTENDEES",
    lead: "Separately from the work your people do, your company has a page in the Partners directory every attendee carries in the app:",
    fields: [
      "Business name, description, slogan",
      "Logo and banner",
      "Sponsor tier",
      "Booth number",
      "A booking link that opens from your page",
      "Website, phone, email and address",
      "A product video",
      "Up to two downloadable handouts",
    ],
    manage:
      "Your team manages it in the Partner Hub: text, media, links, booth, and who on your team has access. The Formula team sets your sponsor tier and confirms sponsor event access for your organization.",
  },

  privacy: {
    title: "WHAT STAYS PRIVATE, BOTH DIRECTIONS",
    body: "Attendees' workbook content, session plans, Dominos, Maps and Progress are never visible to partners. Your people's Company Dominos, Maps and Progress are never visible to attendees or to other partners. What is shared is only what a person chooses to share with an accountability partner they picked.",
    kicker: "Your Partners page is public to attendees by design; your plans are not.",
  },

  beforeOct14: {
    eyebrow: "Before October 14",
    title: "THREE THINGS TO DO",
    steps: [
      "Decide who from your company sits in the room, and get them on your organization in the Partner Hub so their seats connect. Choose people who serve agencies daily; the partner pages ask what they see.",
      "Finish your Partners page: logo, banner, one-paragraph description, booth number, booking link, one product video, a handout or two.",
      "Have each of your people download the Formula app and create their account with the email you registered them under, before they land.",
    ],
  },
} as const;
