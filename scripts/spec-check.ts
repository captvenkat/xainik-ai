import fs from 'fs'; 
import YAML from 'yaml';

const spec = YAML.parse(fs.readFileSync('docs/SPEC.yaml','utf8'));
const prisma = fs.readFileSync('prisma/schema.prisma','utf8');
const contracts = fs.readFileSync('src/lib/contracts.ts','utf8');

function hasModel(m:string){ return new RegExp(`model\\s+${m}\\s+{`).test(prisma); }
function modelBody(m:string){ const x = prisma.match(new RegExp(`model\\s+${m}\\s+{([\\s\\S]*?)}`)); return x?.[1]||''; }
function hasField(m:string,f:string){ return new RegExp(`\\b${f}\\b`).test(modelBody(m)); }
function hasZod(n:string){ return new RegExp(`export\\s+const\\s+${n}\\s*=\\s*z\\.object\\(`).test(contracts); }

const errs:string[]=[];
for(const [m,def] of Object.entries<any>(spec.models||{})){
  if(!hasModel(m)) errs.push(`Missing Prisma model: ${m}`);
  else for(const f of (def.fields||[])) if(!hasField(m,f)) errs.push(`Missing Prisma field: ${m}.${f}`);
}
for(const [n,_] of Object.entries<any>(spec.contracts||{})) if(!hasZod(n)) errs.push(`Missing Zod contract: ${n}`);

if(errs.length){ console.error('SPEC CHECK FAILED:\n- '+errs.join('\n- ')); process.exit(1); }
console.log('Spec check OK');
