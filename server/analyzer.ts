import fs from 'fs';
import path from 'path';

function findFiles(dir: string, fileList: string[] = []) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const filePath = path.join(dir, file);
    if (fs.statSync(filePath).isDirectory()) {
      findFiles(filePath, fileList);
    } else if (filePath.endsWith('.ts')) {
      fileList.push(filePath);
    }
  }
  return fileList;
}

const files = findFiles('src');

const inventory = {
  routes: [] as string[],
  controllers: [] as string[],
  services: [] as string[],
  repositories: [] as string[],
  middlewares: [] as string[],
  shared: [] as string[],
  models: [] as string[],
  other: [] as string[]
};

const callGraph: Record<string, string[]> = {};
const externalDeps: Set<string> = new Set();
const envVars: Set<string> = new Set();

files.forEach(file => {
  const content = fs.readFileSync(file, 'utf-8');
  
  if (file.includes('routes/')) inventory.routes.push(file);
  else if (file.includes('controllers/')) inventory.controllers.push(file);
  else if (file.includes('services/')) inventory.services.push(file);
  else if (file.includes('repositories/')) inventory.repositories.push(file);
  else if (file.includes('middleware/')) inventory.middlewares.push(file);
  else if (file.includes('utils/') || file.includes('config/')) inventory.shared.push(file);
  else if (file.includes('models/')) inventory.models.push(file);
  else inventory.other.push(file);

  // Find external imports
  const importRegex = /import\s+.*?\s+from\s+['"]([^'"]+)['"]/g;
  let match;
  while ((match = importRegex.exec(content)) !== null) {
    const dep = match[1];
    if (!dep.startsWith('.') && !dep.startsWith('@/')) {
      externalDeps.add(dep);
    } else {
      if (!callGraph[file]) callGraph[file] = [];
      callGraph[file].push(dep);
    }
  }

  // Find env vars
  const envRegex = /process\.env\.([A-Z0-9_]+)/g;
  while ((match = envRegex.exec(content)) !== null) {
    envVars.add(match[1]);
  }
});

let md = '# 01 - Inventory\n\n## 1. File List\n';
md += '### Routes\n' + inventory.routes.map(f => `- ${f}`).join('\n') + '\n\n';
md += '### Controllers\n' + inventory.controllers.map(f => `- ${f}`).join('\n') + '\n\n';
md += '### Services\n' + inventory.services.map(f => `- ${f}`).join('\n') + '\n\n';
md += '### Repositories\n' + inventory.repositories.map(f => `- ${f}`).join('\n') + '\n\n';
md += '### Middleware\n' + inventory.middlewares.map(f => `- ${f}`).join('\n') + '\n\n';
md += '### Shared Utilities\n' + inventory.shared.map(f => `- ${f}`).join('\n') + '\n\n';
md += '### Models\n' + inventory.models.map(f => `- ${f}`).join('\n') + '\n\n';
md += '### Other\n' + inventory.other.map(f => `- ${f}`).join('\n') + '\n\n';

md += '## 2. Module Dependencies (Call Graph approximation)\n';
for (const [file, deps] of Object.entries(callGraph)) {
  md += `- **${file}** depends on:\n`;
  const uniqueDeps = [...new Set(deps)];
  uniqueDeps.forEach(d => md += `  - ${d}\n`);
}
md += '\n';

md += '## 3. External Dependencies\n';
[...externalDeps].sort().forEach(d => md += `- ${d}\n`);
md += '\n';

md += '## 4. Environment Variables\n';
[...envVars].sort().forEach(d => md += `- ${d}\n`);

fs.mkdirSync('../docs/reverse-engineered/express-api', { recursive: true });
fs.writeFileSync('../docs/reverse-engineered/express-api/01-inventory.md', md);
console.log('Done 01');
