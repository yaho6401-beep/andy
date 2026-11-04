import {mkdir,copyFile} from 'node:fs/promises';
const root='../supabase/functions/archive-reading-preview/shared';await mkdir(root,{recursive:true});
for(const file of ['reading-service.mjs','reading-data.js'])await copyFile('camp/'+file,root+'/'+file);
console.log('Reading-only preview prepared; live and social functions unchanged.');
