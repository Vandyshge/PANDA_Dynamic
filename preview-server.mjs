import {createServer} from 'node:http';
import {readFile,stat} from 'node:fs/promises';
import {extname,resolve,relative,isAbsolute} from 'node:path';
import {fileURLToPath} from 'node:url';
const root=fileURLToPath(new URL('./docs/',import.meta.url));
const mime={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.png':'image/png'};
createServer(async(req,res)=>{try{let name=decodeURIComponent(new URL(req.url,'http://localhost').pathname).replace(/^\/+/, '')||'index.html';const path=resolve(root,name),rel=relative(root,path);if(rel.startsWith('..')||isAbsolute(rel)||!(await stat(path)).isFile())throw Error('404');res.writeHead(200,{'Content-Type':mime[extname(path)]||'application/octet-stream','Cache-Control':'no-store'});res.end(await readFile(path));}catch{res.writeHead(404);res.end('Not found');}}).listen(4175,'127.0.0.1',()=>console.log('PANDA Dynamic: http://127.0.0.1:4175/'));
