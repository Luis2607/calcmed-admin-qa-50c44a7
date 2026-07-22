import { mkdir, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { chromium } from 'playwright';

const baseUrl = process.env.ESCORES_QA_BASE_URL;
if (!baseUrl) throw new Error('ESCORES_QA_BASE_URL ausente.');

const outDir = resolve('evidence/ticket-16.8g/hosted');
await mkdir(outDir, { recursive: true });

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
const consoleErrors = [];
const pageErrors = [];
page.on('console', (message) => {
  if (message.type() === 'error') consoleErrors.push(message.text());
});
page.on('pageerror', (error) => pageErrors.push(error.message));

function qaUrl({ modo = 'adulto', id } = {}) {
  const url = new URL(baseUrl);
  url.searchParams.set('modo', modo);
  if (id) url.searchParams.set('id', id);
  return url.toString();
}

async function gotoAndWait(url, expectedText) {
  let lastError;
  const attempts = [];
  for (let attempt = 1; attempt <= 1; attempt += 1) {
    try {
      const response = await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30_000 });
      await page.getByText(expectedText, { exact: false }).first().waitFor({ timeout: 20_000 });
      return;
    } catch (error) {
      lastError = error;
      const body = await page.locator('body').innerText().catch(() => '');
      attempts.push({
        attempt,
        url: page.url(),
        title: await page.title().catch(() => ''),
        body: body.slice(0, 2_000),
        error: String(error),
      });
      if (attempt < 1) await page.waitForTimeout(5_000);
    }
  }
  await page.screenshot({ path: resolve(outDir, 'failure.png'), fullPage: true }).catch(() => {});
  await writeFile(resolve(outDir, 'failure.json'), JSON.stringify({
    baseUrl,
    expectedText,
    attempts,
    consoleErrors,
    pageErrors,
  }, null, 2) + '\n', 'utf8');
  console.error('[qa:escores:hosted] DIAGNOSTICO ' + JSON.stringify({ baseUrl, expectedText, attempts, consoleErrors, pageErrors }));
  throw lastError;
}

async function capture(name) {
  await page.screenshot({ path: resolve(outDir, `${name}.png`), fullPage: true });
  const text = (await page.locator('body').innerText()).replaceAll(/\n{3,}/g, '\n\n').trim();
  await writeFile(resolve(outDir, `${name}.dom.txt`), `${text}\n`, 'utf8');
  return text;
}

const evidence = [];

await gotoAndWait(qaUrl({ modo: 'adulto' }), 'qSOFA');
await page.getByRole('button', { name: 'Abrir qSOFA' }).waitFor();
await page.getByRole('button', { name: /Abrir MELD/ }).waitFor();
evidence.push({ scenario: 'adult-list', text: await capture('adult-list') });

await page.getByRole('button', { name: 'Abrir qSOFA' }).click();
await page.getByLabel('Pressão arterial sistólica ≤ 100 mmHg').click();
await page.getByLabel('Frequência respiratória ≥ 22 irpm').click();
await page.getByText('≥2 pontos', { exact: true }).waitFor();
evidence.push({ scenario: 'qsofa', text: await capture('qsofa-result-2') });

await gotoAndWait(
  qaUrl({ modo: 'adulto', id: 'c3a2e3c4-5d6e-4f70-8182-333333330001' }),
  'Bilirrubina total',
);
await page.getByLabel('Bilirrubina total').fill('2');
await page.getByLabel('INR').fill('1.5');
await page.getByLabel('Creatinina sérica').fill('1.2');
await page.getByText('MELD 10–19: risco moderado', { exact: true }).waitFor();
evidence.push({ scenario: 'meld', text: await capture('meld-result-15') });

await gotoAndWait(
  qaUrl({ modo: 'pediatrico', id: 'b2f1d2b3-4c5d-4e6f-8071-222222220001' }),
  'Contagem total de leucócitos anormal',
);
await page.getByRole('group', { name: /Contagem total de leucócitos anormal/ })
  .getByText('Sim', { exact: true }).click();
await page.getByRole('group', { name: /Contagem total de neutrófilos/ })
  .getByText('Aumentada ou diminuída', { exact: true }).click();
await page.getByRole('group', { name: /Neutrófilos imaturos elevados/ })
  .getByText('Sim', { exact: true }).click();
await page.getByText('Sepse possível', { exact: true }).waitFor();
evidence.push({ scenario: 'rodwell', text: await capture('rodwell-result-3') });

await browser.close();

const required = [
  ['adult-list', ['qSOFA', 'MELD (Model for End-Stage Liver Disease)', 'Publicado']],
  ['qsofa', ['qSOFA', '≥2 pontos', 'Maior risco de sepse']],
  ['meld', ['MELD', '15', 'MELD 10–19: risco moderado']],
  ['rodwell', ['Rodwell', '3', 'Sepse possível']],
];

for (const [scenario, snippets] of required) {
  const item = evidence.find((entry) => entry.scenario === scenario);
  for (const snippet of snippets) {
    if (!item?.text.includes(snippet)) {
      throw new Error(`QA hospedada falhou: ${scenario} sem "${snippet}".`);
    }
  }
}

if (consoleErrors.length || pageErrors.length) {
  throw new Error(`Erros no browser: ${JSON.stringify({ consoleErrors, pageErrors })}`);
}

await writeFile(resolve(outDir, 'summary.json'), JSON.stringify({
  generatedAt: new Date().toISOString(),
  sourceCommit: process.env.GITHUB_SHA || null,
  baseUrl,
  scenarios: required.map(([scenario, snippets]) => ({ scenario, snippets, pass: true })),
  consoleErrors: [],
  pageErrors: [],
}, null, 2) + '\n', 'utf8');

console.log('[qa:escores:hosted] PASS adult-list qSOFA=2 MELD=15 Rodwell=3');
