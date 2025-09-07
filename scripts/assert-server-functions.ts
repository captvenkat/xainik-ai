const fs = require('fs');
const paths = [
  '.next/server/app/api/health/route.js',
  '.next/server/app/api/health/route.mjs',
  '.next/server/app/api/health/route/index.js',
];
if (!paths.some(p => fs.existsSync(p))) { console.error('No server function for /api/health in build output'); process.exit(1); }
console.log('Server function present for /api/health');
