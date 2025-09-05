import {glob} from 'glob'; 
import fs from 'fs';

async function checkGuards() {
  const apis = await glob(['app/api/**/*.ts','app/api/**/*.tsx']);
  const bad:string[]=[];

  for(const f of apis){
    const code = fs.readFileSync(f,'utf8');
    const postHandler = /export\s+async\s+function\s+(POST|PUT|PATCH|DELETE)/.test(code);
    const hasZod = /z\.object\(|safeParse\(|parse\(/.test(code);
    if(postHandler && !hasZod) bad.push(f);
  }

  if(bad.length){ 
    console.error('API handlers missing Zod validation:\n'+bad.join('\n')); 
    process.exit(1); 
  }
  console.log('All API handlers appear to use Zod.');
}

checkGuards().catch(console.error);
