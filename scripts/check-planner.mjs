import {spawnSync} from 'node:child_process';
import {mkdirSync,writeFileSync} from 'node:fs';
mkdirSync('.sites-runtime/planner-test',{recursive:true});
const compile=spawnSync(process.execPath,['node_modules/typescript/bin/tsc','lib/catalog.ts','lib/planner.ts','--outDir','.sites-runtime/planner-test','--module','commonjs','--target','ES2022','--esModuleInterop','--skipLibCheck','--noEmit','false','--types','node'],{stdio:'inherit'});
if(compile.status!==0)process.exit(compile.status??1);
writeFileSync('.sites-runtime/planner-test/package.json','{"type":"commonjs"}');
const test=spawnSync(process.execPath,['--test','tests/planner.test.cjs'],{stdio:'inherit'});
process.exit(test.status??1);
