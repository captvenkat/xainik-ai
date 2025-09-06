import { sh } from "./exec";
export function commit(message:string){ sh("git add -A"); sh(`git -c user.name="Build Captain" -c user.email="bot@xainik.com" commit -m "${message}" || true`); }
export function branchSafe(name:string){ const b = `captain/${name}`; sh(`git checkout -B ${b}`); return b; }
