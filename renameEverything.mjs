import { readdirSync, statSync, readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

const ROOT = 'c:/Users/User/Documents/Aetheris';
const IGNORE_DIRS = ['node_modules', '.git', 'runs', 'docs'];
const INCLUDE_EXTS = ['.mjs', '.js', '.json', '.html', '.md', '.yml'];

function walkDir(dir, callback) {
  const files = readdirSync(dir);
  for (const f of files) {
    const fullPath = join(dir, f);
    if (IGNORE_DIRS.includes(f) && statSync(fullPath).isDirectory()) continue;
    if (statSync(fullPath).isDirectory()) {
      walkDir(fullPath, callback);
    } else {
      callback(fullPath);
    }
  }
}

let modifiedCount = 0;

walkDir(ROOT, (filePath) => {
  if (!INCLUDE_EXTS.some(ext => filePath.endsWith(ext))) return;

  const content = readFileSync(filePath, 'utf8');
  let newContent = content;

  // Replace all case variations
  newContent = newContent.replace(/VERITAS/g, 'VERITAS');
  newContent = newContent.replace(/Veritas/g, 'Veritas');
  newContent = newContent.replace(/veritas/g, 'veritas');
  
  // Clean up any double spaces that might have occurred from previous manual edits if we want, but just renaming is fine.
  // Exception handling for specific links:
  newContent = newContent.replace(/github\.com\/calesthio\/Veritas/g, 'github.com/calesthio/Crucix'); // restore the github link

  if (newContent !== content) {
    writeFileSync(filePath, newContent, 'utf8');
    console.log(`Updated: ${filePath}`);
    modifiedCount++;
  }
});

console.log(`Global rename complete. Modified ${modifiedCount} files.`);
