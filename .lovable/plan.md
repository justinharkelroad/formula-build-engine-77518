

## Deep-Linkable Testimonial Videos

Right now, clicking a testimonial video opens a modal but the URL never changes -- so there's no way to share a direct link to a specific video. We'll add URL hash support so each video gets a shareable link like `yoursite.com/#video=melissa` that auto-scrolls to the testimonials section and opens that video's modal with autoplay.

### How It Works

- Each testimonial gets a slug based on the person's name (lowercase): `melissa`, `kelly`, `anthony`, etc.
- When someone clicks a video, the URL updates to `/#video=melissa` (using hash so it doesn't trigger a page reload).
- When the page loads with that hash, it auto-scrolls to the testimonials section and opens the matching video modal.
- Closing the modal clears the hash back to `/`.
- You can share links like `https://formula-build-engine-77518.lovable.app/#video=jay` and it will go straight to Jay's video.

### Technical Changes

**1. `src/components/sections/VideoTestimonialsGrid.tsx`**
- Add a `slug` field to each testimonial (e.g., `slug: 'melissa'`).
- On mount, read `window.location.hash` -- if it matches `#video=<slug>`, find the matching index and open that modal.
- When a video is clicked, update `window.location.hash` to `#video=<slug>`.
- When the modal closes, clear the hash with `history.replaceState`.
- Auto-scroll the testimonials section into view when opening via hash.

**2. No other files need changes** -- this is entirely self-contained within the testimonials component using the browser's hash API (no router changes needed).

### Shareable URL Examples
- `yoursite.com/#video=melissa` -- Opens Melissa's video
- `yoursite.com/#video=cody` -- Opens Cody's video
- `yoursite.com/#video=jay` -- Opens Jay's video

