import {mkdir,copyFile} from 'node:fs/promises';
for(const file of ['server/member-core.mjs','server/member-service.mjs','workshop/model.js','archive/src/scent-exhibits.js','archive/src/blind-exhibit-copy.js']){const target='../supabase/functions/workshop-account/shared/'+file;await mkdir(target.slice(0,target.lastIndexOf('/')),{recursive:true});await copyFile('../'+file,target);}
console.log('Member service dependencies synchronized.');
