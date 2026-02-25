

## The Problem

The portrait video in the hero section is flush against the top of the section -- it butts right up against the navigation bar with no breathing room. On desktop, the content container has `lg:py-0`, meaning zero top/bottom padding on large screens. The video column uses `lg:h-[80vh]` but has no top margin, so it starts immediately at the top edge of the hero section, creating that ugly "directly connected to the header" look you're seeing in the screenshot.

Meanwhile, there's a scroll indicator at the bottom with `bottom-12`, but the video itself has no equivalent spacing from the top nav.

## The Fix

Add top padding on desktop so the video (and the entire content grid) is pushed down from the nav, centering the content vertically within the hero section. This means:

1. **Change `lg:py-0` to `lg:py-16`** (or similar) on the content container (line 33) so there's generous spacing above and below the grid on desktop, pushing the video away from the nav bar.

2. **Add `lg:items-center` and `lg:min-h-screen`** behavior so the grid content sits centered in the viewport rather than pinned to the top.

This gives the video equal breathing room from the nav above and the next section below, making it feel properly centered in the hero viewport -- matching the spacing balance as the user scrolls into the next section.

### Technical Details

In `src/components/sections/HeroSection.tsx`, line 33:
- Change: `py-10 sm:py-12 lg:py-0` to `py-10 sm:py-12 lg:py-16`
- Add `lg:min-h-screen lg:flex lg:items-center` to ensure the grid is vertically centered within the full viewport height on desktop, rather than sitting at the top.

