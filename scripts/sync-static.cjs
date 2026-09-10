const fs = require("fs");
const path = require("path");

function copyDirRecursive(src, dest) {
  if (!fs.existsSync(src)) return;
  if (!fs.existsSync(dest)) fs.mkdirSync(dest, { recursive: true });

  const entries = fs.readdirSync(src, { withFileTypes: true });
  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);

    if (entry.isDirectory()) {
      copyDirRecursive(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

// 1. 同步 public 目录到 .next 根目录
copyDirRecursive("public", ".next");

// 2. 将 .next/server/app 下生成的静态 html/rsc/json 同步到 .next 根目录
copyDirRecursive(".next/server/app", ".next");

// 3. 为每个 .html 生成对应的 /index.html，确保 Cloudflare Pages 干净 URL 路由 100% 命中
function ensurePrettyRoutes(dir) {
  if (!fs.existsSync(dir)) return;
  const files = fs.readdirSync(dir, { withFileTypes: true });

  for (const file of files) {
    const fullPath = path.join(dir, file.name);
    if (file.isDirectory()) {
      ensurePrettyRoutes(fullPath);
    } else if (file.name.endsWith(".html") && !file.name.endsWith("index.html") && !file.name.startsWith("_")) {
      const pageName = file.name.replace(/\.html$/, "");
      const targetDir = path.join(dir, pageName);
      if (!fs.existsSync(targetDir)) {
        fs.mkdirSync(targetDir, { recursive: true });
      }
      fs.copyFileSync(fullPath, path.join(targetDir, "index.html"));
    }
  }
}

ensurePrettyRoutes(".next");
console.log("SUCCESS: Synced all prerendered static pages to .next with clean index.html routes.");
