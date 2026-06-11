const fs = require('fs');
const path = require('path');

const indexPath = path.join(process.cwd(), 'www', 'index.html');
const assetVersion = process.env.CHATCASE_ASSET_VERSION || `chatcase-${Date.now()}`;
const versionedAssets = [
  'styles.css',
  'runtime.js',
  'polyfills-es5.js',
  'polyfills.js',
  'scripts.js',
  'vendor.js',
  'main.js',
  'common.js',
  'assets/chatcase-pdf-preview.js',
];

const escapeRegExp = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

let html = fs.readFileSync(indexPath, 'utf8');

for (const asset of versionedAssets) {
  const assetPattern = escapeRegExp(asset);
  html = html.replace(new RegExp(`${assetPattern}(?:\\?v=[^"']*)?`, 'g'), `${asset}?v=${assetVersion}`);
}

fs.writeFileSync(indexPath, html);
