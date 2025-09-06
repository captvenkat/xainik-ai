import { sh, trySh } from "./exec";
export function migrateStatus(){ return trySh("pnpm prisma migrate status"); }
export function migrateDeploy(){ return sh("pnpm prisma migrate deploy"); }
export function generate(){ return sh("pnpm prisma generate"); }
