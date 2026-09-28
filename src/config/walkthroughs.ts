/**
 * The three portrait walkthrough videos, shared by /formula-app-guide and
 * /what-to-expect. Files live in public/assets/formula-app-guide/walkthroughs.
 */
export const WALKTHROUGH_PATH = "/assets/formula-app-guide/walkthroughs";

export type Walkthrough = {
  id: "attendees" | "team" | "partners";
  file: string;
  label: string;
  title: string;
  length: string;
  copy: string;
};

export const walkthroughs: Walkthrough[] = [
  { id: "attendees", file: "attendee", label: "Attendees", title: "The Attendee Walkthrough", length: "2:21", copy: "Today, your agenda, QR connections, and Build 2027: photograph your workbook pages, confirm what AI read, and get your 90-day install plan." },
  { id: "team", file: "staff", label: "Agency Team", title: "The Agency Team Walkthrough", length: "0:52", copy: "What team members see: your first move, saving sessions, following Build 2027, and Flows between sessions." },
  { id: "partners", file: "partner", label: "Partners", title: "The Partner Walkthrough", length: "1:00", copy: "Partner Hub, page readiness, event tools, and scanning attendee badges to turn a hello into a lead." },
];
