import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import ts from "typescript";

const ROOT = process.cwd();
const CONFIG_ROOT = path.join(ROOT, "src/config/resources");
const READINESS_INVENTORY = path.join(ROOT, "FORMULA-PARTNER-RESOURCE-READINESS.md");
const EVENT_CONFIG = path.join(ROOT, "src/config/event.ts");

const EXPECTED_SPONSOR_TIERS = {
  Platinum: ["Agency Toolchest", "MediaAlpha", "SecureEVAs", "Standard"],
  Silver: ["Post Pros"],
  Bronze: [
    "EverQuote",
    "Filtered Quotes",
    "Hagerty",
    "QuoteWizard by LendingTree",
    "Wintrust Agent Finance",
    "Search Perfect",
    "Ricochet360",
    "Arbeit",
    "National General",
    "DMS",
    "LeadMiner",
    "ServiceMaster Restore",
    "Melon Local",
    "Slide Insurance",
    "CRC Tapco",
    "Ask Fetch",
    "NW Preferred Federal Credit Union",
    "Performology",
    "GOAL",
    "Mav",
    "SmartFinancial",
    "SmarketingMail",
    "Quote Nerds",
    "Ivantage",
    "YPC Media",
    "Elite Travel Hackers",
    "Disruptur",
    "AgencyBrain",
    "Authority War",
  ],
};

const EXPECTED = [
  ["salesSequence.ts", "SALES_SEQUENCE", [
    "standard",
    "agencybrain",
    "agency-toolchest",
    "performology",
    "ricochet360",
    "arbeit",
    "mav",
    "leadminer",
  ]],
  ["growthThroughService.ts", "GROWTH_THROUGH_SERVICE", [
    "secure-evas",
    "servicemaster-restore",
  ]],
  ["personalSessions.ts", "BODY", ["standard"]],
  ["operatingSystem.ts", "OPERATING_SYSTEM", [
    "standard",
    "agencybrain",
    "secure-evas",
    "agency-toolchest",
    "performology",
    "ricochet360",
    "ask-fetch",
    "national-general",
    "hagerty",
    "slide-insurance",
    "crc-tapco",
    "elite-travel-hackers",
    "ivantage",
  ]],
  ["training.ts", "TRAINING", ["standard"]],
  ["personalSessions.ts", "BALANCE", ["standard"]],
  ["makingItRain.ts", "MAKING_IT_RAIN", [
    "standard",
    "mediaalpha",
    "everquote",
    "quotewizard",
    "smartfinancial",
    "quote-nerds",
    "dms",
    "filtered-quotes",
    "authority-war",
    "goal",
    "search-perfect",
    "melon-local",
    "ypc-media",
    "post-pros",
    "smarketingmail",
    "ricochet360",
    "arbeit",
    "mav",
    "leadminer",
  ]],
  ["personalSessions.ts", "BEING", ["standard"]],
  ["fundingTheBuild.ts", "FUNDING_THE_BUILD", [
    "wintrust-agent-finance",
    "nw-preferred",
  ]],
];
const FLOW_SLUGS = ["s1", "s2", "s3", "s4", "s5", "s6", "s7", "s8", "map"];
const REVIEWED_RESOURCE_IDS = [
  "standard", "arbeit", "leadminer", "servicemaster-restore", "nw-preferred",
  "crc-tapco", "ivantage", "dms", "national-general", "authority-war",
];

function fail(message) {
  console.error(`Resource partner audit failed: ${message}`);
  process.exitCode = 1;
}

function parse(fileName) {
  const fullPath = path.join(CONFIG_ROOT, fileName);
  const source = fs.readFileSync(fullPath, "utf8");
  const sourceFile = ts.createSourceFile(fullPath, source, ts.ScriptTarget.Latest, true);
  const variables = new Map();

  for (const statement of sourceFile.statements) {
    if (!ts.isVariableStatement(statement)) continue;
    for (const declaration of statement.declarationList.declarations) {
      if (ts.isIdentifier(declaration.name) && declaration.initializer) {
        variables.set(declaration.name.text, declaration.initializer);
      }
    }
  }

  return { fullPath, variables };
}

function property(object, name) {
  return object.properties.find(
    (candidate) =>
      ts.isPropertyAssignment(candidate) &&
      ((ts.isIdentifier(candidate.name) && candidate.name.text === name) ||
        (ts.isStringLiteral(candidate.name) && candidate.name.text === name)),
  );
}

function resolve(initializer, variables) {
  return ts.isIdentifier(initializer) ? variables.get(initializer.text) : initializer;
}

function partnerIds(array) {
  if (!array || !ts.isArrayLiteralExpression(array)) return null;
  return array.elements.map((element) => {
    if (!ts.isCallExpression(element) || !ts.isIdentifier(element.expression)) return null;
    if (element.expression.text !== "partnerFor") return null;
    const id = element.arguments[0];
    return id && ts.isStringLiteral(id) ? id.text : null;
  });
}

function stringProperty(object, name) {
  const node = property(object, name);
  return node && ts.isStringLiteral(node.initializer) ? node.initializer.text : null;
}

function readSponsorRoster() {
  const source = fs.readFileSync(EVENT_CONFIG, "utf8");
  const sourceFile = ts.createSourceFile(EVENT_CONFIG, source, ts.ScriptTarget.Latest, true);
  const configDeclaration = sourceFile.statements
    .filter(ts.isVariableStatement)
    .flatMap((statement) => [...statement.declarationList.declarations])
    .find((declaration) => ts.isIdentifier(declaration.name) && declaration.name.text === "CONFIG");

  const configInitializer = configDeclaration?.initializer && ts.isAsExpression(configDeclaration.initializer)
    ? configDeclaration.initializer.expression
    : configDeclaration?.initializer;
  if (!configInitializer || !ts.isObjectLiteralExpression(configInitializer)) {
    return null;
  }

  const roster = [];
  for (const key of ["LOGO_PARTNERS", "LOGO_SPONSORS"]) {
    const rosterProperty = property(configInitializer, key);
    if (!rosterProperty || !ts.isArrayLiteralExpression(rosterProperty.initializer)) return null;
    for (const entry of rosterProperty.initializer.elements) {
      if (!ts.isObjectLiteralExpression(entry)) return null;
      const name = stringProperty(entry, "name");
      const tier = stringProperty(entry, "tier");
      if (!name || !tier) return null;
      roster.push({ name, tier });
    }
  }

  return roster;
}

for (const [index, [fileName, exportName, expected]] of EXPECTED.entries()) {
  const { variables } = parse(fileName);
  const exported = variables.get(exportName);
  if (!exported || !ts.isObjectLiteralExpression(exported)) {
    fail(`${fileName} does not export ${exportName} as an object literal`);
    continue;
  }

  const partnersProperty = property(exported, "partners");
  const actual = partnersProperty
    ? partnerIds(resolve(partnersProperty.initializer, variables))
    : null;

  if (!actual || actual.some((id) => id === null)) {
    fail(`${fileName}:${exportName} has an unreadable partners array`);
    continue;
  }

  if (JSON.stringify(actual) !== JSON.stringify(expected)) {
    fail(
      `${fileName}:${exportName} expected [${expected.join(", ")}], got [${actual.join(", ")}]`,
    );
  }

  const closing = property(exported, "closing");
  const ctaTo = closing && ts.isObjectLiteralExpression(closing.initializer)
    ? stringProperty(closing.initializer, "ctaTo")
    : null;
  const expectedReturn = `https://flow.theformulaforum.com/w26/${FLOW_SLUGS[index]}`;
  if (ctaTo !== expectedReturn) {
    fail(`${fileName}:${exportName} return link expected ${expectedReturn}, got ${ctaTo}`);
  }

  const guideProperty = property(exported, "guide");
  if (guideProperty && ts.isObjectLiteralExpression(guideProperty.initializer)) {
    const rowsProperty = property(guideProperty.initializer, "rows");
    if (rowsProperty && ts.isArrayLiteralExpression(rowsProperty.initializer)) {
      for (const row of rowsProperty.initializer.elements) {
        if (!ts.isObjectLiteralExpression(row)) continue;
        const idsProperty = property(row, "partnerIds");
        if (!idsProperty || !ts.isArrayLiteralExpression(idsProperty.initializer)) continue;
        for (const idNode of idsProperty.initializer.elements) {
          if (ts.isStringLiteral(idNode) && !actual.includes(idNode.text)) {
            fail(`${fileName}:${exportName} guide references absent partner ${idNode.text}`);
          }
        }
      }
    }
  }
}

const registry = parse("partners.ts").variables.get("PARTNER_REGISTRY");
if (!registry || !ts.isSatisfiesExpression(registry) || !ts.isObjectLiteralExpression(registry.expression)) {
  fail("partners.ts has an unreadable PARTNER_REGISTRY");
} else {
  const registryIds = registry.expression.properties
    .filter(ts.isPropertyAssignment)
    .map((entry) =>
      ts.isIdentifier(entry.name) || ts.isStringLiteral(entry.name) ? entry.name.text : null,
    )
    .filter(Boolean);

  if (registryIds.length !== 34) {
    fail(`PARTNER_REGISTRY expected 34 Formula partners, got ${registryIds.length}`);
  }

  for (const required of ["ask-fetch", "ivantage", "agencybrain", "disruptur", "elite-travel-hackers"]) {
    if (!registryIds.includes(required)) fail(`PARTNER_REGISTRY is missing ${required}`);
  }

  if (!fs.existsSync(READINESS_INVENTORY)) {
    fail("FORMULA-PARTNER-RESOURCE-READINESS.md is missing");
  } else {
    const inventory = fs.readFileSync(READINESS_INVENTORY, "utf8");
    for (const id of registryIds) {
      if (!inventory.includes(`| \`${id}\` |`)) {
        fail(`readiness inventory is missing partner ${id}`);
      }
    }
  }
}

const sponsorRoster = readSponsorRoster();
if (!sponsorRoster) {
  fail("src/config/event.ts has an unreadable sponsor roster");
} else {
  for (const [tier, expectedNames] of Object.entries(EXPECTED_SPONSOR_TIERS)) {
    const actualNames = sponsorRoster
      .filter((sponsor) => sponsor.tier === tier)
      .map((sponsor) => sponsor.name)
      .sort();
    const sortedExpectedNames = [...expectedNames].sort();
    if (JSON.stringify(actualNames) !== JSON.stringify(sortedExpectedNames)) {
      fail(`${tier} sponsor roster expected [${expectedNames.join(", ")}], got [${actualNames.join(", ")}]`);
    }
  }

  const unexpectedTiers = sponsorRoster
    .filter((sponsor) => !(sponsor.tier in EXPECTED_SPONSOR_TIERS))
    .map((sponsor) => `${sponsor.name}:${sponsor.tier}`);
  if (unexpectedTiers.length > 0) {
    fail(`sponsor roster has unexpected tiers: ${unexpectedTiers.join(", ")}`);
  }
}

if (!process.exitCode) {
  // Supplied resources live in ONE per-partner registry, not in the page files.
  // Counting `formulaResourceUrl:` across the page configs used to be the measure
  // and now always returns 0, which would read as "nothing is configured" right
  // after the refactor that centralised them.
  const supplied = parse("formulaResources.ts").variables.get("PARTNER_FORMULA_RESOURCES");
  const suppliedEntries = supplied && ts.isSatisfiesExpression(supplied) && ts.isObjectLiteralExpression(supplied.expression)
    ? supplied.expression.properties.filter(ts.isPropertyAssignment)
    : [];
  const suppliedIds = suppliedEntries.map((entry) =>
    ts.isIdentifier(entry.name) || ts.isStringLiteral(entry.name) ? entry.name.text : null
  );
  if (JSON.stringify(suppliedIds) !== JSON.stringify(REVIEWED_RESOURCE_IDS)) {
    fail(`formulaResources.ts reviewed partners expected [${REVIEWED_RESOURCE_IDS.join(", ")}], got [${suppliedIds.join(", ")}]`);
  }
  for (const entry of suppliedEntries) {
    if (!ts.isObjectLiteralExpression(entry.initializer)) {
      fail("formulaResources.ts has an unreadable reviewed resource");
      continue;
    }
    for (const field of ["orgId", "title", "description", "type", "reviewed"]) {
      if (!stringProperty(entry.initializer, field)) fail(`reviewed resource is missing ${field}`);
    }
    const url = property(entry.initializer, "url");
    const slot = property(entry.initializer, "slot");
    if (!url || !ts.isCallExpression(url.initializer) || !slot || !ts.isNumericLiteral(slot.initializer)) {
      fail("reviewed resource needs a handout URL and reviewed upload slot");
    }
  }
  for (const id of suppliedIds) {
    if (id && !registry?.expression?.properties?.some((entry) =>
      ts.isPropertyAssignment(entry) && (ts.isIdentifier(entry.name) || ts.isStringLiteral(entry.name)) && entry.name.text === id
    )) fail(`reviewed resource ${id} has no partner identity`);
  }

  const strayPageLevelUrls = [...new Set(EXPECTED.map(([fileName]) => fileName))]
    .filter((fileName) => {
      const source = fs.readFileSync(path.join(CONFIG_ROOT, fileName), "utf8");
      return /formulaResourceUrl\s*:/.test(source);
    });
  if (strayPageLevelUrls.length > 0) {
    fail(
      `page configs set formulaResourceUrl directly: ${strayPageLevelUrls.join(", ")}. ` +
        "Add the resource to formulaResources.ts instead so every page that partner appears on gets it."
    );
  }

  const readiness = EXPECTED.map(([fileName, exportName]) => {
    const { variables } = parse(fileName);
    const page = variables.get(exportName);
    const partnersNode = page && ts.isObjectLiteralExpression(page)
      ? property(page, "partners")
      : null;
    const partners = partnersNode ? resolve(partnersNode.initializer, variables) : null;
    if (!partners || !ts.isArrayLiteralExpression(partners)) return `${exportName}: unreadable`;
    const reviewed = partners.elements.filter((element) => {
      if (!ts.isCallExpression(element)) return false;
      const id = element.arguments[0];
      const copy = element.arguments[1];
      const suppressed = copy && ts.isObjectLiteralExpression(copy)
        ? property(copy, "suppressFormulaResource")
        : null;
      return id && ts.isStringLiteral(id) && suppliedIds.includes(id.text) &&
        !(suppressed && suppressed.initializer.kind === ts.SyntaxKind.TrueKeyword);
    }).length;
    return `${exportName}: ${reviewed}/${partners.elements.length} reviewed downloads`;
  });

  if (!process.exitCode) {
    console.log("Resource partner mapping passed: S1-S8, Funding the Build, 34-partner registry, and current sponsor tiers.");
    console.log(`Readiness inventory covers all 34 partners; ${suppliedIds.length} reviewed Formula resource URLs are configured.`);
    console.log(`Page readiness: ${readiness.join("; ")}.`);
    console.log("Mapping is not delivery evidence. Review FORMULA-PARTNER-RESOURCE-READINESS.md before release.");
  }
}
