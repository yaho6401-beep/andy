import {mkdir,copyFile} from 'node:fs/promises';
const files=['camp/service.mjs','camp/store.mjs','camp/layout.js','server/room-store.mjs','server/social.mjs','server/persistence.mjs','src/protocol.js','src/seats.js','src/content.js','src/cafe-data.js'];
for(const file of files){const target='../supabase/functions/archive-camp-preview/shared/'+file;await mkdir(target.slice(0,target.lastIndexOf('/')),{recursive:true});await copyFile(file,target);}
console.log('Isolated camp preview dependencies synchronized; archive-live unchanged.');
