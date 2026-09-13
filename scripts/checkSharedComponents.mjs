import assert from "node:assert/strict"
import { existsSync } from "node:fs"
import { mkdtemp, rm, writeFile } from "node:fs/promises"
import path from "node:path"
import { fileURLToPath, pathToFileURL } from "node:url"
import esbuild from "esbuild"

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..")
const tempDir = await mkdtemp(path.join(repoRoot, ".check-components-tmp-"))
const probePath = path.join(tempDir, `probe-${Date.now()}.mjs`)

const probeSource = `
import React from "react"
import { renderToStaticMarkup } from "react-dom/server"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"

export const results = {
  r1: renderToStaticMarkup(
    React.createElement(
      Button,
      { asChild: true, className: "review-sentinel", id: "x", "data-probe": "p" },
      React.createElement("a", { href: "/review-target" }, "Continue")
    )
  ),
  r5AsChild: renderToStaticMarkup(
    React.createElement(
      Button,
      { asChild: true, loading: true },
      React.createElement("a", { href: "/t" }, "Continue")
    )
  ),
  r5Native: renderToStaticMarkup(
    React.createElement(Button, { loading: true }, "Continue")
  ),
  r3: {
    error: renderToStaticMarkup(React.createElement(Badge, { variant: "error" }, "error")),
    success: renderToStaticMarkup(React.createElement(Badge, { variant: "success" }, "success")),
    warning: renderToStaticMarkup(React.createElement(Badge, { variant: "warning" }, "warning")),
  },
  r6Interactive: renderToStaticMarkup(
    React.createElement(Card, { surface: "interactive" }, "Open")
  ),
  r6Plain: renderToStaticMarkup(React.createElement(Card, null, "Plain")),
}
`

const checks = [
  ["R1: asChild forwards props correctly", (html) => {
    assert.ok(html.startsWith("<a"))
    assert.match(html, /review-sentinel/)
    assert.match(html, /bg-primary/)
    assert.match(html, /id="x"/)
    assert.match(html, /data-probe="p"/)
    assert.doesNotMatch(html, /aria-disabled/)
  }],
  ["R5: loading asChild blocks activation and preserves footprint", (html) => {
    assert.ok(html.startsWith("<a"))
    assert.match(html, /aria-busy="true"/)
    assert.match(html, /aria-disabled="true"/)
    assert.match(html, /bg-primary/)
    assert.match(html, /opacity-0/)
    // The overlay must wrap the slotted element's CHILDREN, never nest a second
    // copy of the slotted element inside itself.
    assert.equal((html.match(/<a\b/g) || []).length, 1, "exactly one anchor in a loading asChild render")
    assert.match(html, />Continue</)
    // Match a real `disabled` HTML attribute (followed by space/=/>), not the
    // Tailwind `disabled:` pseudo-class utility that legitimately appears in
    // the class list (e.g. "disabled:pointer-events-none").
    assert.doesNotMatch(html, /\sdisabled(?=[\s=>])/)
  }],
  ["R5: loading native button is disabled and busy", (html) => {
    assert.match(html, /<button/)
    assert.match(html, /\sdisabled(?=[\s=>])/)
    assert.match(html, /aria-busy="true"/)
    assert.match(html, /opacity-0/)
    assert.match(html, /Continue/)
  }],
  ["R3: status badges use opaque white-on-color contrast", (html) => {
    for (const variant of ["error", "success", "warning"]) {
      assert.match(html[variant], /text-white/)
      assert.match(html[variant], new RegExp(`bg-\\[hsl\\(var\\(--status-${variant}\\)\\)\\]`))
      assert.doesNotMatch(html[variant], /\/0\.16/)
    }
  }],
  ["R6: interactive cards have button semantics", ({ interactive, plain }) => {
    assert.match(interactive, /role="button"/)
    assert.match(interactive, /tabindex="0"/)
    assert.doesNotMatch(plain, /role="button"/)
    assert.doesNotMatch(plain, /tabindex/)
  }],
]

let failed = false

try {
  const buildResult = await esbuild.build({
    stdin: {
      contents: probeSource,
      resolveDir: repoRoot,
      loader: "tsx",
    },
    bundle: true,
    write: false,
    platform: "node",
    format: "esm",
    jsx: "automatic",
    absWorkingDir: repoRoot,
    external: ["react", "react-dom", "react-dom/server"],
    plugins: [
      {
        name: "resolve-at-alias",
        setup(build) {
          build.onResolve({ filter: /^@\// }, (args) => {
            const base = path.join(repoRoot, "src", args.path.slice(2))
            const candidate = ["", ".tsx", ".ts", "/index.tsx", "/index.ts"]
              .map((suffix) => `${base}${suffix}`)
              .find((candidatePath) => existsSync(candidatePath))
            if (!candidate) {
              throw new Error(`Cannot resolve alias import: ${args.path}`)
            }
            return { path: candidate }
          })
        },
      },
    ],
    outfile: probePath,
  })

  const bundledOutput = buildResult.outputFiles?.[0]
  if (!bundledOutput) {
    throw new Error("esbuild produced no output file for the probe bundle")
  }
  await writeFile(probePath, bundledOutput.contents)

  const bundledProbe = await import(`${pathToFileURL(probePath).href}?t=${Date.now()}`)
  const rendered = bundledProbe.results
  const values = [
    rendered.r1,
    rendered.r5AsChild,
    rendered.r5Native,
    rendered.r3,
    { interactive: rendered.r6Interactive, plain: rendered.r6Plain },
  ]

  for (const [[label, check], value] of checks.map((check, index) => [check, values[index]])) {
    try {
      check(value)
      console.log(`✓ ${label}`)
    } catch (error) {
      failed = true
      console.log(`✗ ${label}: ${error.message}`)
    }
  }
} catch (error) {
  console.error(`Component regression check failed: ${error.message}`)
  process.exitCode = 1
} finally {
  await rm(tempDir, { recursive: true, force: true })
}

if (failed) {
  process.exitCode = 1
}
