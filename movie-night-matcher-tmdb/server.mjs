// Dependency-free localhost server. Credentials never go to the browser.
import http from 'node:http';
import {readFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
const root=path.dirname(fileURLToPath(import.meta.url));
let env='';try{env=await readFile(path.join(root,'.env'),'utf8')}catch{}
for(const line of env.split(/\r?\n/)){const m=line.match(/^\s*([A-Z_]+)\s*=\s*(.*?)\s*$/);if(m&&!process.env[m[1]])process.env[m[1]]=m[2].replace(/^(['"])(.*)\1$/,'$2')}
const token=process.env.TMDB_READ_TOKEN||'',key=process.env.TMDB_API_KEY||'';
const valid=v=>v&&!v.startsWith('PASTE_');
const files=new Set(['index.html','styles.css','app.js','manifest.json','sw.js','icon-192.png','icon-512.png']);
const types={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.json':'application/json','.png':'image/png'};
function json(res,status,body){res.writeHead(status,{'Content-Type':'application/json','Cache-Control':'no-store'});res.end(JSON.stringify(body))}
export async function handle(req,res){
 if(req.method!=='GET')return json(res,405,{error:'Only GET is supported.'});
 const url=new URL(req.url,'http://localhost');
 if(url.pathname.startsWith('/api/')){
  const route=url.pathname.slice(5);
  if(!/^(genre\/movie\/list|discover\/movie|search\/(movie|person|keyword)|movie\/\d+)$/.test(route))return json(res,404,{error:'Unknown API route.'});
  if(!valid(token)&&!valid(key))return json(res,503,{error:'Add your TMDB token or API key to .env, then restart the server.'});
  const upstream=new URL('https://api.themoviedb.org/3/'+route);
  const allowed=new Set(['language','page','query','include_adult','sort_by','vote_average.gte','vote_count.gte','with_genres','with_cast','with_keywords','without_keywords','with_runtime.lte','append_to_response']);
  for(const [k,v]of url.searchParams)if(allowed.has(k))upstream.searchParams.set(k,v);
  upstream.searchParams.set('include_adult','false');
  const headers={accept:'application/json'};if(valid(token))headers.Authorization='Bearer '+token;else upstream.searchParams.set('api_key',key);
  try{const response=await fetch(upstream,{headers,signal:AbortSignal.timeout(15000)});if(!response.ok)return json(res,response.status,{error:response.status===401?'TMDB rejected your credentials. Check .env and restart.':response.status===429?'TMDB rate limit reached. Please wait and retry.':'TMDB request failed ('+response.status+').'});json(res,200,await response.json())}catch{return json(res,502,{error:'Could not reach TMDB. Check your internet connection and retry.'})}return;
 }
 const name=url.pathname==='/'?'index.html':url.pathname.slice(1);if(!files.has(name))return json(res,404,{error:'Not found.'});
 try{const bytes=await readFile(path.join(root,'public',name));res.writeHead(200,{'Content-Type':types[path.extname(name)]||'application/octet-stream','Cache-Control':'no-cache'});res.end(bytes)}catch{json(res,404,{error:'File not found.'})}
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){const port=Number(process.env.PORT)||3000;http.createServer(handle).listen(port,'0.0.0.0',()=>console.log(`Movie Night Matcher: http://localhost:${port}\nPress Ctrl+C to stop.`))}
