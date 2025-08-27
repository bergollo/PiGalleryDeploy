#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const fsp = fs.promises;
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const FRONTEND = path.join(ROOT, 'packages', 'frontend');
const STAGING = path.join(ROOT, 'build', 'staging', 'frontend');

function run(cmd, opts = {}) {
  console.log(`> ${cmd}`);
  execSync(cmd, { stdio: 'inherit', ...opts });
}

async function rimraf(dir) {
  try { await fsp.rm(dir, { recursive: true, force: true }); } catch (e) {}
}

async function copyRecursive(src, dest) {
  // simple recursive copy using fs.cp when available, otherwise fallback
  if (fsp.cp) {
    await fsp.mkdir(path.dirname(dest), { recursive: true });
    await fsp.cp(src, dest, { recursive: true });
    return;
  }
  // fallback
  const stat = await fsp.stat(src);
  if (stat.isDirectory()) {
    await fsp.mkdir(dest, { recursive: true });
    const items = await fsp.readdir(src);
    await Promise.all(items.map(item => copyRecursive(path.join(src, item), path.join(dest, item))));
  } else {
    await fsp.mkdir(path.dirname(dest), { recursive: true });
    await fsp.copyFile(src, dest);
  }
}

(async () => {
  try {
    // ensure node_modules present (optional)
    if (!fs.existsSync(path.join(FRONTEND, 'node_modules'))) {
      console.log('Installing frontend deps...');
      run(`cd ${FRONTEND} && npm ci`);
    }

    // build frontend
    console.log('Building frontend (packages/frontend)...');
    run(`cd ${FRONTEND} && npm run build`);

    // clean staging
    await rimraf(STAGING);
    await fsp.mkdir(STAGING, { recursive: true });

    // Determine build outputs to copy
    const nextDir = path.join(FRONTEND, '.next');
    const outDir = path.join(FRONTEND, 'out'); // next export
    const publicDir = path.join(FRONTEND, 'public');

    if (fs.existsSync(nextDir)) {
      console.log('Copying .next -> staging');
      await copyRecursive(nextDir, path.join(STAGING, '.next'));
    } else if (fs.existsSync(outDir)) {
      console.log('Copying out (static export) -> staging');
      await copyRecursive(outDir, path.join(STAGING, 'out'));
    } else {
      throw new Error('No build output found (.next or out). Ensure build succeeded.');
    }

    if (fs.existsSync(publicDir)) {
      console.log('Copying public -> staging/public');
      await copyRecursive(publicDir, path.join(STAGING, 'public'));
    }

    // copy package.json and next.config.js if server needs them at runtime
    const filesToCopy = ['package.json', 'next.config.js'];
    for (const f of filesToCopy) {
      const src = path.join(FRONTEND, f);
      if (fs.existsSync(src)) {
        await copyRecursive(src, path.join(STAGING, f));
      }
    }

    console.log(`Frontend packaged into: ${STAGING}`);
    console.log('Done.');
  } catch (err) {
    console.error('Error packaging frontend:', err);
    process.exit(1);
  }
})();
