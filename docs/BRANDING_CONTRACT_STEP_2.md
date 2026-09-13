# Formula branding contract - Step 2

Canonical ownership is the versioned contract at:

`/Users/standardmacbook/Formula-build-backups/branding-alignment-2026-09-12/BRAND_CONTRACT.md`

This branch implements only the shared typography direction on top of the accepted Step 1 color and surface roles.

- Landing uses a self-hosted Inter variable font covering weights 100–900 with `font-display: swap`.
- Formula display headings stay heavy, tight and uppercase; normal headings use a restrained 700 weight and compact negative tracking.
- Eyebrows and metadata labels use a compact uppercase treatment with readable line height.
- The critical inline style and the deferred stylesheet reference the same local font asset, so first paint does not depend on Google Fonts or network access.
- Landing composition, CTA behavior, content, routes and Step 1 colors/surfaces are unchanged.

Font source: `@fontsource-variable/inter` 5.2.6, Inter v19 metadata, Google Fonts source, licensed under SIL OFL 1.1. The license text is retained in `docs/INTER_FONT_LICENSE.txt`.
