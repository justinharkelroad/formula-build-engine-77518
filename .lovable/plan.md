
# Fix Vimeo Video Modal: Landscape Layout and Visible Close Button

## Problems
1. The video uses `aspect-[9/16]` (portrait) but the Vimeo videos are landscape — causing the squished look
2. The close button is hard to find: the custom X blends into the black background, and the dialog's built-in X is tiny
3. The modal is only 500px wide, too small for landscape video

## Changes

### 1. Update `src/components/VimeoModal.tsx`
- Change aspect ratio from `aspect-[9/16]` to `aspect-video` (16:9 landscape)
- Increase max-width from `md:max-w-[500px]` to `md:max-w-[900px]` for proper landscape viewing
- Make the close button larger, more prominent with a white background and better contrast
- Position it outside/above the video so it's always clearly visible

### Technical Details

```text
Before:
- max-w: 500px, aspect: 9/16 (portrait)
- Close button: small, blends into black

After:
- max-w: 900px, aspect: 16/9 (landscape)  
- Close button: larger, high contrast, positioned top-right outside video area
```

No other files need changes — the VimeoModal is already used correctly in Index.tsx and VIP.tsx.
