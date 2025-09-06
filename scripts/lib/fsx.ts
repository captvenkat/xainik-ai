import fs from "fs"; import path from "path";
export const read = (p:string)=>fs.readFileSync(p,"utf8");
export const exists = (p:string)=>fs.existsSync(p);
export const write = (p:string,d:string)=>{ fs.mkdirSync(path.dirname(p),{recursive:true}); fs.writeFileSync(p,d); };
export const ensure = (p:string,d:string)=>{ if(!exists(p)) write(p,d); };
