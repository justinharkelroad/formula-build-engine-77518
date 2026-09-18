/**
 * Checks every Formula resource in src/config/resources/formulaResources.ts
 * against the Partner Hub that produced it.
 *
 * The site copies partner handout URLs by hand, because the marketing site has
 * no Firebase client and the Partner Hub lives in a different product. Hand-copied
 * URLs go stale silently here, for one specific reason: the Hub names each upload
 * `handout_{epochMs}.pdf`, so replacing a handout writes a NEW object and leaves
 * the old one in place and still world-readable. A stale URL keeps serving the
 * superseded PDF at HTTP 200. It never 404s, so reachability alone proves nothing.
 *
 * That is why this script checks MEMBERSHIP (is the URL still one of the org's
 * current handoutUrls?) and not just reachability.
 *
 * SINCE THE RUNTIME RESOLVER LANDED, a failure here no longer means a broken or
 * stale link — src/lib/partnerHandouts.ts swaps in the org's current handout on
 * every page load, so the site self-heals. What a failure now means is that the
 * PARTNER CHANGED THE FILE and the reviewed title and description in
 * formulaResources.ts may describe a PDF that no longer exists. Re-read the new
 * one, rewrite the copy, update `reviewed`. That is the only reason to run this.
 *
 * Reads the public `partnerPages` mirror, which is `allow read: if true` in the
 * app's firestore.rules. The key below is the Formula Forum web app's public
 * client key, shipped in its browser bundle — it identifies the project, it does
 * not grant anything beyond what the rules already allow anonymously.
 *
 * Usage: bun run formula:handouts:audit
 */
import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import ts from "typescript";

const PROJECT_ID = "the-formula-forum-2026";
const WEB_API_KEY = "AIzaSyCGiXVgvpBXBPFtyebsOz0ycwI4KZ8X3mU";
const MIRROR = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents/partnerPages?pageSize=300&key=${WEB_API_KEY}`;

const REGISTRY = path.join(process.cwd(), "src/config/resources/formulaResources.ts");

let failed = false;
const fail = (message) => {
  failed = true;
  process.exitCode = 1;
  console.error(`Partner handout audit failed: ${message}`);
};

/** `import type` is erased by transpile, so the registry loads standalone. */
async function loadRegistry() {
  const source = fs.readFileSync(REGISTRY, "utf8");
  const { outputText } = ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 },
  });
  const module = await import(
    `data:text/javascript;base64,${Buffer.from(outputText).toString("base64")}`
  );
  return module.PARTNER_FORMULA_RESOURCES;
}

const stripToken = (url) => url.replace(/&token=[^&]*/, "");

async function loadMirror() {
  const response = await fetch(MIRROR);
  if (!response.ok) {
    throw new Error(`partnerPages mirror returned HTTP ${response.status}`);
  }
  const { documents = [] } = await response.json();
  return new Map(
    documents.map((doc) => [
      doc.name.split("/").pop(),
      {
        businessName: doc.fields?.businessName?.stringValue ?? "",
        website: doc.fields?.website?.stringValue ?? "",
        handoutUrls: (doc.fields?.handoutUrls?.arrayValue?.values ?? [])
          .map((value) => stripToken(value.stringValue ?? "")),
      },
    ])
  );
}

const registry = await loadRegistry();
const mirror = await loadMirror();

for (const [partnerId, resource] of Object.entries(registry)) {
  const org = mirror.get(resource.orgId);

  if (!org) {
    fail(`${partnerId}: orgId ${resource.orgId} is not in the partnerPages mirror.`);
    continue;
  }

  if (!org.handoutUrls.includes(resource.url)) {
    fail(
      `${partnerId} (${org.businessName}): the configured URL is no longer one of this org's ` +
        `${org.handoutUrls.length} current handout(s). The partner most likely re-uploaded — ` +
        "the old PDF is still served, so nothing looks broken. Re-copy the URL and re-review the PDF.\n" +
        `    configured: ${resource.url}\n` +
        org.handoutUrls.map((url) => `    current:    ${url}`).join("\n")
    );
    continue;
  }

  const head = await fetch(resource.url, { method: "HEAD" });
  const contentType = head.headers.get("content-type") ?? "";
  if (!head.ok || !contentType.includes("pdf")) {
    fail(`${partnerId}: URL returned HTTP ${head.status} (${contentType || "no content-type"}).`);
    continue;
  }

  console.log(
    `ok  ${partnerId.padEnd(22)} ${resource.type.padEnd(12)} reviewed ${resource.reviewed}  ${org.businessName}`
  );
}

const configuredOrgIds = new Set(Object.values(registry).map((resource) => resource.orgId));
const waiting = [...mirror.entries()].filter(
  ([orgId, org]) => org.handoutUrls.length > 0 && !configuredOrgIds.has(orgId)
);

if (waiting.length > 0) {
  console.log("");
  console.log("Uploaded in the Partner Hub, not on the website:");
  for (const [orgId, org] of waiting) {
    console.log(`    ${org.businessName || "(unnamed)"} — ${org.handoutUrls.length} handout(s), org ${orgId}`);
  }
  console.log("Not a failure. Review the PDF, then add it to formulaResources.ts.");
}

const extraHandouts = Object.entries(registry).filter(([, resource]) => {
  const org = mirror.get(resource.orgId);
  return org && org.handoutUrls.length > 1;
});
if (extraHandouts.length > 0) {
  console.log("");
  console.log("Configured orgs that uploaded more than one handout (only one is linked):");
  for (const [partnerId, resource] of extraHandouts) {
    console.log(`    ${partnerId} — ${mirror.get(resource.orgId).handoutUrls.length} uploaded`);
  }
}

if (!failed) {
  console.log("");
  console.log(
    `Partner handout audit passed: ${Object.keys(registry).length} configured resource(s) still match the Partner Hub.`
  );
  console.log("Matching the Hub is not review. FORMULA-PARTNER-RESOURCE-READINESS.md records who read the PDF.");
}
