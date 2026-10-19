// Optical sizing for sponsor logos, shared by the full sponsor wall and the
// compact homepage grid.

// Fitting every logo into one box sizes it by its proportions, so a 9:1 wordmark
// lands far smaller than a squarish one. Instead give each logo the same optical
// AREA: height = sqrt(AREA / aspect), read from the file itself on load so it
// stays correct when a logo is swapped. Capped so tall marks can't blow out the row.
const LOGO_AREA = 11500;
const MAX_LOGO_HEIGHT = 96;
// Equal area on a very wide wordmark (CRC Tapco is 7.45:1) cashes out almost
// entirely as width, so it spans the cell edge-to-edge and reads as oversized
// next to neighbours that sit with margin. Cap the width too.
const MAX_LOGO_WIDTH = 272;

// Equal area still reads unevenly: a hairline pale wordmark like Performology
// covers ~20% of its box in ink where a heavy slab like GOAL covers ~55%, so it
// looks smaller at identical dimensions. Measure how much ink each logo actually
// lays down and give the sparse ones a bounded boost. Square-rooted so a very
// light logo is nudged, not inflated, and never shrunk below the base area.
const TARGET_INK_DENSITY = 0.5;
const MAX_INK_BOOST = 1.5;

// Stacked lockups are the one case the measurements above can't see. Elite Travel
// Hackers splits its height across ELITE / TRAVEL / HACKERS, so its main word is
// ~47% of the block — matching neighbours on area still leaves the lettering
// visibly smaller. Allow a named, bounded lift above the height cap. Remove the
// entry if the sponsor ever supplies a single-line horizontal lockup.
const STACKED_LOGO_LIFT: Record<string, number> = {
  "Elite Travel Hackers": 1.2
};

const inkDensity = (img: HTMLImageElement): number | null => {
  try {
    const width = 120;
    const height = Math.max(1, Math.round((width * img.naturalHeight) / img.naturalWidth));
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) return null;
    ctx.drawImage(img, 0, 0, width, height);
    const { data } = ctx.getImageData(0, 0, width, height);
    let ink = 0;
    for (let i = 0; i < data.length; i += 4) {
      if (data[i + 3] < 40) continue;
      const luminance = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
      if (luminance < 242) ink += 1;
    }
    return ink / (width * height);
  } catch {
    return null; // a tainted canvas just falls back to plain area sizing
  }
};

// scale shrinks the whole sizing model (area and caps) for compact grids.
export const fitByArea = (img: HTMLImageElement, name: string, scale = 1) => {
  if (!img.naturalWidth || !img.naturalHeight) return;
  const aspect = img.naturalWidth / img.naturalHeight;

  const density = inkDensity(img);
  const boost = density && density > 0
    ? Math.min(MAX_INK_BOOST, Math.max(1, Math.sqrt(TARGET_INK_DENSITY / density)))
    : 1;

  const lift = STACKED_LOGO_LIFT[name] ?? 1;
  const height = Math.min(
    MAX_LOGO_HEIGHT * lift * scale,
    (MAX_LOGO_WIDTH * scale) / aspect,
    Math.round(Math.sqrt((LOGO_AREA * scale * scale * boost * lift) / aspect))
  );
  img.style.maxHeight = `${Math.round(height)}px`;
};
