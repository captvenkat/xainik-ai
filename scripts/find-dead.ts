import {glob} from 'glob'; 
import fs from 'fs'; 
import path from 'path';

async function findDeadFiles() {
  const files = await glob(['app/**/*.{ts,tsx}', 'src/**/*.{ts,tsx}','!**/*.d.ts']);
  const map = new Map<string,string>(); 
  files.forEach(f=>map.set(path.resolve(f), fs.readFileSync(f,'utf8')));

  const used = new Set<string>();
  for(const [f,code] of map.entries()){
    for(const m of code.matchAll(/from ['"](.+?)['"]/g)){
      const imp = m[1]; 
      if(!imp.startsWith('.')) continue;
      const target = path.resolve(path.dirname(f), imp);
      for(const [cand] of map.entries()) if(cand.startsWith(target)) used.add(cand);
    }
  }

  const all = [...map.keys()];
  const roots = all.filter(f=>/app\/(page|layout)\.tsx$/.test(f));
  roots.forEach(r=>used.add(r));

  const unused = all.filter(f=>!used.has(f));
  if(unused.length){ 
    console.log('Possibly unused:\n'+unused.join('\n')); 
  } else {
    console.log('No obvious dead files.');
  }
}

findDeadFiles().catch(console.error);
