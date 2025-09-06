import { execSync } from "child_process";
export function sh(cmd:string, opts:{cwd?:string}={}){ return execSync(cmd,{stdio:"pipe",encoding:"utf8",...opts}); }
export function trySh(cmd:string){ try{ return sh(cmd);}catch(e:any){ return e?.stdout || e?.message; } }
