/**
 * GitHub Pages Subpath Path Adapter
 * Translates root-relative paths to the GitHub Pages repository subpath (/Chronotools-Github/)
 * during GitHub Actions deployment.
 */
const fs = require('fs');
const path = require('path');

const REPO_SUBPATH = '/Chronotools-Github';

function walk(dir, fileList = []) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    if (entry.name === '.git' || entry.name === 'node_modules' || entry.name === 'tests' || entry.name === 'scripts') continue;
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walk(fullPath, fileList);
    } else if (entry.isFile()) {
      const ext = path.extname(entry.name).toLowerCase();
      if (['.html', '.js', '.webmanifest', '.json'].includes(ext)) {
        fileList.push(fullPath);
      }
    }
  }
  return fileList;
}

const targetDir = process.argv[2] || '.';
const files = walk(targetDir);
let modifiedCount = 0;

for (const file of files) {
  let content = fs.readFileSync(file, 'utf8');
  const original = content;

  // Assets and icons
  content = content.replace(/src="\/assets\//g, `src="${REPO_SUBPATH}/assets/`);
  content = content.replace(/href="\/assets\//g, `href="${REPO_SUBPATH}/assets/`);
  content = content.replace(/src="\/brand-icon\.png"/g, `src="${REPO_SUBPATH}/brand-icon.png"`);
  content = content.replace(/href="\/brand-icon\.png"/g, `href="${REPO_SUBPATH}/brand-icon.png"`);
  content = content.replace(/href="\/favicon/g, `href="${REPO_SUBPATH}/favicon`);
  content = content.replace(/href="\/apple-touch-icon\.png"/g, `href="${REPO_SUBPATH}/apple-touch-icon.png"`);
  content = content.replace(/href="\/site\.webmanifest"/g, `href="${REPO_SUBPATH}/site.webmanifest"`);
  content = content.replace(/"\/android-chrome-/g, `"${REPO_SUBPATH}/android-chrome-`);

  // AI & Discovery endpoints
  content = content.replace(/href="\/llms\.txt"/g, `href="${REPO_SUBPATH}/llms.txt"`);
  content = content.replace(/href='\/llms\.txt'/g, `href='${REPO_SUBPATH}/llms.txt'`);
  content = content.replace(/href="\/index\.md"/g, `href="${REPO_SUBPATH}/index.md"`);
  content = content.replace(/href='\/index\.md'/g, `href='${REPO_SUBPATH}/index.md'`);
  content = content.replace(/href="(\/\.well-known\/[^"]*)"/g, `href="${REPO_SUBPATH}$1"`);

  // Tool directories & subpages
  content = content.replace(/href="\/market-hours\/"/g, `href="${REPO_SUBPATH}/market-hours/"`);
  content = content.replace(/href="\/weeks\/"/g, `href="${REPO_SUBPATH}/weeks/"`);
  content = content.replace(/href="\/difference\/"/g, `href="${REPO_SUBPATH}/difference/"`);
  content = content.replace(/href="\/teams\/"/g, `href="${REPO_SUBPATH}/teams/"`);
  content = content.replace(/href="\/unix\/"/g, `href="${REPO_SUBPATH}/unix/"`);
  content = content.replace(/href="\/jetlag\/"/g, `href="${REPO_SUBPATH}/jetlag/"`);
  content = content.replace(/href="\/docs\//g, `href="${REPO_SUBPATH}/docs/`);
  content = content.replace(/href="\/convert\//g, `href="${REPO_SUBPATH}/convert/`);

  // Root links
  content = content.replace(/href="\/" class="flex items-center gap-2/g, `href="${REPO_SUBPATH}/" class="flex items-center gap-2`);
  content = content.replace(/href="\/" class="btn"/g, `href="${REPO_SUBPATH}/" class="btn"`);
  content = content.replace(/href="\/" itemprop="url"/g, `href="${REPO_SUBPATH}/" itemprop="url"`);

  // JS bundle adaptations
  if (file.endsWith('.js')) {
    content = content.replace(/href:"\/llms\.txt"/g, `href:"${REPO_SUBPATH}/llms.txt"`);
    content = content.replace(/href:"\/index\.md"/g, `href:"${REPO_SUBPATH}/index.md"`);
    content = content.replace(/"\/assets\//g, `"${REPO_SUBPATH}/assets/`);
  }

  if (content !== original) {
    fs.writeFileSync(file, content, 'utf8');
    modifiedCount++;
  }
}

console.log(`[GitHub Pages Adapter] Successfully adapted ${modifiedCount} files for ${REPO_SUBPATH}`);
