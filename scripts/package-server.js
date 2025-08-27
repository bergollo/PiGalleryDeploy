#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const fsp = fs.promises;
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const SERVER = path.join(ROOT, 'packages', 'server');
const FRONTEND_STAGING = path.join(ROOT, 'build', 'staging', 'frontend');
const STAGING = path.join(ROOT, 'build', 'staging', 'server');
const BUILD_DIR = path.join(ROOT, 'build');

function run(cmd, opts = {}) {
  console.log(`> ${cmd}`);
  execSync(cmd, { stdio: 'inherit', ...opts });
}

async function rimraf(dir) {
  try { await fsp.rm(dir, { recursive: true, force: true }); } catch (e) {}
}

async function copyRecursive(src, dest) {
  if (fsp.cp) {
    await fsp.mkdir(path.dirname(dest), { recursive: true });
    await fsp.cp(src, dest, { recursive: true });
    return;
  }
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

async function copyDirContents(srcDir, destDir) {
  if (!fs.existsSync(srcDir)) return;
  await fsp.mkdir(destDir, { recursive: true });
  const items = await fsp.readdir(srcDir);
  for (const item of items) {
    await copyRecursive(path.join(srcDir, item), path.join(destDir, item));
  }
}

(async () => {
  try {
    // cleanup staging
    await rimraf(STAGING);
    await fsp.mkdir(STAGING, { recursive: true });

    // copy server source (excluding node_modules)
    console.log('Copying server source to staging...');
    const exclude = ['node_modules', 'build', '.git', 'coverage', 'dist'];
    const items = await fsp.readdir(SERVER);
    for (const item of items) {
      if (exclude.includes(item)) continue;
      await copyRecursive(path.join(SERVER, item), path.join(STAGING, item));
    }

    // install production dependencies inside staging
    // copy package.json and package-lock.json/yarn.lock if present
    const hasPackageLock = fs.existsSync(path.join(STAGING, 'package-lock.json'));
    const hasYarnLock = fs.existsSync(path.join(STAGING, 'yarn.lock'));
    // run npm ci --production in staging to get pruned node_modules
    console.log('Installing production dependencies in staging (npm ci --production)...');
    // Ensure package-lock.json exists for deterministic install; if not, npm ci will fail, fallback to npm install --production
    if (hasPackageLock) {
      run(`cd ${STAGING} && npm ci --production`);
    } else {
      run(`cd ${STAGING} && npm install --production`);
    }

    // ensure log / runtime dirs exist and are writable by service user (Ansible may adjust permissions later)
    const runtimeDirs = ['logs', 'data', 'uploads'];
    for (const d of runtimeDirs) {
      const p = path.join(STAGING, d);
      await fsp.mkdir(p, { recursive: true });
    }

    // copy frontend staging into server public (if exists)
    const serverPublic = path.join(STAGING, 'public');
    if (fs.existsSync(FRONTEND_STAGING)) {
      console.log('Copying frontend staging into server public/');
      await fsp.mkdir(serverPublic, { recursive: true });
      // if frontend produced .next (SSR) copy into server/.next and keep public
      const frontendNext = path.join(FRONTEND_STAGING, '.next');
      const frontendOut = path.join(FRONTEND_STAGING, 'out');
      if (fs.existsSync(frontendNext)) {
        await copyDirContents(path.join(FRONTEND_STAGING, '.next'), path.join(STAGING, '.next'));
      } else if (fs.existsSync(frontendOut)) {
        // static export — copy to server/public or server/out depending on how server will serve it
        await copyDirContents(frontendOut, path.join(serverPublic));
      }
      // always copy public folder if present
      const frontendPublic = path.join(FRONTEND_STAGING, 'public');
      if (fs.existsSync(frontendPublic)) {
        await copyDirContents(frontendPublic, serverPublic);
      }
    } else {
      console.log('No frontend staging found; skipping frontend copy.');
    }

    // write a metadata file for the deploy archive
    await fsp.mkdir(BUILD_DIR, { recursive: true });
    const meta = {
      packagedAt: new Date().toISOString(),
      serverPackage: (await fsp.readFile(path.join(STAGING, 'package.json'), 'utf8')).trim().split('\n')[0]
    };
    await fsp.writeFile(path.join(BUILD_DIR, 'staging-metadata.json'), JSON.stringify(meta, null, 2));

    console.log(`Server staged at: ${STAGING}`);
    console.log('Done.');
  } catch (err) {
    console.error('Error packaging server:', err);
    process.exit(1);
  }
})();
