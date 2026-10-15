const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const output = path.join(root, 'public');
fs.rmSync(output, { recursive: true, force: true });
fs.mkdirSync(output, { recursive: true });

for (const entry of ['index.html', 'config.json', 'css', 'js', 'data', 'images']) {
  fs.cpSync(path.join(root, entry), path.join(output, entry), { recursive: true });
}

for (const entry of ['audio', 'videos', '_redirects', '_headers', 'favicon.ico', 'robots.txt', 'sitemap.xml']) {
  const source = path.join(root, entry);
  if (fs.existsSync(source)) {
    fs.cpSync(source, path.join(output, entry), { recursive: true });
  }
}
