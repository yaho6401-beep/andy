import {cp,mkdir,readdir,readFile,writeFile} from 'node:fs/promises';import {resolve} from 'node:path';
const base=resolve('..'),out=resolve(base,'.release/customer-demo');await mkdir(out,{recursive:true});
for(const f of await readdir(base,{withFileTypes:true})){if(f.isFile()&&/\.(html|css|js|json)$/.test(f.name))await cp(resolve(base,f.name),resolve(out,f.name));}
for(const dir of ['assets','data','locales'])await cp(resolve(base,dir),resolve(out,dir),{recursive:true});
await mkdir(resolve(out,'supabase/functions/feedback-wall'),{recursive:true});await cp(resolve(base,'supabase/functions/feedback-wall/runner-engine.js'),resolve(out,'supabase/functions/feedback-wall/runner-engine.js'));
await cp(resolve('dist'),resolve(out,'archive'),{recursive:true});
const configPath=resolve(out,'vercel.json');const config=JSON.parse(await readFile(configPath,'utf8'));config.buildCommand=null;config.outputDirectory='.';await writeFile(configPath,JSON.stringify(config));
const page=resolve(out,'archive/index.html');let h=await readFile(page,'utf8');h=h.replace('<head>','<head><script>globalThis.ArchiveDemoConfig={mode:"public-demo"};</script>');await writeFile(page,h);console.log('Public static release ready at '+out);
