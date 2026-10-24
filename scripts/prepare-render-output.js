const fs = require("fs");
const path = require("path");

function copyRecursiveSync(src, dest) {
  if (!fs.existsSync(src)) return;
  const stats = fs.statSync(src);
  if (stats.isDirectory()) {
    if (!fs.existsSync(dest)) {
      fs.mkdirSync(dest, { recursive: true });
    }
    fs.readdirSync(src).forEach((childItem) => {
      copyRecursiveSync(path.join(src, childItem), path.join(dest, childItem));
    });
  } else {
    const parentDir = path.dirname(dest);
    if (!fs.existsSync(parentDir)) {
      fs.mkdirSync(parentDir, { recursive: true });
    }
    fs.copyFileSync(src, dest);
  }
}

function prepareOutputDir(targetDirName) {
  const rootDir = process.cwd();
  const targetDir = path.join(rootDir, targetDirName);
  const nextAppDir = path.join(rootDir, ".next", "server", "app");
  const nextStaticDir = path.join(rootDir, ".next", "static");
  const publicDir = path.join(rootDir, "public");

  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
  }

  // 1. Copy public directory assets
  if (fs.existsSync(publicDir)) {
    copyRecursiveSync(publicDir, targetDir);
  }

  // 2. Copy compiled static pages from .next/server/app
  if (fs.existsSync(nextAppDir)) {
    copyRecursiveSync(nextAppDir, targetDir);
  }

  // 3. Copy .next/static into targetDir/_next/static
  if (fs.existsSync(nextStaticDir)) {
    const targetNextStatic = path.join(targetDir, "_next", "static");
    copyRecursiveSync(nextStaticDir, targetNextStatic);
  }

  // 4. Ensure index.html and clean route subdirectories exist
  const pages = ["cart", "bracelet", "italy-bracelet", "custom-bracelet", "admin", "admin-panel"];
  pages.forEach((page) => {
    const pageHtml = path.join(targetDir, `${page}.html`);
    const pageDir = path.join(targetDir, page);
    const pageIndexHtml = path.join(pageDir, "index.html");
    if (fs.existsSync(pageHtml)) {
      if (!fs.existsSync(pageDir)) {
        fs.mkdirSync(pageDir, { recursive: true });
      }
      fs.copyFileSync(pageHtml, pageIndexHtml);
    }
  });

  console.log(`[prepare-render-output] Successfully prepared directory: ${targetDirName}`);
}

// Generate BOTH dist and build so any Render Publish Directory setting succeeds immediately!
prepareOutputDir("dist");
prepareOutputDir("build");
