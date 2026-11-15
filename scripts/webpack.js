'use strict';

const { spawnSync } = require('child_process');

// Webpack 4 hashes with md4. Node 17+ refuses that algorithm unless the
// process is started with --openssl-legacy-provider.
const [bin, ...args] = process.argv.slice(2);

if (!bin) {
  console.error('Usage: node scripts/webpack.js <webpack-bin> [args...]');
  process.exit(1);
}

const nodeMajor = Number(process.versions.node.split('.')[0]);
const nodeArgs = [];
if (nodeMajor >= 17) {
  nodeArgs.push('--openssl-legacy-provider');
}

const result = spawnSync(process.execPath, [...nodeArgs, bin, ...args], {
  stdio: 'inherit',
});

if (result.error) {
  console.error(result.error);
  process.exit(1);
}

process.exit(result.status === null ? 1 : result.status);
