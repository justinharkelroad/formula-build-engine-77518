// The protected Formula AI portal library. Shared by the attendee and admin
// functions so the download allowlist and the upload check use one list.
//
// Files come from the private content workspace (never this public repo):
// ~/formula-ai-portal-content, built with tools/build-formula-ai-packs.sh.
// sha256/bytes are copied from its dist/manifest.json; the admin upload
// refuses any file that does not match exactly.

export type PortalPlatform = "claude" | "codex";

export type PortalAsset = {
  id: string;
  storagePath: string;
  platform: PortalPlatform | null;
  contentType: "application/zip" | "application/pdf";
  bytes: number;
  sha256: string;
};

export const AI_PORTAL_BUCKET = "formula-ai-portal";
export const AI_PORTAL_SIGNED_URL_SECONDS = 300;

export const AI_PORTAL_ASSETS: readonly PortalAsset[] = [
  {
    id: "claude-starter-pack",
    storagePath: "claude/formula-ai-install-claude-starter-pack.zip",
    platform: "claude",
    contentType: "application/zip",
    bytes: 82064,
    sha256: "bf7f72db6defe3a569ed0099863a3203d333f8c016ccfe666a493b6d6033017d",
  },
  {
    id: "claude-skills-library",
    storagePath: "claude/standard-agency-intelligence-skills-claude.zip",
    platform: "claude",
    contentType: "application/zip",
    bytes: 82179,
    sha256: "463b26a53555559c515d8132ff02d46ddf29d97ed82fabf62aa20b98f07c3745",
  },
  {
    id: "claude-lead-vendor-roi",
    storagePath: "claude/lead-vendor-roi-skill-claude.zip",
    platform: "claude",
    contentType: "application/zip",
    bytes: 44546,
    sha256: "67125f75cc7ce22a26675c4d2e03bfc11bc5669f1592629d9349c801bb635828",
  },
  {
    id: "codex-starter-pack",
    storagePath: "codex/formula-ai-install-codex-starter-pack.zip",
    platform: "codex",
    contentType: "application/zip",
    bytes: 82085,
    sha256: "c09ae8369ab8bb359cfb7b709f7212a928fd13ae0929bf71846bcca3f54e836d",
  },
  {
    id: "codex-skills-library",
    storagePath: "codex/standard-agency-intelligence-skills-codex.zip",
    platform: "codex",
    contentType: "application/zip",
    bytes: 82060,
    sha256: "8104ab3c22c0be4321e14b49bee7c01ec86684a04bdee82764031addb5e0b10b",
  },
  {
    id: "codex-lead-vendor-roi",
    storagePath: "codex/lead-vendor-roi-skill-codex.zip",
    platform: "codex",
    contentType: "application/zip",
    bytes: 44521,
    sha256: "3fc07a87c7f3a4b83091980ac7cf5f73d87726190a54739365a68874d12e8e83",
  },
  {
    id: "day-1-guide",
    storagePath: "common/ai-install-day-1-guide.pdf",
    platform: null,
    contentType: "application/pdf",
    bytes: 604828,
    sha256: "4d4f78879ffad18b27c704cd75458787d73d2ba2cf585dfe427bd166c817f6c9",
  },
  {
    id: "day-2-guide",
    storagePath: "common/ai-install-day-2-guide.pdf",
    platform: null,
    contentType: "application/pdf",
    bytes: 718031,
    sha256: "be322f8d2e6e53d0d0239263314c8610ae2fc7cdaf25e1e6ca3509fc45077d20",
  },
  {
    id: "original-skills-guide",
    storagePath: "common/standard-playbook-skills.pdf",
    platform: null,
    contentType: "application/pdf",
    bytes: 343507,
    sha256: "bd1580377b525fd63218f1dcc2686a2951ba95934a7a6f340f96cd95205f4ab9",
  },
];

// Original Agency AI Install recordings. Returned only to signed-in members.
// Playback protection itself is Vimeo's embed-domain setting.
export const AI_PORTAL_VIDEOS = [
  { id: "day-1", vimeoId: "1221779945" },
  { id: "day-2", vimeoId: "1222026378" },
] as const;

export function findAsset(id: unknown): PortalAsset | null {
  return typeof id === "string" ? AI_PORTAL_ASSETS.find((asset) => asset.id === id) ?? null : null;
}

export function isVideoId(id: unknown): id is (typeof AI_PORTAL_VIDEOS)[number]["id"] {
  return typeof id === "string" && AI_PORTAL_VIDEOS.some((video) => video.id === id);
}

export function vimeoEmbedUrl(vimeoId: string): string {
  return `https://player.vimeo.com/video/${vimeoId}?title=0&byline=0&portrait=0&dnt=1`;
}
