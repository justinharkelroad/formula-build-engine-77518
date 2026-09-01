import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import ts from "typescript";

const ROOT = process.cwd();
const CONFIG_ROOT = path.join(ROOT, "src/config/resources");

const EXPECTED = [
  ["salesSequence.ts", "SALES_SEQUENCE", [
    "standard",
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
    "secure-evas",
    "agency-toolchest",
    "performology",
    "ricochet360",
    "ask-fetch",
  ]],
  ["training.ts", "TRAINING", ["standard"]],
  ["personalSessions.ts", "BALANCE", ["standard"]],
  ["makingItRain.ts", "MAKING_IT_RAIN", [
    "standard",
    "mediaalpha",
    "everquote",
    "quotewizard",
    "smartfinancial",
  ]],
  ["personalSessions.ts", "BEING", ["standard"]],
  ["fundingTheBuild.ts", "FUNDING_THE_BUILD", [
    "wintrust-agent-finance",
    "nw-preferred",
  ]],
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

for (const [fileName, exportName, expected] of EXPECTED) {
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

  if (registryIds.length !== 30) {
    fail(`PARTNER_REGISTRY expected 30 Formula partners, got ${registryIds.length}`);
  }

  for (const required of ["ask-fetch", "ivantage"]) {
    if (!registryIds.includes(required)) fail(`PARTNER_REGISTRY is missing ${required}`);
  }
}

if (!process.exitCode) {
  console.log("Resource partner audit passed: S1-S8, Funding the Build, and 30-partner registry.");
}
