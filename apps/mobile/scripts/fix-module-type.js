/**
 * Post-build script to add type="module" to entry script
 * Fixes "Cannot use 'import.meta' outside a module" error
 */

const fs = require('fs');
const path = require('path');

const distPath = path.join(__dirname, '..', 'dist');
const indexPath = path.join(distPath, 'index.html');

console.log('Fixing module type in index.html...');

if (!fs.existsSync(indexPath)) {
  console.error('Error: index.html not found at', indexPath);
  process.exit(1);
}

let html = fs.readFileSync(indexPath, 'utf8');

// Fix the entry script to use type="module"
// Pattern: <script src="/_expo/static/js/web/entry-*.js" defer></script>
const scriptPattern = /<script src="(\/_expo\/static\/js\/web\/entry-[^"]+\.js)" defer><\/script>/g;

if (scriptPattern.test(html)) {
  html = html.replace(
    scriptPattern,
    '<script type="module" src="$1"></script>'
  );
  console.log('✓ Added type="module" to entry script');
} else {
  console.log('⚠ Entry script pattern not found, checking alternate patterns...');

  // Try alternate pattern without defer
  const altPattern = /<script src="(\/_expo\/static\/js\/web\/entry-[^"]+\.js)"><\/script>/g;
  if (altPattern.test(html)) {
    html = html.replace(
      altPattern,
      '<script type="module" src="$1"></script>'
    );
    console.log('✓ Added type="module" to entry script (alt pattern)');
  }
}

// Also fix any other static route scripts
const staticRoutePattern = /<script src="(\/_expo\/static\/js\/web\/[^"]+\.js)" defer><\/script>/g;
html = html.replace(
  staticRoutePattern,
  '<script type="module" src="$1"></script>'
);

fs.writeFileSync(indexPath, html);
console.log('✓ Saved updated index.html');

// Also process all other HTML files in dist
const htmlFiles = findHtmlFiles(distPath);
console.log(`\nProcessing ${htmlFiles.length} HTML files...`);

htmlFiles.forEach(file => {
  if (file === indexPath) return;

  let content = fs.readFileSync(file, 'utf8');
  const originalContent = content;

  content = content.replace(
    /<script src="([^"]+\.js)" defer><\/script>/g,
    '<script type="module" src="$1"></script>'
  );

  if (content !== originalContent) {
    fs.writeFileSync(file, content);
    console.log('  ✓', path.relative(distPath, file));
  }
});

console.log('\n✓ Module type fix complete!');

function findHtmlFiles(dir) {
  const results = [];
  const items = fs.readdirSync(dir);

  for (const item of items) {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      results.push(...findHtmlFiles(fullPath));
    } else if (item.endsWith('.html')) {
      results.push(fullPath);
    }
  }

  return results;
}
