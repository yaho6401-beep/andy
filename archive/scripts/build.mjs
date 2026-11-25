import {build} from 'esbuild';
import {mkdir,readFile,writeFile,copyFile,readdir} from 'node:fs/promises';
await mkdir('dist',{recursive:true});
await build({entryPoints:['src/main.js'],outdir:'dist',bundle:true,splitting:true,format:'esm',platform:'browser',target:['es2022'],minify:true});
await mkdir('dist/workshop',{recursive:true});
await build({entryPoints:['../workshop/main.js'],outdir:'dist/workshop',bundle:true,format:'esm',platform:'browser',target:['es2022'],minify:true});
for(const file of ['index.html','styles.css'])await copyFile('../workshop/'+file,'dist/workshop/'+file);
await mkdir('dist/beyond',{recursive:true});
await build({entryPoints:['beyond/main.js'],outdir:'dist/beyond',bundle:true,format:'esm',platform:'browser',target:['es2022'],minify:true});
for(const file of ['index.html','styles.css','base.css'])await copyFile('beyond/'+file,'dist/beyond/'+file);
await mkdir('dist/v3',{recursive:true});await writeFile('dist/v3/index.html','<!doctype html><meta charset="utf-8"><title>책과향기 3.0</title><script>location.replace(new URLSearchParams(location.search).get("world")==="beyond"?"/beyond/":"/archive/");</script><a href="/beyond/">문장 너머로</a>');
let html=await readFile('index.html','utf8');html=html.replace(/<script type="importmap">[\s\S]*?<\/script>/,'').replace('src="./src/main.js"','src="./main.js"');await writeFile('dist/index.html',html);await copyFile('styles.css','dist/styles.css');await copyFile('social.css','dist/social.css');await copyFile('campfire.css','dist/campfire.css');await copyFile('compact-ui.css','dist/compact-ui.css');await copyFile('world-shell.css','dist/world-shell.css');await copyFile('museum.css','dist/museum.css');await copyFile('world-shell.css','dist/beyond/world-shell.css');console.log('Archive browser bundle prepared; connection mode is selected by deployment configuration.');

await mkdir('dist/camp',{recursive:true});await copyFile('camp/bible-glossary.json','dist/camp/bible-glossary.json');
await mkdir('dist/camp/reading',{recursive:true});for(const name of await readdir('camp/reading'))if(name.endsWith('.json'))await copyFile('camp/reading/'+name,'dist/camp/reading/'+name);
