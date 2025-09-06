export function isProdBlocked(){ return process.env.CAPTAIN_ENV==="prod" && process.env.PRODUCTION_SAFE!=="true"; }
export function dryRun(){ return process.env.CAPTAIN_DRY_RUN==="true"; }
export function maxIterations(){ return Number(process.env.CAPTAIN_MAX_ITERATIONS || 2); }
