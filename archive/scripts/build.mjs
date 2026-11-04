import {build} from 'esbuild';
import {mkdir,readFile,writeFile,copyFile} from 'node:fs/promises';
await mkdir('dist',{recursive:true});
await build({entryPoints:{main:'src/main.js','camp/main':'camp/main.js'},outdir:'dist',bundle:true,splitting:true,format:'esm',platform:'browser',target:['es2022'],minify:true});
let html=await readFile('index.html','utf8');html=html.replace(/<script type="importmap">[\s\S]*?<\/script>/,'').replace('src="./src/main.js"','src="./main.js"');await writeFile('dist/index.html',html);await copyFile('styles.css','dist/styles.css');await copyFile('social.css','dist/social.css');console.log('Archive browser bundle prepared; connection mode is selected by deployment configuration.');

await mkdir('dist/camp',{recursive:true});
let campHtml=await readFile('camp/index.html','utf8');
campHtml=campHtml.replace(/<script type="importmap">[\s\S]*?<\/script>/,'');
await writeFile('dist/camp/index.html',campHtml);
await copyFile('camp/styles.css','dist/camp/styles.css');
