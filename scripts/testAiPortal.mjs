import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';
import ts from 'typescript';

const code = ts.transpileModule(fs.readFileSync(new URL('../src/lib/aiPortal.ts', import.meta.url), 'utf8'), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
}).outputText;
const api = {};
const requireStub = (name) => {
  if (name === '@/integrations/supabase/client') return { supabase: {} };
  throw new Error(`unexpected import ${name}`);
};
new Function('exports', 'require', code)(api, requireStub);

test('only Vimeo player messages are trusted', () => {
  const ready = JSON.stringify({ event: 'ready' });
  assert.deepEqual(api.parseVimeoMessage('https://player.vimeo.com', ready), { event: 'ready' });
  assert.equal(api.parseVimeoMessage('https://evil.example', ready), null);
  assert.equal(api.parseVimeoMessage('https://player.vimeo.com.evil.example', ready), null);
});

test('Vimeo fractions become whole percentages', () => {
  const message = { event: 'timeupdate', data: { seconds: 10, percent: 0.456, duration: 100 } };
  assert.deepEqual(api.parseVimeoMessage('https://player.vimeo.com', message), { event: 'timeupdate', percent: 46 });
  assert.deepEqual(api.parseVimeoMessage('https://player.vimeo.com', JSON.stringify({ event: 'ended' })), { event: 'ended' });
  assert.equal(api.parseVimeoMessage('https://player.vimeo.com', '{not json'), null);
  assert.equal(api.parseVimeoMessage('https://player.vimeo.com', { event: 'timeupdate', data: {} }), null);
});

test('progress is saved in completed 10% steps and clamped', () => {
  assert.equal(api.progressStep(0), 0);
  assert.equal(api.progressStep(9), 0);
  assert.equal(api.progressStep(46), 40);
  assert.equal(api.progressStep(100), 100);
  assert.equal(api.progressStep(140), 100);
  assert.equal(api.progressStep(-5), 0);
  assert.equal(api.progressStep(Number.NaN), 0);
});

test('denial copy never confirms or denies roster membership details', () => {
  assert.match(api.denialMessage('not_found'), /could not match/);
  assert.match(api.denialMessage('roster_inactive'), /could not match/);
  assert.match(api.denialMessage('revoked'), /turned off/);
  assert.match(api.denialMessage('expired'), /ended/);
});

test('email shape check', () => {
  assert.equal(api.isEmail(' owner@agency.com '), true);
  assert.equal(api.isEmail('owner@agency'), false);
  assert.equal(api.isEmail('owner agency.com'), false);
});

test('the library lists exactly the ten packaged skills', () => {
  assert.equal(api.PORTAL_SKILLS.length, 10);
  assert.equal(new Set(api.PORTAL_SKILLS.map((skill) => skill.name)).size, 10);
});

test('each platform points at its own master file and skills folder', () => {
  assert.equal(api.PLATFORM_DETAIL.claude.masterFile, 'CLAUDE.md');
  assert.equal(api.PLATFORM_DETAIL.claude.skillsFolder, '.claude/skills');
  assert.equal(api.PLATFORM_DETAIL.codex.masterFile, 'AGENTS.md');
  assert.equal(api.PLATFORM_DETAIL.codex.skillsFolder, '.agents/skills');
});

test('status guard separates access from denial', () => {
  assert.equal(api.isPortalStatus({ access: true }), true);
  assert.equal(api.isPortalStatus({ access: false, reason: 'not_found' }), false);
});
