import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const read = (relative) => fs.readFileSync(path.join(root, relative), 'utf8');
const failures = [];
const assert = (condition, message) => { if (!condition) failures.push(message); };

const baseAdapter = read('lib/models/BaseModelAdapter.ts');
const mapper = read('lib/modelMapper.ts');
const generationRoute = read('app/api/generate-video/route.ts');
const publishRoute = read('app/api/social-publish/route.ts');
const nextConfig = read('next.config.js');
const adapterDir = path.join(root, 'lib', 'models');
const adapterFiles = fs.readdirSync(adapterDir).filter((name) => name.endsWith('Adapter.ts') && name !== 'BaseModelAdapter.ts');

assert(/executionMode:\s*AdapterExecutionMode\s*=\s*['"]stub['"]/.test(baseAdapter), 'Base adapters must default to stub mode.');
assert(!/falling back to Runway/i.test(mapper), 'Unknown models must not fall back to Runway.');
assert(/default:\s*return null/.test(mapper), 'Unknown models must fail closed.');
assert(/adapter\.executionMode\s*!==\s*['"]live['"]/.test(generationRoute), 'LIVE generation route must block stub adapters.');
assert(/PROVIDER_NOT_LIVE/.test(generationRoute), 'LIVE generation route must expose PROVIDER_NOT_LIVE.');
assert(/!result\.url\s*&&\s*!result\.jobId/.test(generationRoute), 'Provider success must require durable output.');
assert(/\/health/.test(publishRoute) && /account\.ready\s*!==\s*true/.test(publishRoute), 'Social publish must preflight account readiness.');
assert(/Idempotency-Key/.test(publishRoute) && /sha256/.test(publishRoute), 'Social publish must send deterministic idempotency keys.');
assert(!/picsum\.photos/.test(nextConfig), 'Production Next config must not allow placeholder image host.');

for (const file of adapterFiles) {
  const source = read(path.join('lib', 'models', file));
  if (/picsum\.photos|simulateNetworkDelay/.test(source)) {
    assert(!/executionMode\s*=\s*['"]live['"]/.test(source), `${file} contains simulated output and must never declare live execution.`);
  }
}

if (failures.length) {
  console.error('LIVE PATH GATE FAILED');
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exit(1);
}

console.log(`LIVE PATH GATE PASSED (${adapterFiles.length} adapters checked).`);
