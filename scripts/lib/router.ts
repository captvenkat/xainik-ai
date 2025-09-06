import { exists, ensure } from "./fsx";
export function ensureApiRoute(routePath:string, code:string){ if(!exists(routePath)) ensure(routePath, code); }
