import {copyFile,mkdir} from 'node:fs/promises';
for(const f of ['server/member-core.mjs','server/member-service.mjs','reading-notebook-model.js']){
 const target='../supabase/functions/workshop-account/shared/'+f;
 await mkdir(target.slice(0,target.lastIndexOf('/')),{recursive:true});await copyFile('../'+f,target);
}
console.log('Private member record validation synchronized.');
