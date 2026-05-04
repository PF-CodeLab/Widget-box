// test.js - simulate a request to the API locally
const handler = require('./api/skills.js');

const tests = [
  { name: 'basic', url: '/api/skills?languages=js,ts,python&frameworks=react,nextjs,vue&tools=git,docker&theme=darkmode&includeNames=true&perline=4' },
  { name: 'minimal', url: '/api/skills?languages=js,ts' },
  { name: 'unknown-icon', url: '/api/skills?frameworks=git' },
  { name: 'all-categories', url: '/api/skills?languages=js,ts,python,go,rust&frameworks=react,vue,svelte&databases=postgresql,mongodb,redis&cloud=aws,vercel,cloudflare&theme=nautilus&includeNames=true&perline=5' },
];

const fs = require('fs');
const path = require('path');
const outDir = '/home/claude/widgetbox-clone/test-output';
if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

(async () => {
  for (const t of tests) {
    let statusCode = 200;
    let body = '';
    const headers = {};
    const req = {
      url: t.url,
      headers: { host: 'localhost:3000' },
    };
    const res = {
      setHeader: (k, v) => { headers[k] = v; },
      status: (code) => { statusCode = code; return res; },
      send: (b) => { body = b; },
      json: (obj) => { body = JSON.stringify(obj, null, 2); },
    };
    handler(req, res);
    const filename = path.join(outDir, `${t.name}.svg`);
    fs.writeFileSync(filename, body);
    console.log(`[${t.name}] status=${statusCode} bytes=${body.length} -> ${filename}`);
  }
})();
